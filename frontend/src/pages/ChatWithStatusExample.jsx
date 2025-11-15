// frontend/src/pages/ChatWithStatus.example.jsx
/**
 * EXAMPLE: Complete Chat page implementation with message status & unread tracking
 * 
 * This demonstrates how to integrate:
 * 1. useChatStatus hook
 * 2. MessageBubbleWithStatus component
 * 3. RoomListItemWithUnread component
 * 4. Socket.io events
 */

import { useEffect, useState } from 'react'
import { useChatSocket } from '../context/ChatSocketContext'
import { useAuth } from '../context/AuthContext'
import { useChatStatus } from '../hooks/useChatStatus'
import ChatConversationWithStatus from '../components/chat/ChatConversationWithStatus'
import RoomListItemWithUnread from '../components/chat/RoomListItemWithUnread'
import { ChatAPI } from '../services/chat'

export default function ChatWithStatusExample() {
  const { user } = useAuth()
  const socket = useChatSocket()

  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // ============================================
  // USE CHAT STATUS HOOK
  // ============================================
  const {
    messageStatuses,
    unreadCounts,
    markMessagesAsSeen,
    computeLocalUnreadCounts,
  } = useChatStatus({
    roomId: activeRoomId,
    currentUserId: user?.id,
    messages,
    rooms,
    socket,
    onMessageStatusUpdate: (messageId, status) => {
      console.log(`Message ${messageId} status:`, status)
      // Optionally update UI
    },
    onUnreadCountUpdate: (roomId, count) => {
      console.log(`Room ${roomId} unread:`, count)
    },
  })

  // ============================================
  // LOAD ROOMS
  // ============================================
  useEffect(() => {
    if (!user) return

    async function loadRooms() {
      try {
        setLoading(true)
        const data = await ChatAPI.listRooms()
        setRooms(data || [])
        if (data?.length > 0 && !activeRoomId) {
          setActiveRoomId(data[0].id)
        }
      } catch (err) {
        console.error('Failed to load rooms:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [user])

  // ============================================
  // LOAD MESSAGES FOR ACTIVE ROOM
  // ============================================
  useEffect(() => {
    if (!activeRoomId || !socket) return

    async function loadMessages() {
      try {
        const data = await ChatAPI.listMessages(activeRoomId)
        setMessages(data || [])

        // Join room to receive real-time updates
        socket.emit('room:join', { roomId: activeRoomId })
      } catch (err) {
        console.error('Failed to load messages:', err)
      }
    }

    loadMessages()

    return () => {
      // Cleanup: leave room
      socket?.emit('room:leave', { roomId: activeRoomId })
    }
  }, [activeRoomId, socket])

  // ============================================
  // LISTEN FOR NEW MESSAGES (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg) => {
      console.log('📨 New message received:', msg)

      setMessages(prev => [...prev, msg])

      // If message is in active room, it will auto mark seen
      // If not, unread count will increase
      if (msg.roomId !== activeRoomId) {
        console.log('Message in different room, updating unread count')
      }
    }

    socket.on('message:new', handleNewMessage)
    return () => socket.off('message:new', handleNewMessage)
  }, [socket, activeRoomId])

  // ============================================
  // SEND MESSAGE
  // ============================================
  const handleSendMessage = async (content) => {
    if (!activeRoomId || !content.trim() || !socket) return

    // 1. Create optimistic message (pending status)
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      roomId: activeRoomId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    setMessages(prev => [...prev, optimisticMsg])

    // Update status map
    // (handled by hook, but you can do it here too)

    // 2. Send to server
    try {
      const result = await ChatAPI.sendMessage(activeRoomId, {
        content,
      })

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(m =>
          m.id === optimisticMsg.id
            ? { ...result, status: 'delivered' }
            : m
        )
      )

      console.log('Message sent successfully:', result.id)
    } catch (err) {
      console.error('Failed to send message:', err)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
    }
  }

  // ============================================
  // MARK VISIBLE MESSAGES AS SEEN
  // ============================================
  useEffect(() => {
    if (!activeRoomId || !messages.length) return

    // Get visible messages (last 3 or so in view)
    const visibleMessages = messages.slice(-3)
    markMessagesAsSeen(visibleMessages)
  }, [messages.length, activeRoomId, markMessagesAsSeen])

  // ============================================
  // SELECT ROOM
  // ============================================
  const handleSelectRoom = (room) => {
    setActiveRoomId(room.id)
  }

  // ============================================
  // RENDER
  // ============================================
  const activeRoom = rooms.find(r => r.id === activeRoomId)
  const unreadCount = unreadCounts.get(activeRoomId) || 0

  return (
    <div className="flex h-screen bg-[#020617]">
      {/* Sidebar: Rooms with unread badges */}
      <aside className="w-80 border-r border-[#1f2937] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Conversations</h2>

          {loading ? (
            <div className="text-gray-400">Loading rooms...</div>
          ) : (
            <div className="space-y-2">
              {rooms.map(room => (
                <RoomListItemWithUnread
                  key={room.id}
                  room={room}
                  isActive={room.id === activeRoomId}
                  unreadCount={unreadCounts.get(room.id) || 0}
                  lastMessage={room.lastMessage}
                  onSelect={handleSelectRoom}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main: Chat window */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        {activeRoom && (
          <div className="px-6 py-4 border-b border-[#1f2937]">
            <h1 className="text-xl font-bold">{activeRoom.name}</h1>
            <p className="text-sm text-gray-400">
              {unreadCount > 0 && `${unreadCount} unread • `}
              {messages.length} messages
            </p>
          </div>
        )}

        {/* Conversation with status tracking */}
        {activeRoom ? (
          <>
            <ChatConversationWithStatus
              roomId={activeRoomId}
              messages={messages}
              currentUser={user}
              messageStatuses={messageStatuses}
              socket={socket}
              onMarkSeen={(messageIds) => {
                console.log('Marked as seen:', messageIds)
              }}
            />

            {/* Message input */}
            <div className="px-6 py-4 border-t border-[#1f2937]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.target.message
                  handleSendMessage(input.value)
                  input.value = ''
                }}
              >
                <div className="flex gap-2">
                  <input
                    name="message"
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-[#111827] border border-[#374151] rounded px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded transition"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  )
}
