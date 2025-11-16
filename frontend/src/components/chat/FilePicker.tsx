import React, { useRef } from 'react'
import { Paperclip } from 'lucide-react'

interface FilePickerProps {
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
}

export function FilePicker({ onFilesSelected, disabled = false }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
        }`}
        title="Attach files"
        type="button"
      >
        <Paperclip size={20} />
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleChange}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.pptx"
      />
    </>
  )
}
