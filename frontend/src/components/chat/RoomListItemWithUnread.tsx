// frontend/src/components/chat/RoomListItemWithUnread.tsx
/**
 * Room list item component with unread badge and status indicators
 * Shows:
 * - Room name (bold if has unread)
 * - Last message preview
 * - Unread badge (red circle with count)
 * - Timestamp of last message
 */

import { Room, Message } from '../../types/chat-status'

interface RoomListItemWithUnreadProps {
  room: Room
  isActive: boolean
  unreadCount?: number
  lastMessage?: Message | null
  onSelect: (room: Room) => void
}

export default function RoomListItemWithUnread({
  room,
  isActive,
  unreadCount = 0,
  lastMessage,
  onSelect,
}: RoomListItemWithUnreadProps) {
  // Format timestamp
  const formatTime = (date?: string | Date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return d.toLocaleDateString()
  }

  const hasUnread = unreadCount > 0

  return (
    <button
      onClick={() => onSelect(room)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors relative group ${
        isActive
          ? 'bg-violet-600 text-white'
          : `hover:bg-[#1f2937] ${hasUnread ? 'bg-[#111827]' : 'bg-transparent'}`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Room info */}
        <div className="flex-1 min-w-0">
          {/* Room name - bold if unread */}
          <div
            className={`text-sm truncate ${
              hasUnread && !isActive
                ? 'font-bold text-white'
                : isActive
                ? 'font-semibold'
                : 'font-normal'
            }`}
          >
            {room.name}
          </div>

          {/* Last message preview */}
          {lastMessage && (
            <div
              className={`text-xs truncate ${
                isActive ? 'text-violet-100' : 'text-gray-400'
              }`}
            >
              {lastMessage.senderId === 'current-user-id'
                ? 'You: '
                : `${lastMessage.senderId.substring(0, 8)}: `}
              {lastMessage.content.substring(0, 30)}
              {lastMessage.content.length > 30 ? '...' : ''}
            </div>
          )}
        </div>

        {/* Right side: Time + Unread Badge */}
        <div className="flex flex-col items-end gap-1">
          {/* Timestamp */}
          <div
            className={`text-[10px] whitespace-nowrap ${
              isActive ? 'text-violet-100' : 'text-gray-500'
            }`}
          >
            {formatTime(lastMessage?.createdAt)}
          </div>

          {/* Unread Badge */}
          {hasUnread && (
            <div className="flex items-center justify-center">
              <div
                className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                title={`${unreadCount} unread messages`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual indicator for unread - left border */}
      {hasUnread && !isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />
      )}
    </button>
  )
}
