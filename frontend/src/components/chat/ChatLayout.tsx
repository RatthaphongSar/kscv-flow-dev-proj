import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import { useTheme } from '../ThemeProvider'

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
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)

  const handleSelectRoom = (room) => {
    onSelectRoom(room)
    setShowRoomsList(false) // Close sidebar after selecting room
  }

  return (
    <div className={`flex flex-1 min-h-0 w-full overflow-hidden flex-col lg:flex-row ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b1220] text-gray-100'}`}>
      {/* Mobile Hamburger Button - Only visible when rooms list is hidden */}
      {!showRoomsList && (
        <div className={`lg:hidden shrink-0 border-b px-3 sm:px-4 py-2.5 flex items-center justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1220] border-white/5'}`}>
          <button
            onClick={() => setShowRoomsList(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10'}`}
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
          <div className={`lg:hidden shrink-0 border-b px-3 sm:px-4 py-2.5 flex items-center justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1220] border-white/5'}`}>
            <h2 className="text-sm sm:text-base font-semibold">ห้องแชท</h2>
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
      <div className={`hidden lg:flex lg:w-[300px] xl:w-[320px] lg:flex-col lg:border-r ${isLight ? 'lg:border-slate-200' : 'lg:border-white/5'}`}>
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
        <div className="fixed right-3 top-3 sm:right-4 sm:top-4 z-50 space-y-2 w-[92vw] sm:w-80 max-w-[90vw]">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`rounded-xl border shadow-xl px-4 py-3 ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0b1220]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ข้อความใหม่</div>
                  <div className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {note.roomName}
                  </div>
                  <div className={`text-xs truncate mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
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
