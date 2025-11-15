import React from 'react'
import { useRoomFiles, ChatFile } from '../../hooks/useRoomFiles'

interface ChatFilesPanelProps {
  roomId: string
}

/**
 * Panel to display files shared in a room
 * Shows list of uploaded files with metadata
 */
export const ChatFilesPanel: React.FC<ChatFilesPanelProps> = ({ roomId }) => {
  const { files, loading, error } = useRoomFiles({ roomId })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼'
    if (mimeType.startsWith('video/')) return '🎬'
    if (mimeType === 'application/pdf') return '📕'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📄'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    return '📎'
  }

  const handleDownload = (file: ChatFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.fileName
    link.click()
  }

  if (loading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 flex items-center justify-center">
        <div className="text-slate-400">กำลังโหลดไฟล์...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 text-sm">ไม่มีไฟล์ในห้องนี้</div>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* File icon */}
                <div className="w-9 h-9 rounded-md bg-slate-700 flex items-center justify-center flex-shrink-0 text-sm">
                  {getFileIcon(file.mimeType)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm text-slate-100 hover:text-violet-300 transition-colors truncate block"
                  >
                    {file.fileName}
                  </a>
                  <div className="text-xs text-slate-400 mt-1">
                    {file.uploader.username} · {formatDate(file.createdAt)} · {formatFileSize(file.sizeBytes)}
                  </div>
                </div>

                {/* Download button */}
                <button
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center flex-shrink-0 transition-colors"
                  title="ดาวน์โหลด"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
