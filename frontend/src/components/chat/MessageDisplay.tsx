import React from 'react'
import {
  Download,
  File,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  MoreVertical,
} from 'lucide-react'

interface FileAttachment {
  id: string
  filename: string
  fileSize: number
  mimeType: string
  fileType: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'unknown'
  url: string
}

interface MessageDisplayProps {
  content?: string
  files?: FileAttachment[]
  sender: 'user' | 'other'
  timestamp?: string
}

function getFileIcon(fileType: string, size: number = 20) {
  switch (fileType) {
    case 'image':
      return <Image size={size} />
    case 'document':
      return <FileText size={size} />
    case 'video':
      return <Video size={size} />
    case 'audio':
      return <Music size={size} />
    case 'archive':
      return <Archive size={size} />
    default:
      return <File size={size} />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function FilePreviewImage({ file }: { file: FileAttachment }) {
  return (
    <div className="relative group max-w-xs">
      <img
        src={file.url}
        alt={file.filename}
        className="rounded-lg max-h-96 max-w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
      <a
        href={file.url}
        download={file.filename}
        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        title="Download image"
      >
        <Download size={16} className="text-white" />
      </a>
    </div>
  )
}

function FilePreviewDocument({ file }: { file: FileAttachment }) {
  return (
    <a
      href={file.url}
      download={file.filename}
      className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-xs"
    >
      <div className="p-2 bg-blue-100 rounded text-blue-600">{getFileIcon(file.fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
      </div>
      <Download size={16} className="text-gray-600 flex-shrink-0" />
    </a>
  )
}

export function MessageDisplay({ content, files, sender, timestamp }: MessageDisplayProps) {
  const isUser = sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex flex-col gap-3 max-w-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-3xl rounded-tr-lg'
            : 'bg-gray-100 text-gray-900 rounded-3xl rounded-tl-lg'
        } px-4 py-3`}
      >
        {/* Text Content */}
        {content && <p className="text-sm leading-relaxed break-words">{content}</p>}

        {/* File Attachments */}
        {files && files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex flex-col gap-2">
                {file.fileType === 'image' ? (
                  <FilePreviewImage file={file} />
                ) : (
                  <FilePreviewDocument file={file} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p
            className={`text-xs ${
              isUser ? 'text-blue-200' : 'text-gray-500'
            } mt-1 text-right`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
