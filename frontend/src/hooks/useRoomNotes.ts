import { useState, useEffect, useCallback } from 'react'

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
      const response = await fetch(`/api/rooms/${roomId}/notes`)

      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.statusText}`)
      }

      const data = await response.json()
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

      const response = await fetch(`/api/rooms/${roomId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.statusText}`)
      }

      const newNote = await response.json()

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

      const response = await fetch(`/api/rooms/${roomId}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.statusText}`)
      }

      const updated = await response.json()

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

      const response = await fetch(`/api/rooms/${roomId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.statusText}`)
      }

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
