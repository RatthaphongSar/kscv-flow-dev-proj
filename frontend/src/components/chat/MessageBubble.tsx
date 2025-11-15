import { useState, useRef } from 'react'
import UserAvatar from './UserAvatar'

interface MessageBubbleProps {
  id: string
  isOwn: boolean
  username: string
  content: string
  time: string
  edited?: boolean
  replyTo?: { user: { username: string }; content: string } | null
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onReply?: (messageId: string) => void
  onCopy?: (content: string) => void
}

export default function MessageBubble({
  id,
  isOwn,
  username,
  content,
  time,
  edited = false,
  replyTo,
  onDelete,
  onEdit,
  onReply,
  onCopy,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    onCopy?.(content)
    setShowMenu(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== content) {
      onEdit?.(id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('ลบข้อความนี้ใช่หรือไม่?')) {
      onDelete?.(id)
    }
    setShowMenu(false)
  }

  const handleReply = () => {
    onReply?.(id)
    setShowMenu(false)
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative mb-2`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div
        className={`flex max-w-2xl gap-2 relative ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="mt-1">
          <UserAvatar name={username} size="sm" />
        </div>

        {/* Message Content */}
        <div className="flex flex-col max-w-xl relative">
          <span
            className={`text-[11px] mb-1 ${
              isOwn ? 'text-right text-gray-400' : 'text-left text-gray-400'
            }`}
          >
            {username}
          </span>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#111827] text-gray-100 text-sm border border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded transition-colors"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words relative
              ${
                isOwn
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#111827] text-gray-100'
              }`}
            >
              {/* Reply Context */}
              {replyTo && (
                <div className={`mb-2 pb-2 border-b text-xs opacity-80 ${
                  isOwn ? 'border-violet-400' : 'border-[#374151]'
                }`}>
                  <div className={isOwn ? 'text-violet-100' : 'text-gray-400'}>
                    ↩ ตอบกลับ {replyTo.user.username}
                  </div>
                  <div className={`italic truncate mt-0.5 ${
                    isOwn ? 'text-violet-50' : 'text-gray-300'
                  }`}>
                    "{replyTo.content}"
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="pr-2">{content}</p>
                  {edited && (
                    <span className="text-[9px] opacity-70 ml-1">(แก้ไข)</span>
                  )}
                  <div
                    className={`text-[10px] mt-1 ${
                      isOwn ? 'text-violet-100 text-right' : 'text-gray-400 text-right'
                    }`}
                  >
                    {time}
                  </div>
                </div>

                {/* Action Menu Button (Three Dots) - Inside Message Box */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-0.5 rounded transition-opacity ${
                      isOwn ? 'text-violet-100 hover:opacity-75' : 'text-gray-400 hover:opacity-75'
                    }`}
                    title="เพิ่มเติม"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>

                  {/* Action Menu Dropdown */}
                  {showMenu && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-6 bg-[#1f2937] border border-[#374151] rounded-lg shadow-xl z-50 py-1 min-w-max"
                      onMouseLeave={() => setShowMenu(false)}
                    >
                      {/* Reply - Show for all messages */}
                      <button
                        onClick={handleReply}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>↩</span>
                        ตอบกลับ
                      </button>

                      {/* Edit - Show only for own messages */}
                      {isOwn && (
                        <>
                          <button
                            onClick={handleEdit}
                            className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>✎</span>
                            แก้ไข
                          </button>
                          <button
                            onClick={handleDelete}
                            className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2 whitespace-nowrap"
                          >
                            <span>⊠</span>
                            ลบ
                          </button>
                          <div className="border-t border-[#374151]" />
                        </>
                      )}

                      {/* Copy - Show for all messages */}
                      <button
                        onClick={handleCopy}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>◫</span>
                        คัดลอก
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
