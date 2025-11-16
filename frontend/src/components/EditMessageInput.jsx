import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

/**
 * EditMessageInput - Inline edit mode for messages
 * Shows text input with save/cancel buttons
 */
export default function EditMessageInput({
  initialContent,
  onSave,
  onCancel,
}) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) {
      alert('ข้อความไม่สามารถว่างได้')
      return
    }

    setIsSaving(true)
    try {
      await onSave(content.trim())
    } catch (err) {
      console.error('Edit error:', err)
      alert('ไม่สามารถแก้ไขข้อความได้')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-1 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2 border border-blue-400 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        disabled={isSaving}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
          title="บันทึก (Ctrl+Enter)"
        >
          <Check size={14} />
          บันทึก
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
          title="ยกเลิก (Esc)"
        >
          <X size={14} />
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
