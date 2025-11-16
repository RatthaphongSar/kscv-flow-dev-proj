import { useState, useCallback } from 'react'
import { api } from '../utils/api'

export interface UploadedFile {
  id: string
  file: File
  preview?: string // for images
}

export function useFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Add files to upload queue
   */
  const addFiles = useCallback((files: FileList | File[]) => {
    const filesArray = Array.from(files)
    const newFiles: UploadedFile[] = []

    filesArray.forEach((file) => {
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large (max 10MB)`)
        return
      }

      const id = `${Date.now()}_${Math.random()}`
      const uploadedFile: UploadedFile = {
        id,
        file
      }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setSelectedFiles(prev => 
            prev.map(f => f.id === id ? { ...f, preview: e.target?.result as string } : f)
          )
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(uploadedFile)
    })

    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [])

  /**
   * Remove file from queue
   */
  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  /**
   * Clear all selected files
   */
  const clearFiles = useCallback(() => {
    setSelectedFiles([])
    setError('')
  }, [])

  /**
   * Upload files with message to backend
   */
  const uploadWithMessage = useCallback(
    async (roomId: string, messageText: string) => {
      if (selectedFiles.length === 0 && !messageText.trim()) {
        setError('Message or files required')
        return null
      }

      setUploading(true)
      setError('')

      try {
        const formData = new FormData()

        // Add message text (optional)
        if (messageText.trim()) {
          formData.append('content', messageText)
        }

        // Add files
        selectedFiles.forEach((f) => {
          formData.append('files', f.file)
        })

        // Send to backend
        const response = await api(`/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set Content-Type for FormData
        })

        clearFiles()
        return response
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        console.error('[useFileUpload] Error:', message)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [selectedFiles, clearFiles]
  )

  /**
   * Get file type icon/label
   */
  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.includes('word') || file.type.includes('document')) return 'document'
    if (file.type.includes('sheet') || file.type.includes('excel')) return 'spreadsheet'
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'presentation'
    if (file.type === 'text/plain') return 'text'
    return 'file'
  }

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return {
    selectedFiles,
    uploading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    uploadWithMessage,
    getFileType,
    formatFileSize
  }
}
