// frontend/src/hooks/useRoomPin.ts
import { useState, useCallback } from 'react'
import { api } from '../utils/api'

interface PinnedRoom {
  id: string
  roomId: string
  pinnedAt: string
  room: {
    id: string
    name: string
    type: string
    _count: {
      messages: number
      members: number
    }
  }
}

export function useRoomPin() {
  const [pinnedRooms, setPinnedRooms] = useState<PinnedRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Pin a room for current user
   */
  const pinRoom = useCallback(async (roomId: string) => {
    try {
      setLoading(true)
      setError('')
      const data = await api(`/chat/rooms/${roomId}/pin`, {
        method: 'POST'
      })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pin room'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Unpin a room for current user
   */
  const unpinRoom = useCallback(async (roomId: string) => {
    try {
      setLoading(true)
      setError('')
      await api(`/chat/rooms/${roomId}/pin`, {
        method: 'DELETE'
      })
      return { message: 'Room unpinned successfully' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unpin room'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load all pinned rooms for current user
   */
  const loadPinnedRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api('/chat/me/pinned', { method: 'GET' })
      setPinnedRooms(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pinned rooms'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Check if a room is pinned
   */
  const checkPinStatus = useCallback(async (roomId: string) => {
    try {
      setLoading(true)
      setError('')
      const data = await api(`/chat/rooms/${roomId}/pin/status`, { method: 'GET' })
      return data.isPinned
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check pin status'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Toggle pin status for a room
   */
  const togglePin = useCallback(async (roomId: string, currentlyPinned: boolean) => {
    try {
      setLoading(true)
      setError('')
      if (currentlyPinned) {
        await unpinRoom(roomId)
      } else {
        await pinRoom(roomId)
      }
      // Refresh pinned rooms list
      await loadPinnedRooms()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle pin'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [pinRoom, unpinRoom, loadPinnedRooms])

  return {
    pinnedRooms,
    loading,
    error,
    pinRoom,
    unpinRoom,
    loadPinnedRooms,
    checkPinStatus,
    togglePin
  }
}
