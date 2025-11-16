import React, { useState } from 'react'
import {
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Reply,
  Copy,
  Download,
  AlertTriangle,
} from 'lucide-react'

/**
 * MessagePopupMenu - Context menu for message actions
 * Shows available actions based on user permissions
 */
export default function MessagePopupMenu({
  message,
  isAuthor,
  isRoomAdmin,
  isPinned,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onCopy,
  onDownload,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteMode, setDeleteMode] = useState('me')

  const handleDeleteClick = (mode) => {
    onDelete(mode)
    setShowDeleteConfirm(false)
  }

  if (showDeleteConfirm) {
    return (
      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
        {/* Delete confirmation */}
        <div className="p-3 space-y-2">
          <p className="text-sm font-semibold text-gray-900 mb-3">ลบข้อความ?</p>

          <button
            onClick={() => handleDeleteClick('me')}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <Trash2 size={16} />
            ลบสำหรับฉัน
          </button>

          {isAuthor && (
            <button
              onClick={() => handleDeleteClick('everyone')}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              ลบสำหรับทั้งหมด
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
      <div className="py-1">
        {/* Reply */}
        {onReply && (
          <button
            onClick={onReply}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="ตอบกลับข้อความนี้"
          >
            <Reply size={16} />
            ตอบกลับ
          </button>
        )}

        {/* Copy */}
        {onCopy && (
          <button
            onClick={onCopy}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="คัดลอกข้อความ"
          >
            <Copy size={16} />
            คัดลอก
          </button>
        )}

        {/* Download file */}
        {onDownload && (
          <button
            onClick={onDownload}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="ดาวน์โหลดไฟล์"
          >
            <Download size={16} />
            ดาวน์โหลด
          </button>
        )}

        {/* Pin/Unpin - admin only */}
        {(isRoomAdmin || isAuthor) && onPin && (
          <button
            onClick={onPin}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title={isPinned ? 'ถอนปักหมุด' : 'ปักหมุด'}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            {isPinned ? 'ถอนปักหมุด' : 'ปักหมุด'}
          </button>
        )}

        {/* Edit - author only */}
        {isAuthor && onEdit && (
          <button
            onClick={onEdit}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="แก้ไขข้อความ"
          >
            <Edit2 size={16} />
            แก้ไข
          </button>
        )}

        {/* Delete */}
        {(isAuthor || isRoomAdmin) && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
            title="ลบข้อความ"
          >
            <Trash2 size={16} />
            ลบ
          </button>
        )}
      </div>
    </div>
  )
}
