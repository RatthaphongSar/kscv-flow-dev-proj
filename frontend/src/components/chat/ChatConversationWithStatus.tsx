// frontend/src/components/chat/ChatConversationWithStatus.tsx
/**
 * Chat conversation component with message status tracking
 * Responsibilities:
 * 1. Display messages with status indicators
 * 2. Mark visible messages as "seen"
 * 3. Handle scroll-to-bottom
 * 4. Trigger seen receipts via socket
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import MessageBubbleWithStatus from './MessageBubbleWithStatus'
import { Message, MessageStatus } from '../../types/chat-status'

interface ChatConversationWithStatusProps {
  roomId: string | null
  messages: Message[]
  currentUser: { id: string; username?: string } | null
  messageStatuses: Map<string, MessageStatus>
  socket: any
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
  onMarkSeen?: (messageIds: string[]) => void
}

export default function ChatConversationWithStatus({
  roomId,
  messages,
  currentUser,
  messageStatuses,
  socket,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  onMarkSeen,
}: ChatConversationWithStatusProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const intersectionRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [visibleMessageIds, setVisibleMessageIds] = useState<string[]>([])
  const lastSeenRef = useRef<string | null>(null)

  // Sort messages ASC (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // ============================================
  // 1. AUTO-SCROLL TO BOTTOM ON NEW MESSAGE
  // ============================================
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [sortedMessages.length, isAtBottom])

  // ============================================
  // 2. DETECT SCROLL POSITION
  // ============================================
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setIsAtBottom(atBottom)
  }, [])

  // ============================================
  // 3. OBSERVE VISIBLE MESSAGES (Intersection API)
  // ============================================
  useEffect(() => {
    if (!scrollRef.current || !roomId || !currentUser) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds: string[] = []

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id')
            if (messageId) {
              visibleIds.push(messageId)
            }
          }
        })

        setVisibleMessageIds(prev => [...new Set([...prev, ...visibleIds])])
      },
      {
        root: scrollRef.current,
        threshold: 0.1,
      }
    )

    // Observe all message elements
    sortedMessages.forEach((msg) => {
      const el = document.querySelector(`[data-message-id="${msg.id}"]`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sortedMessages, roomId, currentUser])

  // ============================================
  // 4. SEND "SEEN" RECEIPT FOR VISIBLE MESSAGES
  // ============================================
  useEffect(() => {
    if (!socket || !roomId || !currentUser || visibleMessageIds.length === 0) {
      return
    }

    // Get the latest visible message
    const latestVisibleMessage = sortedMessages.find(
      (m) => visibleMessageIds.includes(m.id)
    )

    if (!latestVisibleMessage) return

    // Only send if changed from last time
    if (lastSeenRef.current === latestVisibleMessage.id) {
      return
    }

    lastSeenRef.current = latestVisibleMessage.id

    // Debounce: 500ms to batch updates
    const timer = setTimeout(() => {
      console.log(`📬 Sending seen receipt for:`, latestVisibleMessage.id)

      socket.emit('message:markSeen', {
        roomId,
        messageId: latestVisibleMessage.id,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
      })

      onMarkSeen?.(
        sortedMessages
          .filter((m) => visibleMessageIds.includes(m.id) && m.senderId !== currentUser.id)
          .map((m) => m.id)
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [visibleMessageIds, socket, roomId, currentUser, sortedMessages, onMarkSeen])

  // ============================================
  // 5. JUMP TO BOTTOM BUTTON
  // ============================================
  const handleJumpToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setIsAtBottom(true)
    }
  }

  // ============================================
  // 6. RENDER
  // ============================================
  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#020617] relative w-full">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto w-full px-6 py-4"
      >
        {/* Messages */}
        <div className="w-full space-y-3">
          {sortedMessages.map((m) => {
            if (!m?.id) return null

            const isOwn = m.senderId === currentUser?.id
            const status = messageStatuses.get(m.id) || 'delivered'
            const username = m.senderId === currentUser?.id
              ? 'You'
              : m.senderId.substring(0, 12)
            const content = m.content || ''
            const time =
              m.createdAt &&
              new Date(m.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })

            return (
              <div key={m.id} data-message-id={m.id}>
                <MessageBubbleWithStatus
                  id={m.id}
                  isOwn={isOwn}
                  username={username}
                  content={content}
                  time={time || ''}
                  status={status}
                  edited={m.edited || false}
                  replyTo={m.replyTo || null}
                  onDelete={onDeleteMessage}
                  onEdit={onEditMessage}
                  onReply={onReplyMessage}
                />
              </div>
            )
          })}
          <div ref={intersectionRef} />
        </div>
      </div>

      {/* Jump to bottom button */}
      {!isAtBottom && (
        <button
          type="button"
          onClick={handleJumpToBottom}
          className="absolute bottom-4 right-6 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 shadow-lg z-10 transition-all"
        >
          ⬇️ New messages
        </button>
      )}
    </div>
  )
}
