import React, { useState, useRef, useEffect } from 'react'
import {
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Reply,
  Copy,
  Download,
} from 'lucide-react'
import MessagePopupMenu from './MessagePopupMenu'
import ReplyPreview from './ReplyPreview'
import EditMessageInput from './EditMessageInput'

/**
 * ChatMessageItem - Individual message component with actions
 * Shows message content, file attachment, reply context, and action menu
 */
export default function ChatMessageItem({
  message,
  currentUserId,
  roomId,
  isRoomAdmin,
  isPinned = false,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  onPinMessage,
  onUnpinMessage,
  onMarkAsRead,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content || '')
  const menuRef = useRef(null)
  const messageRef = useRef(null)

  const isAuthor = message.authorId === currentUserId
  const isDeleted = message.deletedForEveryone
  const isDeletableForUser = message.deletedForUsers?.some(
    (d) => d.userId === currentUserId
  )

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEditClick = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleEditSave = async (newContent) => {
    if (onEditMessage) {
      await onEditMessage(roomId, message.id, newContent)
    }
    setIsEditing(false)
  }

  const handleDeleteClick = (mode) => {
    if (onDeleteMessage) {
      onDeleteMessage(roomId, message.id, mode)
    }
    setShowMenu(false)
  }

  const handleReplyClick = () => {
    if (onReplyMessage) {
      onReplyMessage(message)
    }
    setShowMenu(false)
  }

  const handlePinClick = () => {
    if (isPinned && onUnpinMessage) {
      onUnpinMessage(roomId, message.id)
    } else if (!isPinned && onPinMessage) {
      onPinMessage(roomId, message.id)
    }
    setShowMenu(false)
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content || '')
    setShowMenu(false)
  }

  const handleDownloadFile = () => {
    const files = message.files || []
    if (files.length > 0) {
      const link = document.createElement('a')
      link.href = files[0].url
      link.download = files[0].fileName
      link.click()
    }
    setShowMenu(false)
  }

  if (isDeleted) {
    return (
      <div className="py-2 px-3 text-center text-gray-400 text-sm italic">
        ข้อความถูกลบไปแล้ว
      </div>
    )
  }

  return (
    <div
      ref={messageRef}
      className="group py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors relative"
    >
      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute top-1 right-1 text-blue-500">
          <Pin size={14} className="fill-blue-500" />
        </div>
      )}

      {/* Reply context */}
      {message.replyTo && (
        <ReplyPreview
          originalMessage={message.replyTo}
          currentUserId={currentUserId}
        />
      )}

      {/* Message content area */}
      <div className="flex items-start gap-2">
        {/* Author avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
          {message.author?.username?.charAt(0).toUpperCase() || '?'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author & time */}
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-gray-900">
              {message.author?.username || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.editedAt && (
              <span className="text-xs text-gray-400">(แก้ไขแล้ว)</span>
            )}
          </div>

          {/* Message text */}
          {isEditing ? (
            <EditMessageInput
              initialContent={editContent}
              onSave={handleEditSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="text-sm text-gray-700 mt-1 break-words">
              {message.content}
            </p>
          )}

          {/* File attachment */}
          {message.files?.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((file) => (
                <div key={file.id} className="p-2 bg-gray-100 rounded-lg flex items-center gap-2 max-w-xs">
                  {file.mimeType?.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.fileName}
                      className="max-w-xs max-h-64 rounded-lg cursor-pointer"
                      onClick={() => window.open(file.url)}
                    />
                  ) : (
                    <>
                      <Download size={16} className="text-gray-600" />
                      <span className="text-xs text-gray-600 truncate">
                        {file.fileName}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {(file.sizeBytes / 1024).toFixed(1)} KB
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action menu button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-md transition-all"
            title="แสดงตัวเลือกเพิ่มเติม"
          >
            <MoreVertical size={16} className="text-gray-600" />
          </button>

          {/* Popup menu */}
          {showMenu && (
            <MessagePopupMenu
              message={message}
              isAuthor={isAuthor}
              isRoomAdmin={isRoomAdmin}
              isPinned={isPinned}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onReply={handleReplyClick}
              onPin={handlePinClick}
              onCopy={handleCopyText}
              onDownload={message.files?.length ? handleDownloadFile : null}
            />
          )}
        </div>
      </div>
    </div>
  )
}
