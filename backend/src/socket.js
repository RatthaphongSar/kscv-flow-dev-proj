// backend/src/socket.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

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

  // Auth middleware for socket.io
  io.use((socket, next) => {
    try {
      const token = socket.handshake.headers.cookie
        ? cookieParser.JSONCookies(cookieParser.signedCookies(
            { value: socket.handshake.headers.cookie },
            process.env.COOKIE_SECRET || ''
          )).value
        : null

      if (!token) {
        console.warn('[Socket] No token in handshake')
        return next(new Error('Unauthorized'))
      }

      let payload
      try {
        const cookies = {}
        socket.handshake.headers.cookie?.split(';').forEach(pair => {
          const [k, v] = pair.trim().split('=')
          cookies[k] = decodeURIComponent(v)
        })
        const accessToken = cookies.access_token

        if (!accessToken) {
          console.warn('[Socket] No access_token in cookies')
          return next(new Error('Unauthorized'))
        }

        payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
      } catch (err) {
        console.warn('[Socket] JWT verification failed:', err.message)
        return next(new Error('Unauthorized'))
      }

      socket.userId = payload.sub
      socket.username = payload.username
      console.log('[Socket] User authenticated:', { userId: socket.userId, username: socket.username })
      next()
    } catch (err) {
      console.error('[Socket] Auth error:', err.message)
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    console.log('[Socket] Connected:', socket.userId)

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
