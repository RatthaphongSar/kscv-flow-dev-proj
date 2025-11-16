import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

/**
 * Modal for confirming delete actions
 * Shows a warning with confirmation and cancel buttons
 */
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'ลบ',
  cancelText = 'ยกเลิก',
  isDangerous = true,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          {isDangerous && (
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-100 text-lg">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isLoading ? 'กำลังลบ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
