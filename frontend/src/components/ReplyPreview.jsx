import React from 'react'
import { Reply } from 'lucide-react'

/**
 * ReplyPreview - Shows the message being replied to
 * Displays brief context of the original message
 */
export default function ReplyPreview({ originalMessage, currentUserId }) {
  if (!originalMessage) return null

  const isOwnMessage = originalMessage.authorId === currentUserId
  const previewText = originalMessage.content
    ?.substring(0, 100)
    .replace(/\n/g, ' ') || '[ไฟล์แนบ]'

  return (
    <div className="mb-2 pl-3 border-l-2 border-blue-400 bg-blue-50 rounded-r-md py-1 px-2">
      <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
        <Reply size={12} />
        <span className="font-semibold">
          {isOwnMessage ? 'คุณ' : originalMessage.author?.username || 'Unknown'}
        </span>
      </div>
      <p className="text-xs text-gray-600 truncate">{previewText}</p>
    </div>
  )
}
