import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useRoute, Link } from 'wouter';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { ChatMessage } from '@/components/chat-message';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  hasActiveListings?: boolean;
}

interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
  isRead?: boolean;
}

interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export default function ChatPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, sendMessage: sendWebSocketMessage, subscribe } = useWebSocket();

  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ userId: string }>('/chat/:userId');
  const userId = params?.userId;

  // Fetch specific user if userId is provided
  const { data: initialUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/users/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });

  // Set initial user when loaded or URL changes
  useEffect(() => {
    if (initialUser) {
      setSelectedUser(initialUser);
    }
  }, [initialUser, userId]);

  // Reset selected user when userId changes
  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
    }
  }, [userId]);

  // Update URL when user is selected (only if not coming from URL)
  useEffect(() => {
    if (selectedUser && !userId) {
      navigate(`/chat/${selectedUser.id}`, { replace: true });
    }
  }, [selectedUser?.id, userId]);

  // Fetch messages with infinite query
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useInfiniteQuery<MessagesResponse>({
    queryKey: ['messages', selectedUser?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedUser) throw new Error('No user selected');
      const response = await apiRequest('GET', `/api/messages/${selectedUser.id}?page=${pageParam}&limit=20`);
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    enabled: !!selectedUser,
    staleTime: 0,
  });

  // Combine all loaded messages
  const loadedMessages = messagesData?.pages.flatMap(page => page.messages) || [];

  // Setup infinite scroll
  const loadMoreRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '50px'
  });

  // WebSocket event handlers
  useEffect(() => {
    const unsubscribeNewMessage = subscribe('newMessage', (data) => {
      const newMessage = data.message;
      setRealtimeMessages(prev => [...prev, newMessage]);
      
      // Mark as read if chat is open with sender
      if (selectedUser?.id === newMessage.fromUserId) {
        sendWebSocketMessage({
          type: 'markAsRead',
          fromUserId: newMessage.fromUserId
        });
      }
      
      // Scroll to bottom for new messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    const unsubscribeMessageReceived = subscribe('messageReceived', (data) => {
      const newMessage = data.message;
      setRealtimeMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom for sent messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    const unsubscribeMessagesRead = subscribe('messagesRead', (data) => {
      // Update read status for messages from current user
      setRealtimeMessages(prev => 
        prev.map(msg => 
          msg.fromUserId === currentUser?.id && msg.toUserId === data.readBy
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageReceived();
      unsubscribeMessagesRead();
    };
  }, [subscribe, selectedUser?.id, currentUser?.id, sendWebSocketMessage]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (selectedUser?.id && currentUser && isConnected) {
      sendWebSocketMessage({
        type: 'markAsRead',
        fromUserId: selectedUser.id
      });
    }
  }, [selectedUser?.id, currentUser, isConnected, sendWebSocketMessage]);

  // Fetch active conversations (users with existing messages)
  const { data: conversations = [] } = useQuery<User[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/conversations');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(user => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Combine loaded messages with real-time messages and remove duplicates
  const messages = [...loadedMessages, ...realtimeMessages].filter((message, index, arr) => 
    arr.findIndex(m => m.id === message.id) === index
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Reset realtime messages when switching chats
  useEffect(() => {
    setRealtimeMessages([]);
  }, [selectedUser?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !isFetchingNextPage) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, isFetchingNextPage]);

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedUser && isConnected) {
      sendWebSocketMessage({
        type: 'sendMessage',
        content: messageInput.trim(),
        toUserId: selectedUser.id
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* User List Section */}
          <div className="col-span-4 bg-card rounded-lg shadow-sm border h-[600px]">
            <div className="p-4 h-full flex flex-col">
              <Input
                placeholder={t('chat.searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredConversations.map((user) => (
                    <Link
                      key={user.id}
                      href={`/chat/${user.id}`}
                      className={`w-full p-3 flex items-center space-x-3 rounded-lg transition-colors block ${
                        userId && parseInt(userId) === user.id
                          ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1">
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      {user.hasActiveListings && (
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {t('chat.hasListings')}
                        </div>
                      )}
                    </Link>
                  ))}
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? t('chat.noConversationsFound') || 'No conversations found matching your search'
                        : t('chat.noConversations') || 'No conversations yet. Start a conversation by messaging someone from their animal listing.'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Chat Section */}
          <div className="col-span-8 bg-card rounded-lg shadow-sm border h-[600px]">
            {(isLoadingUser && userId) ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t('chat.loading')}
              </div>
            ) : selectedUser ? (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {getUserInitials(selectedUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 relative overflow-hidden">
                  <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4">
                      {/* Load more indicator */}
                      {hasNextPage && (
                        <div 
                          ref={loadMoreRef}
                          className="text-center py-2 text-sm text-muted-foreground"
                        >
                          {isFetchingNextPage ? 'Загрузка сообщений...' : 'Прокрутите вверх для загрузки старых сообщений'}
                        </div>
                      )}
                      
                      {isLoadingMessages ? (
                        <div className="text-center py-4 text-muted-foreground">
                          {t('chat.loadingMessages')}
                        </div>
                      ) : (
                                                <div className="space-y-4">
                          {messages.map((message) => (
                            <ChatMessage
                              key={message.id}
                              message={message}
                              isOwnMessage={message.fromUserId === currentUser?.id}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t flex-shrink-0">
                  <Input
                    placeholder={t('chat.typeMessage')}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {userId && !isLoadingUser
                  ? t('chat.userNotFound') || 'User not found'
                  : t('chat.selectUser')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 