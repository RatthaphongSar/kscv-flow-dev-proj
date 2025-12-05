import { useRef } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  text: string
  setText: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  isLoading?: boolean
  onAttachFiles?: (files: FileList) => void
}

export default function MessageInput({
  text,
  setText,
  onSubmit,
  isLoading = false,
  onAttachFiles,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const disabled = !text.trim() || isLoading

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  /**
   * Handle attachment button click
   * Triggers hidden file input dialog
   */
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handle file selection
   * Called when user selects files from dialog
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onAttachFiles) {
      onAttachFiles(e.target.files)
      // Clear input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      {/* ช่องพิมพ์ */}
      <div className="flex-1">
        <input
          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-sm
                     text-gray-100 placeholder:text-gray-500
                     focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          placeholder="พิมพ์ข้อความ... (Enter ส่ง)"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.pptx"
        aria-label="Select files to attach"
      />

      {/* ปุ่มแนบไฟล์ */}
      <button
        type="button"
        onClick={handleAttachClick}
        className="h-9 w-9 flex items-center justify-center rounded-md bg-[#1e293b] border border-[#334155]
                   text-gray-300 hover:bg-[#334155] hover:border-[#475569] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title="แนบไฟล์"
        disabled={isLoading}
      >
        {/* Paperclip icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
          />
        </svg>
      </button>

      {/* ปุ่มส่ง */}
      <button
        type="submit"
        disabled={disabled}
        className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center
                   hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-colors duration-200 font-semibold"
        title="ส่งข้อความ (Enter)"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  )
}
