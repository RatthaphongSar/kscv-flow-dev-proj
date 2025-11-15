import { useState, useEffect, useCallback } from 'react'

export interface ChatFile {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  url: string
  width?: number
  height?: number
  createdAt: string
  uploader: {
    id: string
    username: string
  }
}

interface UseRoomFilesOptions {
  roomId?: string
  autoFetch?: boolean
}

/**
 * Hook to manage room files
 * Handles fetching and uploading files
 */
export const useRoomFiles = (options: UseRoomFilesOptions = {}) => {
  const { roomId, autoFetch = true } = options

  const [files, setFiles] = useState<ChatFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch files for current room
   */
  const fetchFiles = useCallback(async () => {
    if (!roomId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/files`)

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`)
      }

      const data = await response.json()
      setFiles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [roomId])

  /**
   * Upload a file
   * Assumes file is already uploaded to storage and returns metadata
   */
  const uploadFile = useCallback(
    async (metadata: {
      fileName: string
      mimeType: string
      sizeBytes: number
      url: string
      width?: number
      height?: number
    }) => {
      if (!roomId) throw new Error('No room ID')

      const response = await fetch(`/api/chat/rooms/${roomId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      })

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`)
      }

      const newFile = await response.json()

      // Prepend to list
      setFiles((prev) => [newFile, ...prev])

      return newFile
    },
    [roomId]
  )

  /**
   * Delete a file
   */
  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!roomId) throw new Error('No room ID')

      const response = await fetch(`/api/chat/rooms/${roomId}/files/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`)
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    },
    [roomId]
  )

  // Auto-fetch on room change
  useEffect(() => {
    if (autoFetch && roomId) {
      fetchFiles()
    }
  }, [roomId, autoFetch, fetchFiles])

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile
  }
}
