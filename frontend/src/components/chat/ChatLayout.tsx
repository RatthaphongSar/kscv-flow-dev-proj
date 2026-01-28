import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'

export default function ChatLayout({
  rooms,
  activeRoom,
  onSelectRoom,
  messages,
  currentUser,
  text,
  setText,
  onSendMessage,
  canCreateRoom,
  onCreateRoom,
  sendLoading,
  sendError,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  replyingTo,
  onCancelReply,
  pinnedRooms,
  onTogglePin,
  selectedFiles,
  onAttachFiles,
  onRemoveFile,
  onClearFiles,
  unreadCounts,
  totalUnread,
  notifications,
  onDismissNotification,
}) {
  const [showRoomsList, setShowRoomsList] = useState(false)

  const handleSelectRoom = (room) => {
    onSelectRoom(room)
    setShowRoomsList(false) // Close sidebar after selecting room
  }

  return (
    <div className="flex flex-1 min-h-0 w-full text-gray-100 overflow-hidden flex-col lg:flex-row bg-[#0b1220]">
      {/* Mobile Hamburger Button - Only visible when rooms list is hidden */}
      {!showRoomsList && (
        <div className="lg:hidden shrink-0 border-b border-white/5 bg-[#0b1220] px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => setShowRoomsList(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
            <span className="text-sm font-semibold">ห้องแชท</span>
          </button>
        </div>
      )}

      {/* Mobile: Rooms List takes full screen */}
      {showRoomsList && (
        <>
          {/* Close button + header for mobile */}
          <div className="lg:hidden shrink-0 border-b border-white/5 bg-[#0b1220] px-3 py-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">ห้องแชท</h2>
            <button
              onClick={() => setShowRoomsList(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="ปิด"
            >
              <X size={20} />
            </button>
          </div>

          {/* Full-screen rooms list on mobile */}
          <div className="lg:hidden w-full h-full overflow-hidden flex flex-col">
            <ChatSidebar
              rooms={rooms}
              activeRoom={activeRoom}
              onSelectRoom={handleSelectRoom}
              currentUser={currentUser}
              canCreateRoom={canCreateRoom}
              onCreateRoom={onCreateRoom}
              pinnedRooms={pinnedRooms}
              onTogglePin={onTogglePin}
              unreadCounts={unreadCounts}
              totalUnread={totalUnread}
            />
          </div>
        </>
      )}

      {/* Desktop: Rooms sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-white/5">
        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={handleSelectRoom}
          currentUser={currentUser}
          canCreateRoom={canCreateRoom}
          onCreateRoom={onCreateRoom}
          pinnedRooms={pinnedRooms}
          onTogglePin={onTogglePin}
          unreadCounts={unreadCounts}
          totalUnread={totalUnread}
        />
      </div>

      {/* Desktop: Chat window - only show on desktop or when no room list selected on mobile */}
      {!showRoomsList && (
        <ChatWindow
          activeRoom={activeRoom}
          messages={messages}
          currentUser={currentUser}
          text={text}
          setText={setText}
          onSendMessage={onSendMessage}
          sendLoading={sendLoading}
          sendError={sendError}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          onReplyMessage={onReplyMessage}
          replyingTo={replyingTo}
          onCancelReply={onCancelReply}
          selectedFiles={selectedFiles}
          onAttachFiles={onAttachFiles}
          onRemoveFile={onRemoveFile}
          onClearFiles={onClearFiles}
        />
      )}

      {notifications?.length > 0 && (
        <div className="fixed right-4 top-4 z-50 space-y-2 w-80 max-w-[90vw]">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-white/10 bg-[#0b1220] shadow-xl px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">ข้อความใหม่</div>
                  <div className="text-sm font-semibold text-white truncate">
                    {note.roomName}
                  </div>
                  <div className="text-xs text-slate-300 truncate mt-1">
                    {note.content}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDismissNotification?.(note.id)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
