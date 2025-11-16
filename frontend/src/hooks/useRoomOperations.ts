import { useState, useCallback } from 'react'
import { api } from '../utils/api'

/**
 * Hook to manage room operations (update, delete)
 */
export const useRoomOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Update room name
   */
  const updateRoom = useCallback(async (roomId: string, newName: string) => {
    setLoading(true)
    setError(null)

    try {
      const updated = await api(`/chat/rooms/${roomId}`, {
        method: 'PUT',
        body: { name: newName }
      })

      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete room
   */
  const deleteRoom = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await api(`/chat/rooms/${roomId}`, {
        method: 'DELETE'
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    updateRoom,
    deleteRoom,
  }
}
