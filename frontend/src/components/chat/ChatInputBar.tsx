import React, { useState } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import { FilePicker } from './FilePicker'
import { AttachmentPreview } from './AttachmentPreview'
import { useFileUpload } from '../../hooks/useFileUpload'

interface ChatInputBarProps {
  roomId: string
  onMessageSent?: () => void
  disabled?: boolean
}

export function ChatInputBar({ roomId, onMessageSent, disabled = false }: ChatInputBarProps) {
  const [messageText, setMessageText] = useState('')
  const {
    selectedFiles,
    uploading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    uploadWithMessage,
    formatFileSize,
  } = useFileUpload()

  const handleFileSelected = (files: FileList) => {
    addFiles(Array.from(files))
  }

  const handleSendMessage = async () => {
    // Require either message text or files
    if (!messageText.trim() && selectedFiles.length === 0) {
      return
    }

    try {
      await uploadWithMessage(roomId, messageText.trim())
      setMessageText('')
      clearFiles()
      onMessageSent?.()
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const canSend = (messageText.trim() || selectedFiles.length > 0) && !uploading && !disabled

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-t border-gray-200">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Preview Gallery */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedFiles.map((file) => (
            <AttachmentPreview
              key={file.id}
              file={file.file}
              preview={file.preview}
              onRemove={() => removeFile(file.id)}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}

      {/* Input Controls */}
      <div className="flex items-end gap-3">
        {/* File Picker Button */}
        <FilePicker onFilesSelected={handleFileSelected} disabled={uploading || disabled} />

        {/* Text Input */}
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Ctrl+Enter to send)"
          disabled={uploading || disabled}
          className="flex-1 min-h-[44px] max-h-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400"
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!canSend}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
            canSend
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={uploading ? 'Uploading...' : 'Send message (Ctrl+Enter)'}
          type="button"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Max file size: 10 MB each. Supported: JPG, PNG, GIF, PDF, DOC, XLS, TXT, PPTX
      </p>
    </div>
  )
}
