import React, { useState } from 'react'

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, content: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Modal dialog for creating a new note
 * Teacher-only, appears when user clicks "สร้างโน้ต" button
 */
export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content')
      return
    }

    try {
      setError(null)
      await onSave(title, content)
      setTitle('')
      setContent('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-lg w-full mx-4 p-6 shadow-2xl">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-100 mb-4">สร้างโน้ต</h2>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">ชื่อโน้ต</label>
          <input
            type="text"
            placeholder="ระบุชื่อโน้ต..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-100 placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">เนื้อหา</label>
          <textarea
            placeholder="ระบุเนื้อหาโน้ต..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-100 placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
