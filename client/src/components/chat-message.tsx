import { cn } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
  isRead?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] min-w-0 rounded-lg p-3 chat-message",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="chat-message-content">
          {message.content}
        </div>
        <div className="text-xs mt-2 opacity-70 flex items-center justify-between">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {isOwnMessage && message.isRead && (
            <span className="text-xs opacity-60 ml-2">
              Прочитано
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
