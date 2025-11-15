import { useState } from 'react'

interface MessageActionMenuProps {
  messageId: string
  content: string
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onReply?: (messageId: string) => void
}

export default function MessageActionMenu({
  messageId,
  content,
  onDelete,
  onEdit,
  onReply,
}: MessageActionMenuProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)

  const handleDelete = () => {
    if (window.confirm('ลบข้อความนี้ใช่หรือไม่?')) {
      onDelete?.(messageId)
    }
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content) {
      onEdit?.(messageId, editContent.trim())
      setIsEditing(false)
    } else if (!editContent.trim()) {
      alert('ข้อความไม่สามารถว่างเปล่าได้')
    } else {
      setIsEditing(false)
    }
  }

  const handleReply = () => {
    onReply?.(messageId)
  }

  if (isEditing) {
    return (
      <div className="absolute -right-2 top-10 bg-[#111827] border border-[#374151] rounded-lg p-3 z-20 w-64 shadow-xl">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-[#020617] border border-[#374151] rounded px-2 py-1 text-sm text-gray-100
                     placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
          rows={2}
          placeholder="แก้ไขข้อความ..."
        />
        <div className="flex gap-2 mt-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-2 py-1 text-xs rounded bg-violet-600 hover:bg-violet-500 text-white transition"
          >
            บันทึก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute -right-2 top-0 bg-[#111827] border border-[#374151] rounded-lg shadow-lg z-20 overflow-hidden">
      <button
        onClick={handleReply}
        title="ตอบกลับ"
        className="w-8 h-8 flex items-center justify-center hover:bg-[#1f2937] text-gray-300 hover:text-white transition"
      >
        ↩️
      </button>
      <button
        onClick={() => setIsEditing(true)}
        title="แก้ไข"
        className="w-8 h-8 flex items-center justify-center hover:bg-[#1f2937] text-gray-300 hover:text-white transition border-t border-[#374151]"
      >
        ✏️
      </button>
      <button
        onClick={handleDelete}
        title="ลบ"
        className="w-8 h-8 flex items-center justify-center hover:bg-red-900/30 text-gray-300 hover:text-red-400 transition border-t border-[#374151]"
      >
        🗑️
      </button>
    </div>
  )
}
