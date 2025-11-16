import React from 'react'
import { X } from 'lucide-react'

/**
 * ReplyInput - Shows the message being replied to with ability to cancel
 * Positioned above the message input area
 */
export default function ReplyInput({ message, onCancel }) {
  if (!message) return null

  const previewText = message.content?.substring(0, 80).replace(/\n/g, ' ') || '[ไฟล์แนบ]'

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 px-3 py-2 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs text-blue-600 font-semibold mb-1">
          ตอบกลับให้: {message.author?.username || 'Unknown'}
        </p>
        <p className="text-sm text-gray-700 truncate">{previewText}</p>
      </div>
      <button
        onClick={onCancel}
        className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
        title="ยกเลิกการตอบกลับ"
      >
        <X size={16} className="text-blue-600" />
      </button>
    </div>
  )
}
