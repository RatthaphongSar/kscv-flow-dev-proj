// backend/src/socket.js
import { Server } from 'socket.io'

let io = null

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .concat(['http://localhost:5173', 'https://localhost:5173']),
      credentials: true,
    },
    path: '/socket.io', // ค่า default; ใส่ไว้ชัดๆ
  })

  io.on('connection', (socket) => {
    // join ห้อง (รองรับชื่อดั้งเดิมและชื่อที่ frontend ใช้)
    socket.on('joinRoom', (roomId) => socket.join(roomId))
    socket.on('chat:join', ({ roomId } = {}) => {
      if (!roomId) return
      socket.join(roomId)
    })

    // leave ห้อง
    socket.on('chat:leave', ({ roomId } = {}) => {
      if (!roomId) return
      socket.leave(roomId)
    })

    // typing indicators - support both simple and namespaced events
    socket.on('typing', ({ roomId, user } = {}) => {
      if (!roomId) return
      socket.to(roomId).emit('typing', { user })
    })
    socket.on('stopTyping', ({ roomId, user } = {}) => {
      if (!roomId) return
      socket.to(roomId).emit('stopTyping', { user })
    })

    // frontend emits namespaced typing with isTyping flag
    socket.on('chat:typing', ({ roomId, isTyping, user } = {}) => {
      if (!roomId) return
      // broadcast typing state to other members in room
      socket.to(roomId).emit('chat:typing', { user, isTyping })
    })

    // seen/read events
    socket.on('chat:seen', ({ roomId, messageId, user } = {}) => {
      if (!roomId || !messageId) return
      socket.to(roomId).emit('chat:seen', { messageId, user })
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('socket.io not initialized')
  return io
}
