/**
 * Complete Typing Indicator Integration Example
 * 
 * Shows how to integrate all typing indicator components and hooks
 * into your existing Chat.jsx or ChatPage component.
 * 
 * This is a reference implementation demonstrating:
 * 1. State management for typing indicators across rooms
 * 2. Socket.io event listeners for typing events
 * 3. Component integration
 * 4. Proper cleanup
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { TypingStateMap, RoomParticipants } from '@/types/typing-indicator';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInputWithTyping from '@/components/chat/ChatInputWithTyping';

/**
 * Example Chat component with typing indicators
 */
interface ChatWithTypingIndicatorProps {
  selectedRoomId: string;
  currentUserId: string;
  socket: any; // Socket.io instance
  rooms: any[];
  onSendMessage: (roomId: string, message: string) => Promise<void>;
  roomParticipants: Record<string, RoomParticipants>;
}

export const ChatWithTypingIndicator: React.FC<ChatWithTypingIndicatorProps> = ({
  selectedRoomId,
  currentUserId,
  socket,
  rooms: _rooms,
  onSendMessage,
  roomParticipants,
}) => {
  // State for tracking typing users per room
  const [typingState, setTypingState] = useState<TypingStateMap>({});

  /**
   * Add a user to typing list for a room
   */
  const addTypingUser = useCallback((roomId: string, userId: string) => {
    if (userId === currentUserId) {
      return; // Don't show current user as typing
    }

    setTypingState((prev) => {
      const roomTyping = prev[roomId] || { userIds: [] };
      const userIds = [...new Set([...roomTyping.userIds, userId])]; // Add if not already present

      return {
        ...prev,
        [roomId]: { userIds },
      };
    });
  }, [currentUserId]);

  /**
   * Remove a user from typing list for a room
   */
  const removeTypingUser = useCallback((roomId: string, userId: string) => {
    setTypingState((prev) => {
      const roomTyping = prev[roomId];
      if (!roomTyping) return prev;

      const userIds = roomTyping.userIds.filter((id) => id !== userId);

      return {
        ...prev,
        [roomId]: { userIds },
      };
    });
  }, []);

  /**
   * Setup Socket.io listeners for typing events
   * 
   * Expected server broadcasts:
   * - typing:start { roomId, userId }
   * - typing:stop { roomId, userId }
   */
  useEffect(() => {
    if (!socket) return;

    /**
     * Listen for typing:start event
     * Emitted by server when another user starts typing
     */
    const handleTypingStart = (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;

      console.log(`[Typing] User ${userId} started typing in room ${roomId}`);
      addTypingUser(roomId, userId);

      // Auto-clear after timeout (fallback if typing:stop doesn't arrive)
      const timeout = setTimeout(() => {
        removeTypingUser(roomId, userId);
      }, 10000); // 10 seconds timeout

      // Store timeout for cleanup if typing:stop arrives
      (window as any)[`typing_timeout_${roomId}_${userId}`] = timeout;
    };

    /**
     * Listen for typing:stop event
     * Emitted by server when another user stops typing
     */
    const handleTypingStop = (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;

      console.log(`[Typing] User ${userId} stopped typing in room ${roomId}`);
      removeTypingUser(roomId, userId);

      // Clear any pending timeout
      const timeoutKey = `typing_timeout_${roomId}_${userId}`;
      if ((window as any)[timeoutKey]) {
        clearTimeout((window as any)[timeoutKey]);
        delete (window as any)[timeoutKey];
      }
    };

    // Register listeners
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    // Cleanup listeners on unmount
    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, addTypingUser, removeTypingUser]);

  /**
   * Clear typing state when switching rooms
   */
  useEffect(() => {
    if (!selectedRoomId) return;

    // Don't clear immediately on switch - let typing indicator show briefly
    // for better UX, then clear after a short delay
    const timer = setTimeout(() => {
      // Actually you might want to NOT clear here, so typing indicator
      // carries over briefly when switching. Adjust based on preference.
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedRoomId]);

  /**
   * Handle sending message
   */
  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        await onSendMessage(selectedRoomId, message);
        // Typing indicator is cleared by ChatInputWithTyping.handleMessageSent()
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [selectedRoomId, onSendMessage]
  );

  /**
   * Get participants for current room
   */
  const currentRoomParticipants = roomParticipants[selectedRoomId] || {};

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Your message list component here */}
        <div className="text-center text-gray-500">
          Messages would render here
        </div>
      </div>

      {/* Typing indicator - shown above input */}
      <div className="px-4">
        <TypingIndicator
          roomId={selectedRoomId}
          typingState={typingState}
          participants={currentRoomParticipants}
          currentUserId={currentUserId}
          maxNamesToShow={2}
        />
      </div>

      {/* Chat input with typing indicator integration */}
      <ChatInputWithTyping
        roomId={selectedRoomId}
        currentUserId={currentUserId}
        socket={socket}
        onSendMessage={handleSendMessage}
        placeholder="Type a message…"
      />
    </div>
  );
};

/**
 * Minimal integration example for existing Chat.jsx
 * 
 * If you want to add typing indicators to existing Chat component,
 * follow this pattern by referencing the ChatWithTypingIndicator component above.
 * 
 * Key steps:
 * 1. Import TypingIndicator and ChatInputWithTyping components
 * 2. Create state for typingState: TypingStateMap
 * 3. Setup Socket.io listeners for 'typing:start' and 'typing:stop' events
 * 4. Render TypingIndicator above your message input
 * 5. Replace standard input with ChatInputWithTyping component
 * 6. Clean up listeners on component unmount
 */

export default ChatWithTypingIndicator;
