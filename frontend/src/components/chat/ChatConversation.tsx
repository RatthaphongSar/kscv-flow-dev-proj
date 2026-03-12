// frontend/src/components/chat/ChatConversation.tsx
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import PinnedSection from '../PinnedSection'
import UserAvatar from './UserAvatar'
import { useTheme } from '../ThemeProvider'

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
  const [profileUser, setProfileUser] = useState<{
    id?: string
    username: string
    role?: string
  } | null>(null)
  const isRoomAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN'
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)

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
    <div className={`flex-1 min-h-0 overflow-hidden flex flex-col relative w-full ${isLight ? 'bg-slate-50' : 'bg-[#0b1220]'}`}>
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
        className="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto px-0 sm:px-2 lg:px-3 py-4 sm:py-5"
      >
        {/* Messages */}
        <div className="w-full max-w-3xl mx-auto space-y-3">
            {safeMessages.map((m) => {
              if (!m?.id) return null
              const isOwn = m?.userId === currentUser?.id
              const username = m?.user?.username || 'Unknown User'
              const userId = m?.userId || m?.user?.id
              const userRole = m?.user?.role
              const content = m?.text || m?.content || ''
              const time =
                m?.createdAt &&
                new Date(m.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })

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
                    userId={userId}
                    userRole={userRole}
                    content={content}
                    time={time || ''}
                    type={type}
                    files={files}
                    edited={m?.edited || false}
                    replyTo={m?.replyTo || null}
                    onDelete={onDeleteMessage}
                    onEdit={onEditMessage}
                    onReply={onReplyMessage}
                    onProfileClick={setProfileUser}
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
          className={`absolute bottom-4 right-4 sm:right-6 rounded-full text-xs px-3 py-1.5 shadow-lg z-10 transition-all backdrop-blur ${isLight ? 'bg-white/80 hover:bg-white text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          ⬇️ ข้อความล่าสุด
        </button>
      )}

      {profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setProfileUser(null)}
          />
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-white/10 bg-[#0b1220] text-gray-100'}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <UserAvatar name={profileUser.username} size="md" />
                <div>
                  <div className="text-sm font-semibold">{profileUser.username}</div>
                  <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{profileUser.role || '-'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileUser(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>User ID</span>
                <span className={isLight ? 'text-slate-900' : 'text-gray-100'}>{profileUser.id || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Role</span>
                <span className={isLight ? 'text-slate-900' : 'text-gray-100'}>{profileUser.role || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
