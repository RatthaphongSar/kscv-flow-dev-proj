// frontend/src/components/chat/MessageBubbleWithStatus.tsx
/**
 * Enhanced MessageBubble component with delivery status and read receipts
 * Shows: Pending (...) → Delivered (✓) → Seen (✓✓ or "Seen")
 */

import { useState, useRef } from 'react'
import UserAvatar from './UserAvatar'
import { MessageStatus } from '../../types/chat-status'

interface MessageBubbleWithStatusProps {
  id: string
  isOwn: boolean
  username: string
  content: string
  time: string
  edited?: boolean
  editedAt?: string
  status?: MessageStatus // 'pending' | 'sent' | 'delivered' | 'seen'
  seenByCount?: number // For group chats: how many have seen it
  seenByNames?: string[] // For group chats: names of who saw it
  replyTo?: { user: { username: string }; content: string } | null
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onReply?: (messageId: string) => void
  onCopy?: (content: string) => void
}

export default function MessageBubbleWithStatus({
  id,
  isOwn,
  username,
  content,
  time,
  edited = false,
  status = 'delivered',
  seenByCount = 0,
  seenByNames = [],
  replyTo,
  onDelete,
  onEdit,
  onReply,
  onCopy,
}: MessageBubbleWithStatusProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const menuRef = useRef<HTMLDivElement>(null)

  // ============================================
  // HELPER: Get status indicator UI
  // ============================================
  const getStatusIndicator = () => {
    if (!isOwn) return null

    switch (status) {
      case 'pending':
        return (
          <span title="Sending..." className="text-gray-400 text-xs ml-1">
            ⏳
          </span>
        )
      case 'sent':
        return (
          <span title="Sent" className="text-gray-400 text-xs ml-1">
            ✓
          </span>
        )
      case 'delivered':
        return (
          <span title="Delivered" className="text-gray-400 text-xs ml-1">
            ✓
          </span>
        )
      case 'seen':
        return (
          <span title="Seen" className="text-blue-400 text-xs ml-1">
            ✓✓
          </span>
        )
      default:
        return null
    }
  }

  // ============================================
  // HELPER: Get read receipt text
  // ============================================
  const getReadReceiptText = () => {
    if (!isOwn || status !== 'seen') return null

    if (seenByNames && seenByNames.length > 0) {
      if (seenByNames.length === 1) {
        return `Seen by ${seenByNames[0]}`
      } else if (seenByNames.length <= 3) {
        return `Seen by ${seenByNames.join(', ')}`
      } else {
        return `Seen by ${seenByNames[0]} and ${seenByNames.length - 1} others`
      }
    }

    if (seenByCount > 0) {
      return `Seen by ${seenByCount} ${seenByCount === 1 ? 'person' : 'people'}`
    }

    return null
  }

  // ============================================
  // ACTION HANDLERS
  // ============================================
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
    if (window.confirm('Delete this message?')) {
      onDelete?.(id)
    }
    setShowMenu(false)
  }

  const handleReply = () => {
    onReply?.(id)
    setShowMenu(false)
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative mb-2`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className={`flex max-w-2xl gap-2 relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="mt-1">
          <UserAvatar name={username} size="sm" />
        </div>

        {/* Message Content */}
        <div className="flex flex-col max-w-xl relative">
          {/* Username */}
          <span
            className={`text-[11px] mb-1 ${
              isOwn ? 'text-right text-gray-400' : 'text-left text-gray-400'
            }`}
          >
            {username}
          </span>

          {/* Reply Context (if replying to someone) */}
          {replyTo && (
            <div
              className={`mb-2 p-2 border-l-2 border-violet-500 bg-[#111827] rounded text-xs max-w-xs ${
                isOwn ? 'bg-violet-900/20' : 'bg-[#111827]'
              }`}
            >
              <div className="text-gray-400 font-medium">{replyTo.user.username}</div>
              <div className="text-gray-300 truncate">{replyTo.content}</div>
            </div>
          )}

          {/* Message Bubble */}
          {isEditing ? (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#111827] border border-violet-500">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="bg-[#020617] border border-[#374151] rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-3 py-2 rounded-lg break-words ${
                isOwn
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#1f2937] text-gray-100'
              }`}
            >
              {content}
              {edited && (
                <span className="text-[10px] ml-2 opacity-70">(edited)</span>
              )}
            </div>
          )}

          {/* Timestamp + Status Indicator (Only for own messages) */}
          <div
            className={`text-[10px] mt-1 flex items-center ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className="text-gray-400">{time}</span>
            {getStatusIndicator()}
          </div>

          {/* Read Receipt Text (below message) */}
          {getReadReceiptText() && (
            <div className={`text-[9px] mt-0.5 ${isOwn ? 'text-right text-blue-300' : 'text-left text-gray-500'}`}>
              {getReadReceiptText()}
            </div>
          )}

          {/* Action Menu Button (Three Dots) */}
          <div className="relative mt-1 flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-0.5 rounded transition-opacity ${
                isOwn ? 'text-violet-100 hover:opacity-75' : 'text-gray-400 hover:opacity-75'
              }`}
              title="More options"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
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
              >
                {/* Reply - for all */}
                <button
                  onClick={handleReply}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2"
                >
                  <span>↩</span> Reply
                </button>

                {/* Edit + Delete - only for own */}
                {isOwn && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2"
                    >
                      <span>✎</span> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <span>⊠</span> Delete
                    </button>
                    <div className="border-t border-[#374151]" />
                  </>
                )}

                {/* Copy - for all */}
                <button
                  onClick={handleCopy}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-200 hover:bg-[#374151] transition-colors flex items-center gap-2"
                >
                  <span>◫</span> Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
