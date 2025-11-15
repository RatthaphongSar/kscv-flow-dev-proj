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
}) {
  return (
    <div className="flex flex-1 min-h-0 w-full text-gray-100 overflow-hidden">
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
        sendLoading={sendLoading}
        sendError={sendError}
        onDeleteMessage={onDeleteMessage}
        onEditMessage={onEditMessage}
        onReplyMessage={onReplyMessage}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
      />
    </div>
  )
}
