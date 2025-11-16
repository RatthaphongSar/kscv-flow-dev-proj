// frontend/src/components/chat/ChatWindow.tsx
import { useState } from 'react'
import ChatConversation from './ChatConversation'
import MessageInput from './MessageInput'
import UserAvatar from './UserAvatar'
import AddStudentsModal from './AddStudentsModal'
import ChatPanelTabs, { type ChatPanelTab } from './ChatPanelTabs'
import { ChatFilesPanel } from './ChatFilesPanel'
import { ChatNotesPanel } from './ChatNotesPanel'
import { MembersPanel } from './MembersPanel'
import { RoomSettingsMenu } from './RoomSettingsMenu'

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
  onAttachFiles?: (files: FileList) => void
  selectedFiles?: any[]
  onRemoveFile?: (fileId: string) => void
  onClearFiles?: () => void
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
  onAttachFiles,
  selectedFiles = [],
  onRemoveFile,
}: ChatWindowProps) {
  const [showAddStudents, setShowAddStudents] = useState(false)
  const [activeTab, setActiveTab] = useState<ChatPanelTab>('chat')
  const isTeacher = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN'
  
  const title = activeRoom?.name || 'เลือกการสนทนา'
  const subtitle = activeRoom
    ? 'สนทนาแบบส่วนตัวหรือกลุ่มสำหรับวิชา / งานนี้'
    : 'เลือกห้องจากด้านซ้ายเพื่อเริ่มการสนทนา'

  const handleRoomDeleted = () => {
    // Room will be removed from the room list when deleted
    // The component should automatically switch to no room selected
  }

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
        {activeRoom && (
          <div className="flex items-center gap-2">
            {isTeacher && (
              <button
                onClick={() => setShowAddStudents(true)}
                className="px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs
                           transition-colors duration-200"
                title="เพิ่มนักเรียนเข้าห้อง"
              >
                ➕ เพิ่มสมาชิก
              </button>
            )}
            
            {/* Room Settings Menu */}
            {isTeacher && (
              <RoomSettingsMenu
                roomId={activeRoom.id}
                roomName={title}
                isTeacher={isTeacher}
                onRoomDeleted={handleRoomDeleted}
              />
            )}
          </div>
        )}
      </div>

      {/* Panel tabs (แชท / ไฟล์ / โน้ต / สมาชิก) */}
      {activeRoom && (
        <div className="px-5 border-b border-[#374151] bg-[#020617] shrink-0">
          <ChatPanelTabs value={activeTab} onChange={setActiveTab} isTeacher={isTeacher} />
        </div>
      )}

      {/* Messages area – ล็อกความสูง scroll ภายใน + min-h-0 เพื่อให้ flex ทำงานถูกต้อง */}
      {activeRoom ? (
        <>
          {activeTab === 'chat' && (
            <ChatConversation
              roomId={activeRoom.id}
              messages={messages}
              currentUser={currentUser}
              onDeleteMessage={onDeleteMessage}
              onEditMessage={onEditMessage}
              onReplyMessage={onReplyMessage}
            />
          )}
          {activeTab === 'files' && (
            <ChatFilesPanel roomId={activeRoom.id} />
          )}
          {activeTab === 'notes' && (
            <ChatNotesPanel roomId={activeRoom.id} isTeacher={isTeacher} />
          )}
          {activeTab === 'members' && (
            <MembersPanel
              roomId={activeRoom.id}
              isTeacher={isTeacher}
              currentUserId={currentUser?.id || ''}
            />
          )}
        </>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center text-sm text-gray-500">
          เลือกห้องจากด้านซ้ายเพื่อเริ่มสนทนา
        </div>
      )}

      {/* Input */}
      {activeRoom && activeTab === 'chat' && (
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

          {/* File Preview Gallery */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file) => (
                <div key={file.id} className="relative">
                  {file.preview ? (
                    <div className="relative group">
                      <img
                        src={file.preview}
                        alt={file.filename}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => onRemoveFile?.(file.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="relative h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-300 text-center px-1">{file.filename.split('.').pop()?.toUpperCase()}</span>
                      <button
                        onClick={() => onRemoveFile?.(file.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <MessageInput 
            text={text} 
            setText={setText} 
            onSubmit={onSendMessage}
            isLoading={sendLoading}
            onAttachFiles={onAttachFiles}
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
