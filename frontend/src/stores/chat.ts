import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: MessageStatus;
  edited?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  favorite?: boolean;
  typing?: boolean;
  participants: User[];
}

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  currentRoomId: string | null;
  favorites: string[];
  // Actions
  sendMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  setCurrentRoom: (roomId: string) => void;
  toggleFavorite: (roomId: string) => void;
  setTyping: (roomId: string, isTyping: boolean) => void;
  markAsRead: (roomId: string) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        rooms: [
          {
            id: 'r1',
            name: 'Emily Brontë',
            avatar: '/avatars/eb.jpg',
            unreadCount: 3,
            online: true,
            typing: false,
            participants: [
              { id: 'u1', name: 'Emily Brontë', online: true },
              { id: 'me', name: 'You' },
            ],
          },
          // Add more rooms here...
        ],
        messages: {
          r1: [
            {
              id: 'm1',
              text: "Let me know when you're free to discuss the upcoming literary festival arrangements.",
              senderId: 'u1',
              timestamp: Date.now() - 3600000,
              status: 'read',
            },
            // Add more messages...
          ],
        },
        currentRoomId: null,
        favorites: [],

        sendMessage: (message) =>
          set((state) => {
            if (!state.currentRoomId) return state;
            
            const roomMessages = state.messages[state.currentRoomId] || [];
            return {
              messages: {
                ...state.messages,
                [state.currentRoomId]: [...roomMessages, message],
              },
            };
          }),

        updateMessageStatus: (messageId, status) =>
          set((state) => {
            if (!state.currentRoomId) return state;

            const roomMessages = state.messages[state.currentRoomId];
            if (!roomMessages) return state;

            return {
              messages: {
                ...state.messages,
                [state.currentRoomId]: roomMessages.map((m) =>
                  m.id === messageId ? { ...m, status } : m
                ),
              },
            };
          }),

        setCurrentRoom: (roomId) =>
          set({ currentRoomId: roomId }),

        toggleFavorite: (roomId) =>
          set((state) => ({
            favorites: state.favorites.includes(roomId)
              ? state.favorites.filter((id) => id !== roomId)
              : [...state.favorites, roomId],
          })),

        setTyping: (roomId, isTyping) =>
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? { ...room, typing: isTyping } : room
            ),
          })),

        markAsRead: (roomId) =>
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? { ...room, unreadCount: 0 } : room
            ),
          })),
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          favorites: state.favorites,
          currentRoomId: state.currentRoomId,
        }),
      }
    )
  )
);