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
import { useTheme } from '../ThemeProvider'

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
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)
  
  const title = activeRoom?.name || 'เลือกการสนทนา'
  const subtitle = activeRoom
    ? 'สนทนาแบบส่วนตัวหรือกลุ่มสำหรับวิชา / งานนี้'
    : 'เลือกห้องจากด้านซ้ายเพื่อเริ่มการสนทนา'

  const handleRoomDeleted = () => {
    // Room will be removed from the room list when deleted
    // The component should automatically switch to no room selected
  }

  return (
    <main className={`flex-1 flex flex-col min-h-0 ${isLight ? 'bg-slate-50' : 'bg-[#0b1220]'}`}>
      {/* Header */}
      <div className={`border-b shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1220] border-white/5'}`}>
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <UserAvatar name={title} size="sm" />
            <div className="min-w-0">
              <h1 className={`text-sm sm:text-base font-semibold truncate ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>{title}</h1>
              <p className={`text-[11px] sm:text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
            </div>
          </div>

          {activeRoom && (
            <div className="flex items-center gap-2">
              {isTeacher && (
                <button
                  onClick={() => setShowAddStudents(true)}
                  className="px-3 py-1.5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs transition-colors duration-200 shadow-sm"
                  title="เพิ่มนักเรียนเข้าห้อง"
                >
                  ➕ เพิ่มสมาชิก
                </button>
              )}
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
      </div>

      {/* Panel tabs (แชท / ไฟล์ / โน้ต / สมาชิก) */}
      {activeRoom && (
        <div className={`shrink-0 ${isLight ? 'bg-white' : 'bg-[#0b1220]'}`}>
          <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8">
            <ChatPanelTabs value={activeTab} onChange={setActiveTab} isTeacher={isTeacher} />
          </div>
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
        <div className={`flex-1 min-h-0 flex items-center justify-center text-sm ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
          เลือกห้องจากด้านซ้ายเพื่อเริ่มสนทนา
        </div>
      )}

      {/* Input */}
      {activeRoom && activeTab === 'chat' && (
        <div className={`border-t shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1220] border-white/5'}`}>
          <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {sendError && (
              <div className={`mb-3 px-3 py-2 rounded-md text-[11px] sm:text-xs ${isLight ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-900/30 border border-red-600/50 text-red-300'}`}>
                ⚠️ {sendError}
              </div>
            )}
            {replyingTo && (
              <div className={`mb-3 p-3 border rounded-xl flex justify-between items-start text-[11px] sm:text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <div className="min-w-0">
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ตอบกลับ {replyingTo.username}</div>
                  <div className={`truncate ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{replyingTo.content}</div>
                </div>
                <button
                  onClick={onCancelReply}
                  className="text-slate-400 hover:text-slate-200 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="relative">
                    {file.preview ? (
                      <div className="relative group">
                        <img
                          src={file.preview}
                          alt={file.filename}
                          className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => onRemoveFile?.(file.id)}
                          className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px]"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs text-gray-300 text-center px-1">{file.filename.split('.').pop()?.toUpperCase()}</span>
                        <button
                          onClick={() => onRemoveFile?.(file.id)}
                          className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px]"
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
