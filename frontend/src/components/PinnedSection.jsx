import React, { useState, useEffect } from 'react'
import { Pin, X, ChevronDown, ChevronUp } from 'lucide-react'
import { ChatAPI } from '../services/chat'

/**
 * PinnedSection - Display pinned messages above chat area
 * Shows sticky pinned messages with ability to unpin
 */
export default function PinnedSection({
  roomId,
  currentUserId,
  isRoomAdmin,
  onUnpin,
}) {
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPinnedMessages()
  }, [roomId])

  const loadPinnedMessages = async () => {
    try {
      setIsLoading(true)
      const data = await ChatAPI.getPinnedMessages(roomId)
      setPinnedMessages(data || [])
    } catch (err) {
      console.error('Load pinned messages error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpin = async (messageId) => {
    try {
      await ChatAPI.unpinMessage(roomId, messageId)
      setPinnedMessages(pinnedMessages.filter((p) => p.messageId !== messageId))
      if (onUnpin) {
        onUnpin(messageId)
      }
    } catch (err) {
      console.error('Unpin error:', err)
      alert('ไม่สามารถถอนปักหมุดได้')
    }
  }

  if (pinnedMessages.length === 0) {
    return null
  }

  return (
    <div className="bg-amber-50 border-b-2 border-amber-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Pin size={16} className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-900">
            ข้อความที่ปักหมุด ({pinnedMessages.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-amber-600" />
        ) : (
          <ChevronDown size={16} className="text-amber-600" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto border-t border-amber-200">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-amber-700">
              กำลังโหลด...
            </div>
          ) : (
            <div className="space-y-0">
              {pinnedMessages.map((pin) => (
                <div
                  key={pin.messageId}
                  className="px-4 py-2 border-b border-amber-100 hover:bg-amber-100 flex items-start gap-2 group"
                >
                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-amber-900">
                      {pin.message?.author?.username || 'Unknown'}
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {pin.message?.content || '[ไฟล์แนบ]'}
                    </p>
                    {pin.message?.file && (
                      <div className="text-xs text-gray-600 mt-1">
                        📎 {pin.message.file.fileName}
                      </div>
                    )}
                  </div>

                  {/* Unpin button */}
                  {isRoomAdmin && (
                    <button
                      onClick={() => handleUnpin(pin.messageId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-200 rounded transition-all flex-shrink-0"
                      title="ถอนปักหมุด"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
