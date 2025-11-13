import { io, Socket } from 'socket.io-client';
import { Message } from '../stores/chat';

interface ChatEvents {
  'message:send': (message: Message) => void;
  'message:received': (message: Message) => void;
  'typing:start': (roomId: string, userId: string) => void;
  'typing:stop': (roomId: string, userId: string) => void;
  'message:status': (messageId: string, status: Message['status']) => void;
}

class ChatService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.userId = userId;
    this.socket = io('http://localhost:3000', {
      auth: { userId },
      transports: ['websocket'],
    });

    this.setupEventListeners();
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  sendMessage(message: Message) {
    this.socket?.emit('message:send', message);
  }

  onMessageReceived(callback: (message: Message) => void) {
    this.socket?.on('message:received', callback);
    return () => {
      this.socket?.off('message:received', callback);
    };
  }

  startTyping(roomId: string) {
    if (!this.userId) return;
    this.socket?.emit('typing:start', roomId, this.userId);
  }

  stopTyping(roomId: string) {
    if (!this.userId) return;
    this.socket?.emit('typing:stop', roomId, this.userId);
  }

  onTypingStart(callback: (roomId: string, userId: string) => void) {
    this.socket?.on('typing:start', callback);
    return () => {
      this.socket?.off('typing:start', callback);
    };
  }

  onTypingStop(callback: (roomId: string, userId: string) => void) {
    this.socket?.on('typing:stop', callback);
    return () => {
      this.socket?.off('typing:stop', callback);
    };
  }

  updateMessageStatus(messageId: string, status: Message['status']) {
    this.socket?.emit('message:status', messageId, status);
  }

  onMessageStatusUpdate(callback: (messageId: string, status: Message['status']) => void) {
    this.socket?.on('message:status', callback);
    return () => {
      this.socket?.off('message:status', callback);
    };
  }
}

export const chatService = new ChatService();