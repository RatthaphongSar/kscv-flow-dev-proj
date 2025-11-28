// frontend/src/pages/ChatWithAdvancedScroll.example.jsx
/**
 * EXAMPLE: How to integrate advanced scroll system into your Chat page
 * 
 * This is a reference implementation showing:
 * 1. How to add infinite scroll state
 * 2. How to handle loading older messages
 * 3. How to pass props to the new ChatConversationWithInfiniteScroll component
 * 4. Integration with existing socket and API logic
 * 
 * COPY relevant sections into your actual Chat.jsx
 */

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatSocket } from '../context/ChatSocketContext'
import { ChatAPI } from '../services/chat'
import ChatLayout from '../components/chat/ChatLayout'
import ChatConversationWithInfiniteScroll from '../components/chat/ChatConversationWithInfiniteScroll'

export default function ChatPageWithAdvancedScroll() {
  const { user } = useAuth()
  const socket = useChatSocket()

  // ========== EXISTING STATE ==========
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState('')
  const [activeRoom, setActiveRoom] = useState(null)
  const [text, setText] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState('')
  const [typingMap, setTypingMap] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)

  // ========== NEW STATE FOR INFINITE SCROLL ==========
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const safeOff = (event, handler) => {
    if (!socket) return
    if (typeof socket.off === 'function') {
      socket.off(event, handler)
    } else if (typeof socket.removeListener === 'function') {
      socket.removeListener(event, handler)
    } else if (typeof socket.removeEventListener === 'function') {
      socket.removeEventListener(event, handler)
    }
  }

  // ========== LOAD ROOMS (existing, unchanged) ==========
  useEffect(() => {
    if (!user) {
      setRooms([])
      setActiveRoom(null)
      return
    }

    setRoomsLoading(true)
    setRoomsError('')

    ChatAPI.listRooms()
      .then((data) => {
        setRooms(data || [])
        if (!activeRoom && data && data.length > 0) {
          setActiveRoom(data[0])
        }
      })
      .catch((err) => {
        console.error('Error loading rooms:', err)
        setRoomsError('โหลดห้องสนทนาไม่สำเร็จ')
      })
      .finally(() => setRoomsLoading(false))
  }, [user])

  // ========== SOCKET CONNECTION (existing, unchanged) ==========
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false)
      return
    }

    const handleConnect = () => setSocketConnected(true)
    const handleDisconnect = () => setSocketConnected(false)

    if (socket.connected) setSocketConnected(true)

    if (typeof socket.on === 'function') {
      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
    }

    return () => {
      safeOff('connect', handleConnect)
      safeOff('disconnect', handleDisconnect)
    }
  }, [socket])

  // ========== LOAD MESSAGES + REAL-TIME UPDATES (ENHANCED) ==========
  useEffect(() => {
    if (!socket || !activeRoom) return

    let cancelled = false

    async function loadMessages() {
      setLoadingMessages(true)
      try {
        // Load latest 50 messages
        const oldMessages = await ChatAPI.listMessages(activeRoom.id, 50)
        if (!cancelled) {
          // Backend returns ASC (old → new)
          // Reverse to DESC (new → old) for flex-col-reverse layout
          const reversed = oldMessages ? [...oldMessages].reverse() : []
          setMessages(reversed)

          // Determine if there are more messages available
          // If we got less than 50, we've loaded all messages
          setHasMoreMessages((oldMessages?.length || 0) >= 50)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        if (!cancelled) {
          setMessages([])
          setHasMoreMessages(false)
        }
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }
    }

    loadMessages()

    // Join room for real-time updates
    socket.emit?.('joinRoom', { roomId: activeRoom.id })

    // -------- NEW MESSAGE HANDLER --------
    const handleNewMessage = (msg) => {
      if (msg.roomId && msg.roomId !== activeRoom.id) return

      // New message from socket is already in correct format
      // Socket should send DESC order (newest first in the prepend scenario)
      // But since we're using flex-col-reverse, append to end
      setMessages((prev) => [...prev, msg])
    }

    // -------- TYPING INDICATOR --------
    const handleTyping = (payload) => {
      if (!activeRoom) return
      if (payload.roomId !== activeRoom.id) return
      if (payload.userId === user?.id) return

      setTypingMap((prev) => ({
        ...prev,
        [payload.userId]: {
          username: payload.username || 'User',
          last: Date.now(),
        },
      }))
    }

    if (typeof socket.on === 'function') {
      socket.on('chatMessage', handleNewMessage)
      socket.on('typing', handleTyping)
    }

    return () => {
      cancelled = true
      socket.emit?.('leaveRoom', { roomId: activeRoom.id })
      safeOff('chatMessage', handleNewMessage)
      safeOff('typing', handleTyping)
    }
  }, [socket, activeRoom, user])

  // ========== NEW: HANDLE LOADING OLDER MESSAGES (INFINITE SCROLL) ==========
  const handleLoadMoreMessages = useCallback(
    async (beforeMessageId) => {
      if (!activeRoom || loadingMoreMessages) return

      setLoadingMoreMessages(true)
      try {
        // Fetch older messages before the given messageId
        const olderMessages = await ChatAPI.listMessagesBefore(
          activeRoom.id,
          beforeMessageId,
          30 // Load 30 older messages at a time
        )

        if (olderMessages && olderMessages.length > 0) {
          // Backend returns ASC order (old → new)
          // Reverse and prepend to messages array
          const reversed = [...olderMessages].reverse()
          setMessages((prev) => [...reversed, ...prev])

          // If we got less than 30, no more messages to load
          setHasMoreMessages(olderMessages.length >= 30)
        } else {
          // No more messages
          setHasMoreMessages(false)
        }
      } catch (error) {
        console.error('Error loading more messages:', error)
        setHasMoreMessages(false)
      } finally {
        setLoadingMoreMessages(false)
      }
    },
    [activeRoom, loadingMoreMessages]
  )

  // ========== CLEAR OLD TYPING (existing, unchanged) ==========
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingMap((prev) => {
        const now = Date.now()
        const next = {}
        Object.entries(prev).forEach(([uid, info]) => {
          if (now - info.last < 4000) {
            next[uid] = info
          }
        })
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // ========== SEND MESSAGE (existing, with reply support) ==========
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault()
      if (!text.trim() || !activeRoom) return

      setSendLoading(true)
      setSendError('')

      try {
        const replyToId = replyingTo?.id || null
        await ChatAPI.sendMessage(activeRoom.id, user?.id, text.trim(), replyToId)
        setText('')
        setReplyingTo(null)
      } catch (error) {
        console.error('Error sending message:', error)
        setSendError('ส่งข้อความไม่สำเร็จ')
      } finally {
        setSendLoading(false)
      }
    },
    [text, activeRoom, user?.id, replyingTo]
  )

  // ========== DELETE MESSAGE ==========
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!activeRoom) return
      try {
        await ChatAPI.deleteMessage(activeRoom.id, messageId)
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    },
    [activeRoom]
  )

  // ========== EDIT MESSAGE ==========
  const handleEditMessage = useCallback(
    async (messageId, newContent) => {
      if (!activeRoom) return
      try {
        await ChatAPI.editMessage(activeRoom.id, messageId, newContent)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: newContent, edited: true, editedAt: new Date() }
              : m
          )
        )
      } catch (error) {
        console.error('Error editing message:', error)
      }
    },
    [activeRoom]
  )

  // ========== REPLY MESSAGE ==========
  const handleReplyMessage = useCallback((messageId) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      setReplyingTo({
        id: messageId,
        username: message.user?.username || 'Unknown',
        content: message.content,
      })
    }
  }, [messages])

  // ========== CANCEL REPLY ==========
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  // ========== RENDER ==========
  return (
    <ChatLayout
      rooms={rooms}
      activeRoom={activeRoom}
      onSelectRoom={setActiveRoom}
      roomsLoading={roomsLoading}
      roomsError={roomsError}
      canCreateRoom={user?.role === 'teacher' || user?.role === 'TEACHER' || user?.isTeacher}
      conversation={
        <ChatConversationWithInfiniteScroll
          roomId={activeRoom?.id || null}
          messages={messages}
          currentUser={user}
          isLoadingMessages={loadingMessages}
          isLoadingMoreMessages={loadingMoreMessages}
          hasMoreMessages={hasMoreMessages}
          onLoadMoreMessages={handleLoadMoreMessages}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
          onReplyMessage={handleReplyMessage}
          typingUsers={Object.values(typingMap).map((info) => ({
            username: info.username,
          }))}
        />
      }
      input={
        <div className="p-3 border-t border-[#374151]">
          {replyingTo && (
            <div className="mb-2 p-2 bg-[#111827] border-l-2 border-violet-500 rounded flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-400">ตอบกลับ {replyingTo.username}</div>
                <div className="text-xs text-gray-300 truncate">{replyingTo.content}</div>
              </div>
              <button onClick={handleCancelReply} className="text-gray-400 hover:text-gray-200 ml-2">
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              rows={1}
              className="flex-1 resize-none px-3 py-2 bg-[#111827] text-gray-100 placeholder-gray-500 border border-[#374151] rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            <button
              type="submit"
              disabled={sendLoading || !socketConnected}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ส่ง
            </button>
          </form>
          {sendError && <div className="mt-2 text-xs text-red-400">{sendError}</div>}
        </div>
      }
    />
  )
}
