import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection for chat
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with JWT token
      const token = localStorage.getItem('token');
      if (token && ws.current) {
        ws.current.send(JSON.stringify({
          type: 'authenticate',
          token
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        // Call registered handler for this message type
        const handler = messageHandlers.current.get(data.type);
        if (handler) {
          handler(data);
        }
        
        // Store message for debugging
        setMessages(prev => [...prev.slice(-99), data]);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const subscribe = (messageType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(messageType, handler);
    
    // Return unsubscribe function
    return () => {
      messageHandlers.current.delete(messageType);
    };
  };

  return {
    isConnected,
    sendMessage,
    subscribe,
    messages // For debugging
  };
} 