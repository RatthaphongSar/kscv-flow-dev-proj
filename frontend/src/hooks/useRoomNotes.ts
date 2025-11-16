import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
  }
}

interface UseRoomNotesOptions {
  roomId?: string
  autoFetch?: boolean
}

/**
 * Hook to manage room notes
 * Handles fetching, creating, updating, deleting notes
 */
export const useRoomNotes = (options: UseRoomNotesOptions = {}) => {
  const { roomId, autoFetch = true } = options

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch notes for current room
   */
  const fetchNotes = useCallback(async () => {
    if (!roomId) return

    setLoading(true)
    setError(null)

    try {
      const data = await api(`/chat/rooms/${roomId}/notes`)
      setNotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [roomId])

  /**
   * Create a new note
   */
  const createNote = useCallback(
    async (title: string, content: string) => {
      if (!roomId) throw new Error('No room ID')

      const newNote = await api(`/chat/rooms/${roomId}/notes`, {
        method: 'POST',
        body: { title, content }
      })

      // Prepend to list
      setNotes((prev) => [newNote, ...prev])

      return newNote
    },
    [roomId]
  )

  /**
   * Update a note
   */
  const updateNote = useCallback(
    async (noteId: string, title?: string, content?: string) => {
      if (!roomId) throw new Error('No room ID')

      const updated = await api(`/chat/rooms/${roomId}/notes/${noteId}`, {
        method: 'PUT',
        body: { title, content }
      })

      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? updated : n))
      )

      return updated
    },
    [roomId]
  )

  /**
   * Delete a note
   */
  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!roomId) throw new Error('No room ID')

      await api(`/chat/rooms/${roomId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    },
    [roomId]
  )

  // Auto-fetch on room change
  useEffect(() => {
    if (autoFetch && roomId) {
      fetchNotes()
    }
  }, [roomId, autoFetch, fetchNotes])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote
  }
}
