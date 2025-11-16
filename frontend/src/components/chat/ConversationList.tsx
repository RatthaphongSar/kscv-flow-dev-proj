import { useUnreadCounts } from '../../hooks/useUnreadCounts'
import { Pin } from 'lucide-react'

interface Room {
  id: string
  name: string
  lastMessagePreview?: string
}

interface ConversationListProps {
  rooms: Room[]
  activeRoom?: Room | null
  onSelectRoom: (room: Room) => void
  pinnedRooms?: Array<{ roomId: string }>
  onTogglePin?: (roomId: string) => void
}

export default function ConversationList({
  rooms,
  activeRoom,
  onSelectRoom,
  pinnedRooms = [],
  onTogglePin,
}: ConversationListProps) {
  const { getUnreadCount } = useUnreadCounts()

  if (!rooms.length) {
    return (
      <div className="p-4 text-sm text-gray-500">
        ยังไม่มีห้องสนทนา
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
      {rooms.map((room) => {
        const isActive = activeRoom?.id === room.id
        const unreadCount = getUnreadCount(room.id)
        const isPinned = pinnedRooms.some(p => p.roomId === room.id)

        return (
          <div
            key={room.id}
            className="group flex items-center gap-1"
          >
            <button
              onClick={() => onSelectRoom(room)}
              className={`flex-1 flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative
              ${
                isActive
                  ? 'bg-[#0A4DAD] text-white shadow-md'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  unreadCount > 0 && !isActive ? 'font-bold text-gray-900' : ''
                }`}>
                  {room.name}
                  {isPinned && <Pin size={14} className="ml-1 inline text-amber-400 fill-amber-400" />}
                </div>
                <div
                  className={`text-xs truncate ${
                    isActive ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {room.lastMessagePreview || 'เริ่มการสนทนาได้เลย'}
                </div>
              </div>

              {/* Unread badge */}
              {unreadCount > 0 && !isActive && (
                <div className="flex-shrink-0 ml-2 px-2 py-1 bg-violet-600 text-white rounded-full text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>

            {/* Pin button - moved OUTSIDE button to avoid nesting */}
            {onTogglePin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(room.id)
                }}
                className={`flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isPinned
                    ? 'text-amber-400 bg-amber-100/20 hover:bg-amber-200/30'
                    : 'text-gray-400 hover:text-amber-600 hover:bg-gray-100/20'
                }`}
                title={isPinned ? 'ถอด Pin ห้องนี้' : 'เก็บไว้ (Pin) ห้องนี้'}
              >
                <Pin size={16} className={isPinned ? 'fill-current' : ''} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
