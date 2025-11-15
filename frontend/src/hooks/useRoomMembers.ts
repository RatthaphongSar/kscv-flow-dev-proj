import { useEffect, useState, useCallback } from 'react'

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
      const response = await fetch(`/api/chat/rooms/${roomId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
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
        const response = await fetch(`/api/chat/rooms/${roomId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        if (!response.ok) throw new Error('Failed to add member')
        const newMember: RoomMember = await response.json()
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
        const response = await fetch(`/api/chat/rooms/${roomId}/members/${userId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to remove member')
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
