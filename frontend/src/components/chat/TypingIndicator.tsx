/**
 * TypingIndicator Component
 * 
 * Displays a text indicator showing which users are currently typing
 * in the current room.
 * 
 * Examples:
 * - "User A is typing…"
 * - "User A and others are typing…"
 * - "หลายคนกำลังพิมพ์อยู่…"
 * 
 * Features:
 * - Only shows for other users (excludes current user)
 * - Supports single and multiple typers
 * - Customizable display text (English and Thai)
 * - Smooth animations with Tailwind CSS
 */

import React, { useMemo } from 'react';
import type { TypingIndicatorProps } from '@/types/typing-indicator';
import { TYPING_INDICATOR_CONFIG } from '@/types/typing-indicator';

/**
 * TypingIndicator Component
 * 
 * Renders typing indicator text based on current room's typing state
 * 
 * @param props Component props including roomId, typingState, participants
 * @returns JSX element with typing indicator or null if no one typing
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  roomId,
  typingState,
  participants,
  currentUserId,
  maxNamesToShow = TYPING_INDICATOR_CONFIG.MAX_NAMES_TO_SHOW,
  className = '',
}) => {
  // Get typing users for current room (excluding self)
  const typingUsers = useMemo(() => {
    const roomTyping = typingState[roomId];
    if (!roomTyping || !roomTyping.userIds) {
      return [];
    }

    // Filter out current user (should not show ourselves typing)
    return roomTyping.userIds.filter((userId) => userId !== currentUserId);
  }, [typingState, roomId, currentUserId]);

  // No one typing - return null
  if (typingUsers.length === 0) {
    return null;
  }

  // Get display names for typing users
  const typingUserNames = useMemo(() => {
    return typingUsers
      .slice(0, maxNamesToShow)
      .map((userId) => {
        const participant = participants[userId];
        return participant?.displayName || participant?.username || userId;
      });
  }, [typingUsers, participants, maxNamesToShow]);

  // Build display text
  const displayText = useMemo(() => {
    if (typingUserNames.length === 0) {
      return '';
    }

    if (typingUserNames.length === 1) {
      // Single user typing
      return `${typingUserNames[0]}${TYPING_INDICATOR_CONFIG.TYPING_TEXT.SINGLE}`;
    }

    if (typingUsers.length > maxNamesToShow) {
      // More users typing than we're showing names for
      const shownNames = typingUserNames.slice(0, maxNamesToShow - 1);
      return `${shownNames.join(', ')}${TYPING_INDICATOR_CONFIG.TYPING_TEXT.MULTIPLE}`;
    }

    // Multiple users shown
    if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]}${TYPING_INDICATOR_CONFIG.TYPING_TEXT.SINGLE}`;
    }

    // 3+ users
    return TYPING_INDICATOR_CONFIG.TYPING_TEXT.MANY;
  }, [typingUserNames, typingUsers.length, maxNamesToShow]);

  // Default styles
  const defaultClassName =
    'text-sm text-gray-500 dark:text-gray-400 italic mt-2 animate-pulse';

  return (
    <div className={className || defaultClassName}>
      {displayText}
      {/* Animated dots */}
      <span className="inline-block ml-1">
        <span className="animate-bounce inline-block">.</span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>
          .
        </span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>
          .
        </span>
      </span>
    </div>
  );
};

/**
 * Compact TypingIndicator variant
 * Shows just the indicator without full names
 * Useful when space is limited
 */
export const CompactTypingIndicator: React.FC<TypingIndicatorProps> = ({
  roomId,
  typingState,
  currentUserId,
  className = '',
}) => {
  const typingCount = useMemo(() => {
    const roomTyping = typingState[roomId];
    if (!roomTyping || !roomTyping.userIds) {
      return 0;
    }

    return roomTyping.userIds.filter((userId) => userId !== currentUserId).length;
  }, [typingState, roomId, currentUserId]);

  if (typingCount === 0) {
    return null;
  }

  const text =
    typingCount === 1 ? 'Someone is typing…' : `${typingCount} people are typing…`;

  const defaultClassName = 'text-xs text-gray-500 dark:text-gray-400 italic';

  return (
    <div className={className || defaultClassName}>
      {text}
    </div>
  );
};

/**
 * Inline TypingIndicator variant
 * Shows indicator inline in chat (e.g., as a small badge)
 * Good for group chat message thread view
 */
export const InlineTypingIndicator: React.FC<TypingIndicatorProps> = ({
  roomId,
  typingState,
  participants,
  currentUserId,
  className = '',
}) => {
  const typingUsers = useMemo(() => {
    const roomTyping = typingState[roomId];
    if (!roomTyping || !roomTyping.userIds) {
      return [];
    }

    return roomTyping.userIds.filter((userId) => userId !== currentUserId);
  }, [typingState, roomId, currentUserId]);

  if (typingUsers.length === 0) {
    return null;
  }

  // Get first typing user's name
  const firstTyper = typingUsers[0];
  const firstName =
    participants[firstTyper]?.displayName ||
    participants[firstTyper]?.username ||
    'Someone';

  const defaultClassName =
    'inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full';

  return (
    <span className={className || defaultClassName}>
      <span>{firstName}</span>
      <span className="inline-flex gap-0.5">
        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
        <span
          className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </span>
    </span>
  );
};

/**
 * Skeleton TypingIndicator
 * Shows placeholder while loading participant data
 */
export const SkeletonTypingIndicator: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const defaultClassName = 'h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse';

  return <div className={className || defaultClassName} />;
};

export default TypingIndicator;
