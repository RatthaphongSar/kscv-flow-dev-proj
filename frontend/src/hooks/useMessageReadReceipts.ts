import { useEffect, useState, useCallback } from 'react'

export interface MessageReadReceipt {
  messageId: string
  readCount: number
  totalMembers: number
  percentage: number
}

export interface MessageReader {
  userId: string
  username: string
  readAt: string
}

/**
 * Custom hook for fetching read receipts for messages
 */
export const useMessageReadReceipts = (roomId?: string) => {
  const [readReceipts, setReadReceipts] = useState<Record<string, MessageReadReceipt>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReadReceipts = useCallback(
    async (messageIds: string[]) => {
      if (!roomId || !messageIds.length) return

      setLoading(true)
      setError(null)
      try {
        // Fetch read receipts for multiple messages
        const queryString = messageIds.map((id) => `messageId=${id}`).join('&')
        const response = await fetch(`/api/chat/rooms/${roomId}/messages/read-receipts?${queryString}`)
        if (!response.ok) throw new Error('Failed to fetch read receipts')

        const data: MessageReadReceipt[] = await response.json()
        const receipts: Record<string, MessageReadReceipt> = {}
        data.forEach((receipt) => {
          receipts[receipt.messageId] = receipt
        })
        setReadReceipts(receipts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [roomId]
  )

  const getReadReceipt = useCallback(
    (messageId: string): MessageReadReceipt | null => {
      return readReceipts[messageId] || null
    },
    [readReceipts]
  )

  const getMessageReaders = useCallback(
    async (messageId: string): Promise<MessageReader[]> => {
      if (!roomId) return []

      try {
        const response = await fetch(`/api/chat/rooms/${roomId}/messages/${messageId}/readers`)
        if (!response.ok) throw new Error('Failed to fetch readers')
        const data: MessageReader[] = await response.json()
        return data
      } catch (err) {
        console.error('Failed to fetch message readers:', err)
        return []
      }
    },
    [roomId]
  )

  return {
    readReceipts,
    loading,
    error,
    fetchReadReceipts,
    getReadReceipt,
    getMessageReaders,
  }
}
