// src/context/ChatSocketContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

// ปรับ URL ให้ชี้ backend https / พอร์ตของคุณ
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:4001'

const ChatSocketCtx = createContext(null)

export function ChatSocketProvider({ children }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const typingRoomsRef = useRef(new Set())

  useEffect(() => {
    if (!user) return
    
    // สร้าง socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: { userId: user.id, username: user.username }
    })
    
    // เก็บ socket instance
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user])

  const joinRoom = (roomId) => socketRef.current?.emit('chat:join', { roomId })
  const leaveRoom = (roomId) => socketRef.current?.emit('chat:leave', { roomId })
  const on = (event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }
  const emitTyping = (roomId, isTyping) => {
    if (!socketRef.current) return
    if (isTyping) typingRoomsRef.current.add(roomId)
    else typingRoomsRef.current.delete(roomId)
    socketRef.current.emit('chat:typing', { roomId, isTyping })
  }
  const emitSeen = (roomId, messageId) =>
    socketRef.current?.emit('chat:seen', { roomId, messageId })

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    joinRoom,
    leaveRoom,
    on,
    emitTyping,
    emitSeen,
    emit: (...args) => socketRef.current?.emit(...args)
  }), [connected])

  return <ChatSocketCtx.Provider value={value}>{children}</ChatSocketCtx.Provider>
}

export const useChatSocket = () => useContext(ChatSocketCtx)
