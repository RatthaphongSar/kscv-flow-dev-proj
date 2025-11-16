import { useEffect, useState, useCallback } from 'react'
import { api } from '../utils/api'

export interface RoomMember {
  id: string
  username: string
  role: 'TEACHER' | 'STUDENT'
  email?: string
}

interface UseRoomMembersOptions {
  roomId?: string
  autoFetch?: boolean
}

/**
 * Custom hook for managing room members
 * Handles fetching, adding, and removing members from a room
 */
export const useRoomMembers = (options: UseRoomMembersOptions = {}) => {
  const { roomId, autoFetch = true } = options
  const [members, setMembers] = useState<RoomMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!roomId) return

    setLoading(true)
    setError(null)
    try {
      const data = await api(`/chat/rooms/${roomId}/members`)
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  const addMember = useCallback(
    async (userId: string) => {
      if (!roomId) return
      try {
        const newMember: RoomMember = await api(`/chat/rooms/${roomId}/members`, {
          method: 'POST',
          body: { userId }
        })
        setMembers((prev) => [...prev, newMember])
        return newMember
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [roomId]
  )

  const removeMember = useCallback(
    async (userId: string) => {
      if (!roomId) return
      try {
        await api(`/chat/rooms/${roomId}/members/${userId}`, {
          method: 'DELETE'
        })
        setMembers((prev) => prev.filter((m) => m.id !== userId))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [roomId]
  )

  useEffect(() => {
    if (autoFetch && roomId) {
      fetchMembers()
    }
  }, [roomId, autoFetch, fetchMembers])

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    removeMember,
  }
}
