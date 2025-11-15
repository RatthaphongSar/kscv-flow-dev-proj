import ChatConversation from './ChatConversation'
import MessageInput from './MessageInput'
import UserAvatar from './UserAvatar'

export default function ChatWindow({
  activeRoom,
  messages,
  currentUser,
  text,
  setText,
  onSendMessage,
}) {
  const title = activeRoom?.name || 'เลือกการสนทนา'
  const subtitle = activeRoom
    ? 'สนทนาแบบส่วนตัวหรือกลุ่มสำหรับวิชา / งานนี้'
    : 'เลือกห้องจากด้านซ้ายเพื่อเริ่มการสนทนา'

  return (
    <main className="flex-1 flex flex-col bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937] bg-[#020617]">
        <div className="flex items-center gap-3">
          <UserAvatar name={title} size="sm" />
          <div>
            <h1 className="text-sm font-semibold">{title}</h1>
            <p className="text-[11px] text-gray-400">{subtitle}</p>
          </div>
        </div>

        {/* แท็บด้านบน (ยังไม่ต้องมี logic) */}
        {activeRoom && (
          <div className="flex gap-4 text-xs text-gray-400">
            <button className="border-b-2 border-violet-500 text-gray-100 pb-1">
              แชท
            </button>
            <button className="pb-1 hover:text-gray-200">
              ไฟล์
            </button>
            <button className="pb-1 hover:text-gray-200">
              โน้ต
            </button>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#020617]">
        {activeRoom ? (
          <ChatConversation messages={messages} currentUser={currentUser} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            เลือกห้องจากด้านซ้ายเพื่อเริ่มสนทนา
          </div>
        )}
      </div>

      {/* Input */}
      {activeRoom && (
        <div className="border-t border-[#1f2937] bg-[#020617] px-4 py-3">
          <MessageInput
            text={text}
            setText={setText}
            onSubmit={onSendMessage}
          />
        </div>
      )}
    </main>
  )
}
