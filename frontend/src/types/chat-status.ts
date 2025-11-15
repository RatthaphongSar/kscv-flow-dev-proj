// frontend/src/types/chat.ts
/**
 * Chat System Type Definitions
 * Includes message status, seen receipts, and unread counts
 */

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'seen'

export interface Message {
  id: string
  roomId: string
  senderId: string
  content: string
  createdAt: string | Date
  edited?: boolean
  editedAt?: string | Date
  
  // Status fields
  status?: MessageStatus // From sender's perspective
  seenBy?: string[] // List of userIds who have seen it
  
  // Reply support
  replyTo?: {
    id: string
    user: { username: string }
    content: string
  } | null
}

export interface Room {
  id: string
  name: string
  description?: string
  type?: 'class' | 'group' | 'direct'
  createdAt?: string | Date
  members?: string[]
  
  // Unread tracking
  unreadCount?: number
  lastMessage?: Message
  lastReadMessageId?: string // Track which message was last read by current user
}

export interface ChatState {
  rooms: Room[]
  activeRoomId: string | null
  messages: Message[]
  currentUser: { id: string; username: string; role?: string } | null
  
  // Status tracking
  messageStatusMap: Map<string, MessageStatus> // messageId → status
  unreadCounts: Map<string, number> // roomId → unread count
  
  // Loading states
  loading: boolean
  error: string | null
}

export interface SocketEvents {
  // Incoming events (server → client)
  'message:new': (message: Message) => void
  'message:delivered': (data: { messageId: string; timestamp: string }) => void
  'message:seen': (data: { messageId: string; seenByUserId: string; timestamp: string }) => void
  'room:unreadCountUpdated': (data: { roomId: string; unreadCount: number }) => void
  
  // Outgoing events (client → server)
  'message:send': (data: { roomId: string; content: string; replyToId?: string }) => void
  'message:markSeen': (data: { roomId: string; messageId: string }) => void
  'room:join': (data: { roomId: string }) => void
  'room:leave': (data: { roomId: string }) => void
}
