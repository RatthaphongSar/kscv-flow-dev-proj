export default function ConversationList({ rooms, activeRoom, onSelectRoom }) {
  if (!rooms.length) {
    return (
      <div className="p-4 text-sm text-gray-500">
        ยังไม่มีห้องสนทนา
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
      {rooms.map(room => {
        const isActive = activeRoom?.id === room.id
        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left
            ${
              isActive
                ? 'bg-[#0A4DAD] text-white shadow-md'
                : 'text-gray-700 hover:bg-white'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="flex-1">
              <div className="text-sm font-medium truncate">
                {room.name}
              </div>
              <div
                className={`text-xs truncate ${
                  isActive ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {room.lastMessagePreview || 'เริ่มการสนทนาได้เลย'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
