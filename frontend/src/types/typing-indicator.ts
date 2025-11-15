/**
 * Typing Indicator Type Definitions
 * 
 * Defines all TypeScript types and interfaces for the typing indicator system
 * including socket events, state management, and component props.
 */

/**
 * Typing state for a single room
 * Tracks which users are currently typing in that room (excluding current user)
 */
export interface RoomTypingState {
  userIds: string[]; // Array of userId currently typing in this room
}

/**
 * Complete typing state across all rooms
 * Maps roomId to typing state for that room
 */
export type TypingStateMap = Record<string, RoomTypingState>;

/**
 * Socket event: User started typing
 * Sent by client when user presses first key in input
 * Broadcast by server to other users in the room
 */
export interface TypingStartEvent {
  roomId: string;
  userId: string;
}

/**
 * Socket event: User stopped typing
 * Sent by client when no keypress for 2+ seconds or input cleared
 * Broadcast by server to other users in the room
 */
export interface TypingStopEvent {
  roomId: string;
  userId: string;
}

/**
 * Socket event: Typing indicator update
 * Can be used instead of separate start/stop events
 * Payload: { roomId, userId, isTyping: boolean }
 */
export interface TypingUpdateEvent {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

/**
 * User info (minimal) for display purposes
 * Used in RoomParticipant or similar context
 */
export interface User {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
}

/**
 * Room participant info
 * Maps userId to User details for displaying typing user names
 */
export type RoomParticipants = Record<string, User>;

/**
 * Props for the TypingIndicator component
 * Receives typing state and participant info to render indicator
 */
export interface TypingIndicatorProps {
  /** Current room ID being displayed */
  roomId: string;
  /** Map of room typing states */
  typingState: TypingStateMap;
  /** Map of userId to User info (for getting display names) */
  participants: RoomParticipants;
  /** Current user ID (to exclude from display) */
  currentUserId: string;
  /** Maximum number of names to show before "and others" */
  maxNamesToShow?: number;
  /** Custom CSS class for styling */
  className?: string;
}

/**
 * Props for components using the typing indicator hook
 * Used in ChatInput to emit typing events
 */
export interface UseTypingIndicatorOptions {
  /** Current room ID */
  roomId: string;
  /** Current user ID */
  currentUserId: string;
  /** Socket instance (Socket.io client) */
  socket: any; // Socket.io Socket type
  /** Debounce delay in milliseconds (default: 2000) */
  debounceDelay?: number;
  /** Whether to enable logging for debugging */
  debug?: boolean;
}

/**
 * Return type of useTypingIndicator hook
 * Provides handlers and state management
 */
export interface UseTypingIndicatorReturn {
  /** Call this on input onChange to track typing */
  handleInputChange: () => void;
  /** Call this when input is cleared */
  handleInputClear: () => void;
  /** Call this when message is sent (to immediately stop typing indicator) */
  handleMessageSent: () => void;
  /** Whether hook is currently tracking typing activity */
  isTyping: boolean;
}

/**
 * Socket event payload for typing indicator
 * Used for Socket.io emit/on handlers
 */
export interface SocketTypingPayload {
  roomId: string;
  userId: string;
  timestamp?: number;
}

/**
 * Context for typing indicator state
 * Can be used with React Context if needed for app-wide state
 */
export interface TypingIndicatorContext {
  typingState: TypingStateMap;
  updateTypingState: (roomId: string, userIds: string[]) => void;
  addTypingUser: (roomId: string, userId: string) => void;
  removeTypingUser: (roomId: string, userId: string) => void;
  clearRoomTyping: (roomId: string) => void;
  clearAllTyping: () => void;
}

/**
 * Socket event names for typing indicator
 * These are the string literals used in Socket.io emit/on
 */
export const TYPING_EVENTS = {
  /** Client emits when user starts typing */
  START: 'typing:start',
  /** Client emits when user stops typing */
  STOP: 'typing:stop',
  /** Alternative: single event with isTyping boolean */
  UPDATE: 'typing:update',
  /** Server broadcasts to room when user starts typing */
  USER_STARTED: 'typing:userStarted',
  /** Server broadcasts to room when user stops typing */
  USER_STOPPED: 'typing:userStopped',
} as const;

/**
 * Default configuration values
 */
export const TYPING_INDICATOR_CONFIG = {
  /** Debounce delay before sending typing:stop (milliseconds) */
  DEBOUNCE_DELAY: 2000,
  /** Maximum names to show before "and others" text */
  MAX_NAMES_TO_SHOW: 2,
  /** Typing indicator display text (English) */
  TYPING_TEXT: {
    SINGLE: ' is typing…',
    MULTIPLE: ' and others are typing…',
    MANY: 'Multiple people are typing…',
  },
  /** Typing indicator display text (Thai) */
  TYPING_TEXT_TH: {
    SINGLE: 'กำลังพิมพ์…',
    MULTIPLE: 'และคนอื่น ๆ กำลังพิมพ์…',
    MANY: 'หลายคนกำลังพิมพ์อยู่…',
  },
} as const;
