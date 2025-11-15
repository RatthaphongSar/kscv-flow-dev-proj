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
}) {
  return (
    <div className="flex h-full w-full text-gray-100">
      {/* ซ้าย: รายการแชท */}
      <ChatSidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={onSelectRoom}
        currentUser={currentUser}
        canCreateRoom={canCreateRoom}
        onCreateRoom={onCreateRoom}
      />

      {/* ขวา: ห้องแชท */}
      <ChatWindow
        activeRoom={activeRoom}
        messages={messages}
        currentUser={currentUser}
        text={text}
        setText={setText}
        onSendMessage={onSendMessage}
      />
    </div>
  )
}
