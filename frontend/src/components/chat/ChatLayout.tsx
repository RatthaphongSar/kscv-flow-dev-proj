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
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden shrink-0 border-b border-[#1f2937] bg-[#020617] px-3 py-2">
        <button
          onClick={() => setShowRoomsList(!showRoomsList)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800"
        >
          {showRoomsList ? <X size={20} /> : <Menu size={20} />}
          <span className="text-sm font-semibold">
            {showRoomsList ? 'ปิด' : 'ห้องแชท'}
          </span>
        </button>
      </div>

      {/* ซ้าย: รายการแชท */}
      {showRoomsList && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowRoomsList(false)} />
      )}
      
      <div className={`${
        showRoomsList
          ? 'fixed inset-y-0 left-0 z-50 w-72'
          : 'hidden'
      } lg:static lg:block lg:w-auto`}>
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

      {/* ขวา: ห้องแชท */}
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
    </div>
  )
}
