/**
 * useTypingIndicator Hook
 * 
 * Manages typing indicator state and emits Socket.io events
 * for the current user's typing activity.
 * 
 * Usage in ChatInput:
 * ```tsx
 * const { handleInputChange, handleMessageSent } = useTypingIndicator({
 *   roomId,
 *   currentUserId,
 *   socket: chatSocket,
 * });
 * 
 * return (
 *   <input
 *     onChange={handleInputChange}
 *     onKeyDown={(e) => {
 *       if (e.key === 'Enter') {
 *         sendMessage();
 *         handleMessageSent(); // Stop typing indicator
 *       }
 *     }}
 *   />
 * );
 * ```
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  UseTypingIndicatorOptions,
  UseTypingIndicatorReturn,
  SocketTypingPayload,
} from '@/types/typing-indicator';
import { TYPING_INDICATOR_CONFIG } from '@/types/typing-indicator';

/**
 * Custom hook for managing typing indicator
 * 
 * Handles:
 * - Debouncing typing events (prevents spamming server)
 * - Emitting typing:start on first keypress
 * - Emitting typing:stop after debounce timeout
 * - Clearing timers on cleanup
 * 
 * @param options Configuration including roomId, userId, socket instance
 * @returns Object with handlers for input events
 */
export function useTypingIndicator(
  options: UseTypingIndicatorOptions
): UseTypingIndicatorReturn {
  const {
    roomId,
    currentUserId,
    socket,
    debounceDelay = TYPING_INDICATOR_CONFIG.DEBOUNCE_DELAY,
    debug = false,
  } = options;

  // Refs to track typing state and timers
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const lastEmittedRef = useRef<{ event: 'start' | 'stop'; time: number } | null>(null);

  // Local state for component re-render if needed
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Emit typing:start event to server
   * Only emit once per typing session (debounce guard)
   */
  const emitTypingStart = useCallback(() => {
    if (!socket || !roomId || !currentUserId) {
      console.warn('[useTypingIndicator] Missing required props for emitTypingStart');
      return;
    }

    // Don't spam typing:start events - only emit if we haven't already
    if (isTypingRef.current && lastEmittedRef.current?.event === 'start') {
      if (debug) console.log('[useTypingIndicator] Already sent typing:start, skipping');
      return;
    }

    const payload: SocketTypingPayload = {
      roomId,
      userId: currentUserId,
      timestamp: Date.now(),
    };

    socket.emit('typing:start', payload);
    isTypingRef.current = true;
    lastEmittedRef.current = { event: 'start', time: Date.now() };
    setIsTyping(true);

    if (debug) {
      console.log('[useTypingIndicator] Emitted typing:start', payload);
    }
  }, [socket, roomId, currentUserId, debug]);

  /**
   * Emit typing:stop event to server
   * Only emit if we're currently marked as typing
   */
  const emitTypingStop = useCallback(() => {
    if (!socket || !roomId || !currentUserId) {
      console.warn('[useTypingIndicator] Missing required props for emitTypingStop');
      return;
    }

    // Only emit stop if we sent start
    if (!isTypingRef.current) {
      if (debug) console.log('[useTypingIndicator] Not currently typing, skipping typing:stop');
      return;
    }

    const payload: SocketTypingPayload = {
      roomId,
      userId: currentUserId,
      timestamp: Date.now(),
    };

    socket.emit('typing:stop', payload);
    isTypingRef.current = false;
    lastEmittedRef.current = { event: 'stop', time: Date.now() };
    setIsTyping(false);

    if (debug) {
      console.log('[useTypingIndicator] Emitted typing:stop', payload);
    }
  }, [socket, roomId, currentUserId, debug]);

  /**
   * Reset debounce timer
   * Called on each keystroke to restart the countdown
   */
  const resetDebounceTimer = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Emit typing:start if not already marked as typing
    if (!isTypingRef.current) {
      emitTypingStart();
    }

    // Set new timer to emit typing:stop after debounce delay
    debounceTimerRef.current = setTimeout(() => {
      emitTypingStop();
      debounceTimerRef.current = null;
    }, debounceDelay);

    if (debug) {
      console.log('[useTypingIndicator] Debounce timer reset', { debounceDelay });
    }
  }, [debounceDelay, emitTypingStart, emitTypingStop, debug]);

  /**
   * Handle input change/keystroke
   * Call this from the input onChange handler
   */
  const handleInputChange = useCallback(() => {
    resetDebounceTimer();
  }, [resetDebounceTimer]);

  /**
   * Handle input cleared
   * Immediately stop typing indicator
   * Call this when clearing input (e.g., after sending message)
   */
  const handleInputClear = useCallback(() => {
    // Clear timer if active
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Immediately emit stop
    emitTypingStop();

    if (debug) {
      console.log('[useTypingIndicator] Input cleared, emitted typing:stop');
    }
  }, [emitTypingStop, debug]);

  /**
   * Handle message sent
   * Immediately stop typing indicator
   * Call this when user sends a message
   */
  const handleMessageSent = useCallback(() => {
    handleInputClear();
  }, [handleInputClear]);

  /**
   * Cleanup on unmount or when dependencies change
   * Ensure we stop typing when leaving room or component unmounts
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Emit stop before leaving
      if (isTypingRef.current) {
        emitTypingStop();
      }
    };
  }, [emitTypingStop]);

  /**
   * Cleanup when switching rooms
   * Stop typing indicator for previous room
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [roomId]);

  return {
    handleInputChange,
    handleInputClear,
    handleMessageSent,
    isTyping,
  };
}

/**
 * Alternative simpler version if you just need to track typing state
 * without emitting socket events manually
 */
export function useTypingState(
  options: Omit<UseTypingIndicatorOptions, 'socket'>
) {
  const { roomId, currentUserId: _currentUserId, debounceDelay = TYPING_INDICATOR_CONFIG.DEBOUNCE_DELAY, debug = false } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const resetDebounceTimer = useCallback(() => {
    setIsTyping(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      debounceTimerRef.current = null;
    }, debounceDelay);

    if (debug) {
      console.log('[useTypingState] Typing activity in room', roomId);
    }
  }, [roomId, debounceDelay, debug]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [roomId]);

  return {
    isTyping,
    handleInputChange: resetDebounceTimer,
  };
}
