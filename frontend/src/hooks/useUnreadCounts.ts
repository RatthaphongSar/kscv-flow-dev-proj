import { useEffect, useState, useCallback } from 'react'
import { api } from '../utils/api'

export interface UnreadCount {
  roomId: string
  unreadCount: number
  totalMessages: number
}

/**
 * Custom hook for fetching and tracking unread message counts per room
 */
export const useUnreadCounts = () => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUnreadCounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data: UnreadCount[] = await api(`/chat/unread-summary`)
      const counts: Record<string, number> = {}
      data.forEach((item) => {
        counts[item.roomId] = item.unreadCount
      })
      setUnreadCounts(counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnreadCounts()
  }, [fetchUnreadCounts])

  const getUnreadCount = useCallback(
    (roomId: string): number => {
      return unreadCounts[roomId] || 0
    },
    [unreadCounts]
  )

  return {
    unreadCounts,
    loading,
    error,
    fetchUnreadCounts,
    getUnreadCount,
  }
}
