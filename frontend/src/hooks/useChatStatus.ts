// frontend/src/hooks/useChatStatus.ts
/**
 * Hook to manage message status and seen receipts
 * Handles:
 * - Message delivery status updates
 * - Read receipt tracking
 * - Unread count management
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Message, MessageStatus, Room } from '../types/chat-status'

interface UseChatStatusOptions {
  roomId: string | null
  currentUserId: string | null
  messages: Message[]
  rooms: Room[]
  socket: any // Socket.io instance
  onMessageStatusUpdate?: (messageId: string, status: MessageStatus) => void
  onUnreadCountUpdate?: (roomId: string, count: number) => void
}

export function useChatStatus({
  roomId,
  currentUserId,
  messages,
  rooms,
  socket,
  onMessageStatusUpdate,
  onUnreadCountUpdate,
}: UseChatStatusOptions) {
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map())
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map())
  const lastSeenMessageIdRef = useRef<string | null>(null)
  const seenTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================
  // 1. HANDLE INCOMING MESSAGE DELIVERY STATUS
  // ============================================
  useEffect(() => {
    if (!socket) return

    const handleMessageDelivered = (data: { messageId: string; timestamp: string }) => {
      console.log('📨 Message delivered:', data.messageId)
      setMessageStatuses(prev => {
        const updated = new Map(prev)
        updated.set(data.messageId, 'delivered')
        return updated
      })
      onMessageStatusUpdate?.(data.messageId, 'delivered')
    }

    socket.on('message:delivered', handleMessageDelivered)
    return () => socket.off('message:delivered', handleMessageDelivered)
  }, [socket, onMessageStatusUpdate])

  // ============================================
  // 2. HANDLE INCOMING READ RECEIPTS (SEEN)
  // ============================================
  useEffect(() => {
    if (!socket) return

    const handleMessageSeen = (data: {
      messageId: string
      seenByUserId: string
      roomId: string
      timestamp: string
    }) => {
      console.log(`👁️ Message seen by ${data.seenByUserId}:`, data.messageId)
      
      setMessageStatuses(prev => {
        const updated = new Map(prev)
        const currentStatus = updated.get(data.messageId)
        
        // Only update to 'seen' if not already seen by all, or if it's from current user
        if (currentStatus !== 'seen' || data.seenByUserId === currentUserId) {
          updated.set(data.messageId, 'seen')
        }
        return updated
      })
      
      onMessageStatusUpdate?.(data.messageId, 'seen')
    }

    socket.on('message:seen', handleMessageSeen)
    return () => socket.off('message:seen', handleMessageSeen)
  }, [socket, currentUserId, onMessageStatusUpdate])

  // ============================================
  // 3. SEND "SEEN" RECEIPT WHEN MESSAGE VISIBLE
  // ============================================
  const markMessagesAsSeen = useCallback(
    (visibleMessages: Message[]) => {
      if (!socket || !roomId || !currentUserId || visibleMessages.length === 0) return

      // Get the ID of the last (newest) visible message
      const lastVisibleMessage = visibleMessages[visibleMessages.length - 1]
      if (!lastVisibleMessage) return

      // Only send if it's a new message or status changed
      if (lastSeenMessageIdRef.current === lastVisibleMessage.id) {
        return
      }

      lastSeenMessageIdRef.current = lastVisibleMessage.id

      // Debounce: wait 500ms before sending to batch updates
      if (seenTimerRef.current) {
        clearTimeout(seenTimerRef.current)
      }

      seenTimerRef.current = setTimeout(() => {
        console.log(`📬 Marking messages as seen up to:`, lastVisibleMessage.id)
        
        socket.emit('message:markSeen', {
          roomId,
          messageId: lastVisibleMessage.id,
          userId: currentUserId,
          timestamp: new Date().toISOString(),
        })

        // Update local status immediately for better UX
        setMessageStatuses(prev => {
          const updated = new Map(prev)
          visibleMessages.forEach(msg => {
            if (msg.senderId !== currentUserId) {
              updated.set(msg.id, 'seen')
            }
          })
          return updated
        })
      }, 500)
    },
    [socket, roomId, currentUserId],
  )

  // ============================================
  // 4. HANDLE INCOMING UNREAD COUNT UPDATES
  // ============================================
  useEffect(() => {
    if (!socket) return

    const handleUnreadCountUpdated = (data: { roomId: string; unreadCount: number }) => {
      console.log(`🔔 Unread count updated for ${data.roomId}:`, data.unreadCount)
      setUnreadCounts(prev => {
        const updated = new Map(prev)
        updated.set(data.roomId, data.unreadCount)
        return updated
      })
      onUnreadCountUpdate?.(data.roomId, data.unreadCount)
    }

    socket.on('room:unreadCountUpdated', handleUnreadCountUpdated)
    return () => socket.off('room:unreadCountUpdated', handleUnreadCountUpdated)
  }, [socket, onUnreadCountUpdate])

  // ============================================
  // 5. RESET UNREAD COUNT WHEN VIEWING ROOM
  // ============================================
  useEffect(() => {
    if (!roomId || !socket) return

    // When we open a room, immediately mark as 0 unread
    setUnreadCounts(prev => {
      const updated = new Map(prev)
      updated.set(roomId, 0)
      return updated
    })

    onUnreadCountUpdate?.(roomId, 0)
  }, [roomId, socket, onUnreadCountUpdate])

  // ============================================
  // 6. COMPUTE UNREAD COUNTS LOCALLY (FALLBACK)
  // ============================================
  const computeLocalUnreadCounts = useCallback(() => {
    if (!currentUserId) return new Map()

    const counts = new Map<string, number>()

    rooms.forEach(room => {
      // Count messages in this room that:
      // 1. Are not from current user
      // 2. Were created after lastReadMessageId or all if none
      const roomMessages = messages.filter(m => m.roomId === room.id)
      
      let unreadCount = 0
      const lastReadId = room.lastReadMessageId

      roomMessages.forEach(msg => {
        if (msg.senderId !== currentUserId) {
          if (!lastReadId) {
            // All unread if nothing read yet
            unreadCount++
          } else {
            // Only count if after last read
            const lastReadIdx = roomMessages.findIndex(m => m.id === lastReadId)
            const msgIdx = roomMessages.indexOf(msg)
            if (msgIdx > lastReadIdx) {
              unreadCount++
            }
          }
        }
      })

      counts.set(room.id, unreadCount)
    })

    return counts
  }, [rooms, messages, currentUserId])

  // ============================================
  // 7. CLEANUP
  // ============================================
  useEffect(() => {
    return () => {
      if (seenTimerRef.current) {
        clearTimeout(seenTimerRef.current)
      }
    }
  }, [])

  return {
    messageStatuses,
    unreadCounts,
    markMessagesAsSeen,
    computeLocalUnreadCounts,
    setMessageStatuses,
    setUnreadCounts,
  }
}
