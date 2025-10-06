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
    // join ห้อง
    socket.on('joinRoom', (roomId) => socket.join(roomId))

    // typing indicator (option เผื่อใช้)
    socket.on('typing', ({ roomId, user }) => {
      socket.to(roomId).emit('typing', { user })
    })
    socket.on('stopTyping', ({ roomId, user }) => {
      socket.to(roomId).emit('stopTyping', { user })
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('socket.io not initialized')
  return io
}
