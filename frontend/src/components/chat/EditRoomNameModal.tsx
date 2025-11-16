import React, { useState } from 'react'

interface EditRoomNameModalProps {
  isOpen: boolean
  currentName: string
  onSave: (newName: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Modal to edit room name
 */
export const EditRoomNameModal: React.FC<EditRoomNameModalProps> = ({
  isOpen,
  currentName,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [newName, setNewName] = useState(currentName)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && newName !== currentName) {
      try {
        await onSave(newName.trim())
      } catch (err) {
        console.error('Error saving room name:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        {/* Title */}
        <h3 className="font-semibold text-gray-100 text-lg mb-4">แก้ไขชื่อห้อง</h3>

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ชื่อห้องใหม่"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 disabled:opacity-50 mb-4"
            autoFocus
          />

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 text-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || !newName.trim() || newName === currentName}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
