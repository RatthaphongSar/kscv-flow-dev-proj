// frontend/src/types/chat.ts
/**
 * TypeScript types for the chat system with scroll behavior
 */

/**
 * User profile in chat context
 */
export interface ChatUser {
  id: string
  username: string
  role?: 'teacher' | 'student' | 'admin'
  isTeacher?: boolean
}

/**
 * Reply context - when a message is a reply to another message
 */
export interface MessageReplyContext {
  id: string
  content: string
  user: Pick<ChatUser, 'username'>
}

/**
 * Core chat message structure
 */
export interface ChatMessage {
  id: string
  content: string
  text?: string // Alternative field name
  userId: string
  user: ChatUser
  roomId: string
  createdAt: Date | string
  updatedAt?: Date | string
  
  // Edit tracking
  edited?: boolean
  editedAt?: Date | string
  
  // Reply support
  replyTo?: MessageReplyContext | null
  replyToId?: string | null
}

/**
 * Chat room
 */
export interface ChatRoom {
  id: string
  name: string
  type?: 'group' | 'direct'
  members?: ChatUser[]
  createdBy?: string
  createdAt?: Date | string
  lastMessage?: ChatMessage
  lastMessageAt?: Date | string
}

/**
 * Pagination response from backend
 */
export interface PaginatedMessagesResponse {
  messages: ChatMessage[]
  hasMore: boolean
  cursor?: string | number
  total?: number
}

/**
 * Props for ChatConversationWithInfiniteScroll component
 */
export interface ChatConversationProps {
  roomId: string | null
  messages: ChatMessage[]
  currentUser: Pick<ChatUser, 'id' | 'username'> | null
  isLoadingMessages?: boolean
  isLoadingMoreMessages?: boolean
  hasMoreMessages?: boolean
  onLoadMoreMessages?: (beforeMessageId: string) => void | Promise<void>
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
  typingUsers?: Array<Pick<ChatUser, 'username'>>
}

/**
 * Typing indicator state
 */
export interface TypingIndicator {
  userId: string
  username: string
  last: number // timestamp of last typing event
}

/**
 * Reply context when user is composing a reply
 */
export interface ReplyContext {
  id: string
  username: string
  content: string
}

/**
 * Socket.io chat events (Emit - client sends to server)
 */
export interface ChatSocketEmitEvents {
  joinRoom: (data: { roomId: string }) => void
  leaveRoom: (data: { roomId: string }) => void
  sendMessage: (data: {
    roomId: string
    content: string
    replyToId?: string | null
  }) => void
  typing: (data: { roomId: string }) => void
  stopTyping: (data: { roomId: string }) => void
}

/**
 * Socket.io chat events (Listen - server sends to client)
 */
export interface ChatSocketListenEvents {
  chatMessage: (message: ChatMessage) => void
  typing: (data: {
    userId: string
    username: string
    roomId: string
  }) => void
  messageEdited: (data: {
    messageId: string
    content: string
    editedAt: string
  }) => void
  messageDeleted: (data: { messageId: string }) => void
}
