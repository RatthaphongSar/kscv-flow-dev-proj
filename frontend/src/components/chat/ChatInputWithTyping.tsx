/**
 * ChatInput Component with Typing Indicator Integration
 * 
 * Example implementation showing how to integrate useTypingIndicator hook
 * into your existing ChatInput component.
 * 
 * This is a reference implementation - adapt to your existing ChatInput.tsx
 * 
 * Key additions:
 * 1. Import useTypingIndicator hook
 * 2. Call hook with roomId, currentUserId, socket
 * 3. Call handleInputChange on input onChange
 * 4. Call handleMessageSent when sending message
 */

import React, { useState } from 'react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

/**
 * Props for ChatInput component
 */
interface ChatInputProps {
  roomId: string;
  currentUserId: string;
  socket: any; // Socket.io instance
  onSendMessage: (content: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

/**
 * Example ChatInput component with typing indicator
 * 
 * Usage:
 * ```tsx
 * <ChatInput
 *   roomId={selectedRoomId}
 *   currentUserId={userId}
 *   socket={chatSocket}
 *   onSendMessage={handleSendMessage}
 * />
 * ```
 */
export const ChatInputWithTyping: React.FC<ChatInputProps> = ({
  roomId,
  currentUserId,
  socket,
  onSendMessage,
  placeholder = 'Type a message…',
  disabled = false,
  maxLength = 5000,
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize typing indicator hook
  const { handleInputChange, handleMessageSent } = useTypingIndicator({
    roomId,
    currentUserId,
    socket,
    debounceDelay: 2000, // Stop typing after 2s of no input
    debug: false, // Set to true for console logging
  });

  /**
   * Handle input change
   * 1. Update local state
   * 2. Call typing indicator hook
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Notify typing indicator of activity
    handleInputChange();
  };

  /**
   * Handle input clear
   */
  const _handleClear = () => {
    setMessage('');
    handleInputChange();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Don't send empty messages
    if (!message.trim()) {
      return;
    }

    try {
      setIsLoading(true);

      // Call parent's send handler
      await onSendMessage(message);

      // Clear input
      setMessage('');

      // Stop typing indicator immediately
      handleMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key (send message)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
    >
      <div className="flex gap-3">
        {/* Message input */}
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          maxLength={maxLength}
          rows={1}
          className={`
            flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 px-3 py-2
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          `}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className={`
            px-4 py-2 rounded-lg font-medium
            transition-colors
            ${
              message.trim() && !disabled && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </div>

      {/* Character counter */}
      {message.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {message.length} / {maxLength}
        </div>
      )}
    </form>
  );
};

/**
 * Alternative: Minimal integration into existing ChatInput
 * 
 * If you already have a ChatInput component, just add these lines:
 * 
 * ```tsx
 * const { handleInputChange, handleMessageSent } = useTypingIndicator({
 *   roomId,
 *   currentUserId,
 *   socket: chatSocket,
 * });
 * 
 * // In your input onChange:
 * onChange={(e) => {
 *   setMessage(e.target.value);
 *   handleInputChange();  // Add this
 * }}
 * 
 * // In your send message handler:
 * const sendMessage = async () => {
 *   await api.sendMessage(message);
 *   setMessage('');
 *   handleMessageSent();  // Add this
 * }
 * ```
 */

export default ChatInputWithTyping;
