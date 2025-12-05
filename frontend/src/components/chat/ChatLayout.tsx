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
}) {
  const [showRoomsList, setShowRoomsList] = useState(false)

  const handleSelectRoom = (room) => {
    onSelectRoom(room)
    setShowRoomsList(false) // Close sidebar after selecting room
  }

  return (
    <div className="flex flex-1 min-h-0 w-full text-gray-100 overflow-hidden flex-col lg:flex-row">
      {/* Mobile Hamburger Button - Only visible when rooms list is hidden */}
      {!showRoomsList && (
        <div className="lg:hidden shrink-0 border-b border-[#1f2937] bg-[#0f172a] px-3 py-2 flex items-center justify-between">
          <button
            onClick={() => setShowRoomsList(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
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
          <div className="lg:hidden shrink-0 border-b border-[#1f2937] bg-[#0f172a] px-3 py-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">ห้องแชท</h2>
            <button
              onClick={() => setShowRoomsList(false)}
              className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors"
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
            />
          </div>
        </>
      )}

      {/* Desktop: Rooms sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-[#1f2937]">
        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={handleSelectRoom}
          currentUser={currentUser}
          canCreateRoom={canCreateRoom}
          onCreateRoom={onCreateRoom}
          pinnedRooms={pinnedRooms}
          onTogglePin={onTogglePin}
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
    </div>
  )
}
