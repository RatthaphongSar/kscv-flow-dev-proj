import { useState, useRef } from 'react'
import { MoreVertical, Reply, Pencil, Trash2 } from 'lucide-react'
import UserAvatar from './UserAvatar'

interface MessageFile {
  id: string
  fileName: string
  url: string
  width?: number
  height?: number
  mimeType?: string
  sizeBytes?: number
  fileSize?: number
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

interface MessageBubbleProps {
  id: string
  isOwn: boolean
  username: string
  content: string
  time: string
  type?: 'text' | 'image' | 'file'
  files?: MessageFile[]
  edited?: boolean
  replyTo?: { user: { username: string }; content: string } | null
  readCount?: number
  totalMembers?: number
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onReply?: (messageId: string) => void
}

export default function MessageBubble({
  id,
  isOwn,
  username,
  content,
  time,
  type = 'text',
  files = [],
  edited = false,
  replyTo,
  readCount,
  totalMembers,
  onDelete,
  onEdit,
  onReply,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [activeImage, setActiveImage] = useState<MessageFile | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Calculate image dimensions based on orientation
  const getImageDimensions = () => {
    if (!file?.width || !file?.height) return { maxWidth: '320px', maxHeight: '224px' }
    
    const aspectRatio = file.width / file.height
    const isLandscape = aspectRatio > 1
    
    if (isLandscape) {
      return { maxWidth: '320px', maxHeight: '224px' } // max-w-xs, max-h-56
    } else {
      return { maxWidth: '160px', maxHeight: '320px' } // max-w-40, max-h-80
    }
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

  const imageFiles = files.filter((f) => f.mimeType?.startsWith('image/'))
  const otherFiles = files.filter((f) => !f.mimeType?.startsWith('image/'))

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
                className="px-3 py-2 rounded-xl bg-white/5 text-slate-100 text-sm border border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-lg hover:from-violet-400 hover:to-indigo-500 transition-colors"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : type === 'image' && file ? (
            // Image message
            <div className="relative group">
              <img
                src={file.url}
                alt={file.fileName}
                onClick={() => setImageViewerOpen(true)}
                className="rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                style={getImageDimensions()}
              />
              {/* Image filename tooltip */}
              <div className={`text-[10px] mt-1 ${
                isOwn ? 'text-violet-100 text-right' : 'text-gray-400'
              }`}>
                {file.fileName}
              </div>
              {/* Timestamp */}
              <div className={`text-[10px] mt-0.5 ${
                isOwn ? 'text-violet-100 text-right' : 'text-gray-400 text-right'
              }`}>
                {time}
              </div>
              
              {/* Image viewer modal */}
              {imageViewerOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                    onClick={() => setImageViewerOpen(false)}
                  >
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <button
                        onClick={() => setImageViewerOpen(false)}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words relative border
              ${
                isOwn
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-white/10 shadow-[0_12px_28px_rgba(76,29,149,0.35)]'
                  : 'bg-white/5 text-slate-100 border-white/10 shadow-[0_10px_24px_rgba(2,6,23,0.35)]'
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

                  {/* File Attachments */}
                  {(imageFiles.length > 0 || otherFiles.length > 0) && (
                    <div className="mt-2 space-y-2">
                      {imageFiles.length > 0 && (
                        <div className={`grid gap-2 ${imageFiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {imageFiles.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setActiveImage(img)}
                              className="relative group"
                            >
                              <img
                                src={img.url}
                                alt={img.fileName}
                                className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity max-w-xs max-h-80"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {otherFiles.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          download={doc.fileName}
                          className="flex items-center gap-2 p-2 bg-opacity-20 bg-blue-400 rounded-lg hover:bg-opacity-30 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path d="M2.458 12C.732 10.943 0 10.298 0 9.5 0 8.119 1.343 7 3 7h12c1.657 0 3 1.119 3 2.5 0 .798.732 1.443 2.458 2.5M11 19H5a3 3 0 01-3-3V7a3 3 0 013-3h6m0 0h6a3 3 0 013 3v9a3 3 0 01-3 3h-6m0-13v6m0 0v6" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{doc.fileName}</div>
                            {(doc.sizeBytes || doc.fileSize) && (
                              <div className="text-xs opacity-75">{formatFileSize(doc.sizeBytes || doc.fileSize || 0)}</div>
                            )}
                          </div>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1 ${
                      isOwn ? 'text-violet-100 text-right' : 'text-gray-400 text-right'
                    }`}
                  >
                    {time}
                  </div>

                  {/* Read receipt indicator - show for own messages when in a group */}
                  {isOwn && readCount !== undefined && totalMembers !== undefined && totalMembers > 1 && (
                    <div className={`text-[9px] mt-0.5 ${
                      isOwn ? 'text-violet-100 text-right' : 'text-gray-400'
                    }`}>
                      อ่านแล้ว {readCount}/{totalMembers}
                    </div>
                  )}
                </div>

                {/* Action Menu Button (Three Dots) - Inside Message Box */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-1 rounded-full transition-all ${
                      isOwn
                        ? 'text-violet-100 hover:text-white hover:bg-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="เพิ่มเติม"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMenu && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-7 bg-[#0b1220]/95 border border-white/10 rounded-xl shadow-2xl z-50 py-1 min-w-[160px] backdrop-blur"
                      onMouseLeave={() => setShowMenu(false)}
                    >
                      <button
                        onClick={handleReply}
                        className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <Reply size={14} />
                        ตอบกลับ
                      </button>
                      {isOwn && (
                        <>
                          <button
                            onClick={handleEdit}
                            className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/5 transition-colors flex items-center gap-2"
                          >
                            <Pencil size={14} />
                            แก้ไข
                          </button>
                          <button
                            onClick={handleDelete}
                            className="w-full px-3 py-2 text-left text-xs text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            ลบข้อความ
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal (for images in text messages or image-type messages) */}
      {activeImage && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={() => setActiveImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <img
                src={activeImage.url}
                alt={activeImage.fileName}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
