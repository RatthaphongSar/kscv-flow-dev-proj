// frontend/src/components/chat/ChatConversationWithInfiniteScroll.tsx
/**
 * Enhanced ChatConversation with:
 * - Initial load scroll to bottom
 * - Auto-scroll on new messages (with "jump to latest" button if scrolled up)
 * - Infinite scroll on scroll-to-top for older messages
 * - Proper scroll position preservation when loading older messages
 * - Typing indicators
 * - Reply context display
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useChatScroll } from '../../hooks/useChatScroll'
import MessageBubble from './MessageBubble'

interface ChatConversationWithInfiniteScrollProps {
  roomId: string | null
  messages: any[]
  currentUser: { id: string; username?: string } | null
  isLoadingMessages?: boolean
  isLoadingMoreMessages?: boolean
  hasMoreMessages?: boolean
  onLoadMoreMessages?: (beforeMessageId: string) => void | Promise<void>
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
  typingUsers?: Array<{ userId: string; username: string }>
}

export default function ChatConversationWithInfiniteScroll({
  roomId,
  messages,
  currentUser,
  isLoadingMessages = false,
  isLoadingMoreMessages = false,
  hasMoreMessages = false,
  onLoadMoreMessages,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  typingUsers = [],
}: ChatConversationWithInfiniteScrollProps) {
  const safeMessages = Array.isArray(messages) ? messages : []

  // ใช้ custom hook สำหรับ scroll behavior
  const {
    scrollContainerRef,
    isAtBottom,
    isAtTop,
    scrollToBottom,
    preserveScrollPosition,
    restoreScrollPosition,
  } = useChatScroll({
    bottomThreshold: 100,
    topThreshold: 150,
  })

  // Track unread indicator
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false)
  const initialScrollDoneRef = useRef(false)

  // Prevent double-loading older messages
  const loadingMoreRef = useRef(false)

  // ========== LIFECYCLE: Initial load scroll to bottom ==========
  useEffect(() => {
    if (!roomId) {
      initialScrollDoneRef.current = false
      setHasUnreadBelow(false)
      return
    }

    // Reset when room changes
    initialScrollDoneRef.current = false
    setHasUnreadBelow(false)
  }, [roomId])

  // Auto-scroll to bottom on first load of messages
  useEffect(() => {
    if (isLoadingMessages || safeMessages.length === 0) return

    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        scrollToBottom('auto')
      }, 50)
    }
  }, [safeMessages, isLoadingMessages, scrollToBottom])

  // ========== AUTO-SCROLL on new messages ==========
  /**
   * When new message arrives:
   * - If at bottom → auto-scroll to show new message
   * - If scrolled up → show "New messages" button
   */
  useEffect(() => {
    if (!initialScrollDoneRef.current) return
    if (safeMessages.length === 0) return

    if (isAtBottom) {
      // User is at bottom, auto-scroll to keep them at bottom
      scrollToBottom('smooth')
      setHasUnreadBelow(false)
    } else {
      // User is scrolled up, show unread indicator button
      setHasUnreadBelow(true)
    }
  }, [safeMessages, isAtBottom, scrollToBottom])

  // ========== INFINITE SCROLL: Load older messages when scroll to top ==========
  useEffect(() => {
    // Don't trigger if:
    // - Already loading more messages
    // - No more messages to load
    // - User not at top
    // - No messages in list
    if (
      isLoadingMoreMessages ||
      !hasMoreMessages ||
      !isAtTop ||
      safeMessages.length === 0 ||
      loadingMoreRef.current
    ) {
      return
    }

    loadingMoreRef.current = true

    // Preserve scroll position before fetching (flex-col-reverse: old messages go to bottom)
    preserveScrollPosition()

    // Get the ID of the oldest message (first element since array is DESC)
    const oldestMessageId = safeMessages[0]?.id
    if (!oldestMessageId) {
      loadingMoreRef.current = false
      return
    }

    // Call the load more callback
    const promise = onLoadMoreMessages?.(oldestMessageId)
    Promise.resolve(promise)
      .then(() => {
        // After DOM updates with new messages, restore scroll position
        setTimeout(() => {
          restoreScrollPosition()
          loadingMoreRef.current = false
        }, 0)
      })
      .catch((err) => {
        console.error('Error loading more messages:', err)
        loadingMoreRef.current = false
      })
  }, [
    isAtTop,
    isLoadingMoreMessages,
    hasMoreMessages,
    safeMessages,
    onLoadMoreMessages,
    preserveScrollPosition,
    restoreScrollPosition,
  ])

  // ========== HANDLERS ==========
  const handleSkipToLatest = useCallback(() => {
    scrollToBottom('smooth')
    setHasUnreadBelow(false)
  }, [scrollToBottom])

  // ========== RENDER ==========
  return (
    <div className="relative flex flex-col h-full">
      {/* Loading indicator at top when fetching older messages */}
      {isLoadingMoreMessages && (
        <div className="flex justify-center py-3 px-4">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            โหลดข้อความเก่า...
          </div>
        </div>
      )}

      {/* Scrollable message container */}
      {/* Note: flex-col-reverse puts latest messages at bottom */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 flex flex-col-reverse"
      >
        {/* Messages (rendered in reverse order due to flex-col-reverse) */}
        {safeMessages.map((m) => {
          if (!m?.id) return null

          const isOwn = m?.userId === currentUser?.id
          const username = m?.user?.username || 'Unknown User'
          const content = m?.text || m?.content || ''
          const time =
            m?.createdAt &&
            new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

          return (
            <div key={m.id} data-message-id={m.id}>
              <MessageBubble
                id={m.id}
                isOwn={isOwn}
                username={username}
                content={content}
                time={time || ''}
                edited={m?.edited || false}
                replyTo={m?.replyTo || null}
                onDelete={onDeleteMessage}
                onEdit={onEditMessage}
                onReply={onReplyMessage}
              />
            </div>
          )
        })}

        {/* Typing indicators - shown above input */}
        {typingUsers.length > 0 && (
          <div className="flex gap-2 items-center px-3 py-1 text-xs text-gray-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>
              {typingUsers.map((u) => u.username).join(', ')} กำลังพิมพ์...
            </span>
          </div>
        )}
      </div>

      {/* Initial loading indicator */}
      {isLoadingMessages && safeMessages.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            โหลดข้อความ...
          </div>
        </div>
      )}

      {/* "New messages" button - shown when user scrolls up and new messages arrive */}
      {!isAtBottom && hasUnreadBelow && (
        <button
          type="button"
          onClick={handleSkipToLatest}
          className="absolute bottom-4 right-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-[11px] px-3 py-1.5 shadow-lg z-10 transition-all duration-200 hover:shadow-xl animate-pulse"
        >
          ⬇️ ข้อความใหม่
        </button>
      )}
    </div>
  )
}
