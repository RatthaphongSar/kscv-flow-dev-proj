// frontend/src/components/chat/ChatWindow.tsx
import { useState } from 'react'
import ChatConversation from './ChatConversation'
import MessageInput from './MessageInput'
import UserAvatar from './UserAvatar'
import AddStudentsModal from './AddStudentsModal'

interface ChatWindowProps {
  activeRoom: { id: string; name?: string } | null
  messages: any[]
  currentUser: { id: string; username?: string; role?: string } | null
  text: string
  setText: (value: string) => void
  onSendMessage: (e?: React.FormEvent | KeyboardEvent) => void
  sendLoading?: boolean
  sendError?: string
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
  replyingTo?: { id: string; username: string; content: string } | null
  onCancelReply?: () => void
}

export default function ChatWindow({
  activeRoom,
  messages,
  currentUser,
  text,
  setText,
  onSendMessage,
  sendLoading = false,
  sendError = '',
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  replyingTo,
  onCancelReply,
}: ChatWindowProps) {
  const [showAddStudents, setShowAddStudents] = useState(false)
  const isTeacher = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN'
  
  const title = activeRoom?.name || 'เลือกการสนทนา'
  const subtitle = activeRoom
    ? 'สนทนาแบบส่วนตัวหรือกลุ่มสำหรับวิชา / งานนี้'
    : 'เลือกห้องจากด้านซ้ายเพื่อเริ่มการสนทนา'

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937] bg-[#020617] shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <UserAvatar name={title} size="sm" />
          <div>
            <h1 className="text-sm font-semibold">{title}</h1>
            <p className="text-[11px] text-gray-400">{subtitle}</p>
          </div>
        </div>

        {/* Actions */}
        {activeRoom && isTeacher && (
          <button
            onClick={() => setShowAddStudents(true)}
            className="mr-4 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs
                       transition-colors duration-200"
            title="เพิ่มนักเรียนเข้าห้อง"
          >
            ➕ เพิ่มสมาชิก
          </button>
        )}

        {/* แท็บด้านบน (ยังไม่ต้องมี logic) */}
        {activeRoom && (
          <div className="flex gap-4 text-xs text-gray-400">
            <button className="border-b-2 border-violet-500 text-gray-100 pb-1">
              แชท
            </button>
            <button className="pb-1 hover:text-gray-200">ไฟล์</button>
            <button className="pb-1 hover:text-gray-200">โน้ต</button>
          </div>
        )}
      </div>

      {/* Messages area – ล็อกความสูง scroll ภายใน + min-h-0 เพื่อให้ flex ทำงานถูกต้อง */}
      {activeRoom ? (
        <ChatConversation
          roomId={activeRoom.id}
          messages={messages}
          currentUser={currentUser}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          onReplyMessage={onReplyMessage}
        />
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center text-sm text-gray-500">
          เลือกห้องจากด้านซ้ายเพื่อเริ่มสนทนา
        </div>
      )}

      {/* Input */}
      {activeRoom && (
        <div className="border-t border-[#1f2937] bg-[#020617] px-4 py-3 shrink-0">
          {sendError && (
            <div className="mb-2 px-3 py-2 bg-red-900/30 border border-red-600/50 rounded-md text-xs text-red-300">
              ⚠️ {sendError}
            </div>
          )}
          {replyingTo && (
            <div className="mb-2 p-2 bg-[#111827] border-l-2 border-violet-500 rounded flex justify-between items-start text-xs">
              <div>
                <div className="text-gray-400">ตอบกลับ {replyingTo.username}</div>
                <div className="text-gray-300 truncate">{replyingTo.content}</div>
              </div>
              <button
                onClick={onCancelReply}
                className="text-gray-400 hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
          )}
          <MessageInput 
            text={text} 
            setText={setText} 
            onSubmit={onSendMessage}
            isLoading={sendLoading}
          />
        </div>
      )}

      {/* Add Students Modal */}
      {activeRoom && (
        <AddStudentsModal
          roomId={activeRoom.id}
          isOpen={showAddStudents}
          onClose={() => setShowAddStudents(false)}
          onSuccess={() => {
            // Optional: reload messages or refresh room data
            console.log('Members added successfully')
          }}
        />
      )}
    </main>
  )
}
