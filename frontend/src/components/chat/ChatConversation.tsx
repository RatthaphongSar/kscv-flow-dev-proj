// frontend/src/components/chat/ChatConversation.tsx
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import PinnedSection from '../PinnedSection'

interface ChatConversationProps {
  roomId: string | null
  messages: any[]
  currentUser: { id: string; username?: string; role?: string } | null
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
}

export default function ChatConversation({
  roomId: _roomId,
  messages,
  currentUser,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
}: ChatConversationProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const isRoomAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN'

  // ASC sort: oldest → newest
  const safeMessages = Array.isArray(messages)
    ? [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    : []

  // Debug: verify layout is working
  useEffect(() => {
    // Layout system verified - scroll container properly constrained
  }, [safeMessages.length])

  // Auto-scroll on new message if at bottom
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [safeMessages.length, isAtBottom])

  // Detect if user scrolled away
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setIsAtBottom(atBottom)
  }

  // Jump to bottom
  const handleJumpToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setIsAtBottom(true)
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#0b1220] relative w-full">
      {/* Pinned messages section */}
      {_roomId && (
        <PinnedSection
          roomId={_roomId}
          currentUserId={currentUser?.id || ''}
          isRoomAdmin={isRoomAdmin}
          onUnpin={() => {
            // Message will be removed from pinned list automatically
          }}
        />
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto w-full px-6 py-5"
      >
        {/* Messages */}
        <div className="w-full space-y-3">
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

            // Determine message type and file info
            let type: 'text' | 'image' | 'file' = 'text'
            const files = m?.files || []

            if (files.length > 0) {
              const allImages = files.every((f) => f.mimeType?.startsWith('image/'))
              type = allImages ? 'image' : 'file'
            }

            return (
              <div key={m.id} data-message-id={m.id}>
                <MessageBubble
                  id={m.id}
                  isOwn={isOwn}
                  username={username}
                  content={content}
                  time={time || ''}
                  type={type}
                  files={files}
                  edited={m?.edited || false}
                  replyTo={m?.replyTo || null}
                  onDelete={onDeleteMessage}
                  onEdit={onEditMessage}
                  onReply={onReplyMessage}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Jump to bottom button */}
      {!isAtBottom && (
        <button
          type="button"
          onClick={handleJumpToBottom}
          className="absolute bottom-4 right-6 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 shadow-lg z-10 transition-all backdrop-blur"
        >
          ⬇️ ข้อความล่าสุด
        </button>
      )}
    </div>
  )
}
