// frontend/src/pages/Chat.jsx (ChatPage)
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatSocket } from '../context/ChatSocketContext'
import { ChatAPI } from '../services/chat'
import ChatLayout from '../components/chat/ChatLayout'

export default function ChatPage() {
  const { user } = useAuth()
  const socket = useChatSocket()

  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState('')

  const [activeRoom, setActiveRoom] = useState(null)

  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [text, setText] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)

  // typing indicator
  const [typingMap, setTypingMap] = useState({}) // { userId: { username, last } }

  const canCreateRoom =
    user?.role === 'teacher' ||
    user?.role === 'TEACHER' ||
    user?.isTeacher === true

  // -------- helper สำหรับถอด listener ให้ปลอดภัย ----------
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

  // -----------------------------
  // โหลดห้องของ user
  // -----------------------------
  useEffect(() => {
    if (!user) {
      setRooms([])
      setActiveRoom(null)
      return
    }

    setRoomsLoading(true)
    setRoomsError('')
    ChatAPI.listRooms(user.id)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // -----------------------------
  // ติดตามสถานะ socket connect/disconnect
  // -----------------------------
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

  // -----------------------------
  // โหลดข้อความเก่าของห้อง + join/leave room
  // -----------------------------
  useEffect(() => {
    if (!socket || !activeRoom) return

    let cancelled = false

    async function loadMessages() {
      setLoadingMessages(true)
      try {
        const oldMessages = await ChatAPI.listMessages(activeRoom.id)
        if (!cancelled) {
          setMessages(oldMessages || [])
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }
    }

    loadMessages()

    // join room
    socket.emit?.('joinRoom', { roomId: activeRoom.id })

    const handleNewMessage = (msg) => {
      if (msg.roomId && msg.roomId !== activeRoom.id) return
      setMessages((prev) => [...prev, msg])
    }

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
      socket.emit?.('leaveRoom', { roomId: activeRoom.id })
      safeOff('chatMessage', handleNewMessage)
      safeOff('typing', handleTyping)
    }
  }, [socket, activeRoom, user])

  // Clear typing ที่หมดเวลา
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

  const typingUsers = Object.values(typingMap).map((t) => t.username)

  // -----------------------------
  // ส่งข้อความ
  // -----------------------------
  async function sendMessage(e) {
    if (e?.preventDefault) e.preventDefault()
    if (!text.trim() || !socket || !activeRoom || !user) return

    const trimmed = text.trim()

    try {
      const newMessage = await ChatAPI.sendMessage(
        activeRoom.id,
        user.id,
        trimmed,
      )

      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          roomId: activeRoom.id,
          userId: user.id,
          user: { username: user.username },
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ])

      socket.emit?.('chatMessage', {
        roomId: activeRoom.id,
        userId: user.id,
        text: trimmed,
      })

      setText('')
      setTypingMap((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // -----------------------------
  // พิมพ์ข้อความ + ยิง event typing
  // -----------------------------
  const handleChangeText = useCallback(
    (value) => {
      setText(value)
      if (!socket || !activeRoom || !user) return
      if (!value.trim()) return

      socket.emit?.('typing', {
        roomId: activeRoom.id,
        userId: user.id,
        username: user.username || 'Student',
      })
    },
    [socket, activeRoom, user],
  )

  // -----------------------------
  // สร้างห้อง (mock frontend-only)
  // -----------------------------
  function handleCreateRoom(roomData) {
    if (!user) return
    const tempId = `temp-${Date.now()}`
    const newRoom = {
      id: tempId,
      name: roomData.name,
      description: roomData.description,
      type: roomData.type,
      createdBy: user.id,
      isTemporary: true,
    }

    setRooms((prev) => [...prev, newRoom])
    setActiveRoom(newRoom)
    setMessages([])
  }

  function handleSelectRoom(room) {
    setActiveRoom(room)
    setMessages([])
    setTypingMap({})
  }

  if (!user) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-[#020617] flex items-center justify-center text-gray-300 text-sm">
        กรุณาเข้าสู่ระบบก่อนใช้งานห้องแชท
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#020617]">
      <ChatLayout
        rooms={rooms}
        roomsLoading={roomsLoading}
        roomsError={roomsError}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        messages={messages}
        loadingMessages={loadingMessages}
        currentUser={user}
        text={text}
        setText={handleChangeText}
        onSendMessage={sendMessage}
        canCreateRoom={canCreateRoom}
        onCreateRoom={handleCreateRoom}
        socketConnected={socketConnected}
        typingUsers={typingUsers}
      />
    </div>
  )
}
