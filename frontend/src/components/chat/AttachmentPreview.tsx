import React from 'react'
import { X } from 'lucide-react'

interface AttachmentPreviewProps {
  file: File
  preview?: string
  onRemove: () => void
  formatFileSize: (bytes: number) => string
}

export function AttachmentPreview({
  file,
  preview,
  onRemove,
  formatFileSize,
}: AttachmentPreviewProps) {
  const isImage = file.type.startsWith('image/')

  return (
    <div className="relative group">
      {isImage && preview ? (
        // Image preview
        <div className="relative">
          <img
            src={preview}
            alt={file.name}
            className="h-16 w-16 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={onRemove}
            type="button"
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove file"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        // File preview (generic)
        <div className="bg-gray-100 p-2 rounded-lg border border-gray-300 h-16 w-16 flex flex-col items-center justify-center relative group">
          <span className="text-2xl">📎</span>
          <button
            onClick={onRemove}
            type="button"
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove file"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* File info tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
        <br />
        {formatFileSize(file.size)}
      </div>
    </div>
  )
}
