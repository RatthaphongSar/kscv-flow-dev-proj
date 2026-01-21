// backend/src/socket.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import * as videoService from './services/videoConferencing.js'

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
      // 1. Try cookie
      let token = socket.handshake.headers.cookie
        ? cookieParser.JSONCookies(cookieParser.signedCookies(
            { value: socket.handshake.headers.cookie },
            process.env.COOKIE_SECRET || ''
          )).value
        : null

      // 2. Try auth handshake (localStorage)
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token
      }

      // 3. Try Authorization header
      if (!token && socket.handshake.headers.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1]
        }
      }

      if (!token) {
        console.warn('[Socket] No token in handshake')
        return next(new Error('Unauthorized'))
      }

      // Handle Mock Tokens
      if (token.startsWith('mock-')) {
         if (token.includes('teacher')) {
           socket.userId = 'teacher-001'
           socket.username = 'teacher'
         } else if (token.includes('student')) {
           socket.userId = 'student-001'
           socket.username = 'student'
         } else if (token.includes('admin')) {
           socket.userId = 'admin-001'
           socket.username = 'admin'
         } else {
           // Default mock
           socket.userId = 'mock-user-001'
           socket.username = 'mockuser'
         }
         console.log('[Socket] Mock User authenticated:', { userId: socket.userId, username: socket.username })
         return next()
      }

      let payload
      try {
        // If token is just the JWT string (from auth.token or header)
        let accessToken = token
        
        // If it came from cookie, it might need parsing if it was a JSON object? 
        // But usually cookie-parser returns the value. 
        // Let's assume 'token' is the JWT string or "access_token=..." string if not parsed correctly?
        // Actually earlier code did: const accessToken = cookies.access_token
        
        // Let's try to extract from cookie string if it was not parsed by cookieParser (e.g. handshake.headers.cookie)
        if (token.includes('access_token=')) {
           const match = token.match(/access_token=([^;]+)/)
           if (match) accessToken = decodeURIComponent(match[1])
        }

        if (!accessToken) {
          console.warn('[Socket] No access_token found')
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

    // Join user-specific room for direct messaging (signaling)
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
      console.log(`[Socket] User ${socket.userId} joined room user:${socket.userId}`)
    }

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

    // ============ VIDEO CONFERENCING EVENTS ============
    // Video room namespace: /meetings/:meetingId
    
    // Join video call
    socket.on('video:join', async ({ meetingId, sessionId }) => {
      try {
        if (!meetingId) {
          socket.emit('error', { message: 'Missing meetingId' })
          return
        }

        // If sessionId is missing, try to find it from active sessions
        if (!sessionId) {
            sessionId = videoService.getActiveSessionId(meetingId)
        }

        if (!sessionId) {
            socket.emit('error', { message: 'No active video session found. The meeting may not have started yet.' })
            return
        }

        // Join socket room
        socket.join(`video:${meetingId}`)

        // Add participant to database
        const participant = await videoService.joinVideoCall(meetingId, socket.userId, sessionId)

        // Notify others that user joined
        socket.to(`video:${meetingId}`).emit('video:user-joined', {
          userId: participant.userId,
          username: participant.user.username,
          timestamp: new Date(),
        })

        // Send current participants to joining user
        const participants = await videoService.getActiveParticipants(sessionId)
        socket.emit('video:participants-list', {
          participants: participants.map(p => ({
            userId: p.userId,
            username: p.user.username,
            videoEnabled: p.videoEnabled,
            audioEnabled: p.audioEnabled,
            screenShared: p.screenShared,
          })),
        })

        console.log(`[Video] User ${socket.userId} joined meeting ${meetingId}`)
      } catch (error) {
        console.error('[Video] Error joining:', error)
        socket.emit('error', { message: 'Failed to join video call' })
      }
    })

    // Leave video call
    socket.on('video:leave', async ({ meetingId, sessionId }) => {
      try {
        if (!meetingId) return
        if (!sessionId) {
          sessionId = videoService.getActiveSessionId(meetingId)
        }
        if (!sessionId) return

        await videoService.leaveVideoCall(meetingId, socket.userId, sessionId)

        // Notify others that user left
        socket.to(`video:${meetingId}`).emit('video:user-left', {
          userId: socket.userId,
          timestamp: new Date(),
        })

        socket.leave(`video:${meetingId}`)
        console.log(`[Video] User ${socket.userId} left meeting ${meetingId}`)
      } catch (error) {
        console.error('[Video] Error leaving:', error)
      }
    })

    // WebRTC Signaling: Send offer
    socket.on('video:offer', ({ meetingId, to, sdp }) => {
      if (!meetingId || !to) return

      // Send to specific user
      socket.to(`user:${to}`).emit('video:offer', {
        from: socket.userId,
        sdp,
        meetingId // Include meetingId for context
      })
    })

    // WebRTC Signaling: Send answer
    socket.on('video:answer', ({ meetingId, to, sdp }) => {
      if (!meetingId || !to) return

      // Send to specific user
      socket.to(`user:${to}`).emit('video:answer', {
        from: socket.userId,
        sdp,
        meetingId
      })
    })

    // WebRTC Signaling: Send ICE candidate
    socket.on('video:ice-candidate', ({ meetingId, to, candidate }) => {
      if (!meetingId || !to) return

      // Send to specific user
      socket.to(`user:${to}`).emit('video:ice-candidate', {
        from: socket.userId,
        candidate,
        meetingId
      })
    })

    // Toggle camera
    socket.on('video:toggle-camera', async ({ meetingId, sessionId, enabled }) => {
      try {
        if (!meetingId || !sessionId) return

        await videoService.toggleCamera(sessionId, socket.userId, enabled)

        // Notify others about camera state
        socket.to(`video:${meetingId}`).emit('video:camera-toggled', {
          userId: socket.userId,
          enabled,
        })
      } catch (error) {
        console.error('[Video] Error toggling camera:', error)
      }
    })

    // Toggle microphone
    socket.on('video:toggle-mic', async ({ meetingId, sessionId, enabled }) => {
      try {
        if (!meetingId || !sessionId) return

        await videoService.toggleMicrophone(sessionId, socket.userId, enabled)

        // Notify others about mic state
        socket.to(`video:${meetingId}`).emit('video:mic-toggled', {
          userId: socket.userId,
          enabled,
        })
      } catch (error) {
        console.error('[Video] Error toggling microphone:', error)
      }
    })

    // Start screen sharing
    socket.on('video:start-screen-share', async ({ meetingId }) => {
      try {
        if (!meetingId) return

        const screenSession = await videoService.startScreenShare(meetingId, socket.userId)

        // Notify others about screen share
        socket.to(`video:${meetingId}`).emit('video:screen-share-started', {
          userId: socket.userId,
          username: screenSession.presenter.username,
          screenSessionId: screenSession.id,
        })
      } catch (error) {
        console.error('[Video] Error starting screen share:', error)
        socket.emit('error', { message: 'Failed to start screen sharing' })
      }
    })

    // Stop screen sharing
    socket.on('video:stop-screen-share', async ({ meetingId, screenSessionId }) => {
      try {
        if (!meetingId || !screenSessionId) return

        await videoService.stopScreenShare(screenSessionId)

        // Notify others about screen share stop
        socket.to(`video:${meetingId}`).emit('video:screen-share-stopped', {
          userId: socket.userId,
        })
      } catch (error) {
        console.error('[Video] Error stopping screen share:', error)
      }
    })

    // Chat message in video call
    socket.on('video:chat-message', async ({ meetingId, content }) => {
      try {
        if (!meetingId || !content) return

        const message = await videoService.saveChatMessage(
          meetingId,
          socket.userId,
          content,
          socket.username
        )

        // Broadcast message to all participants
        socket.to(`video:${meetingId}`).emit('video:chat-message', {
          userId: message.senderId,
          username: message.senderName,
          content: message.content,
          timestamp: message.createdAt,
        })
      } catch (error) {
        console.error('[Video] Error saving chat message:', error)
      }
    })

    // Get chat history
    socket.on('video:get-chat-history', async ({ meetingId }) => {
      try {
        if (!meetingId) return

        const messages = await videoService.getChatHistory(meetingId, 100)

        socket.emit('video:chat-history', {
          messages: messages.map(m => ({
            userId: m.senderId,
            username: m.senderName,
            content: m.content,
            timestamp: m.createdAt,
          })),
        })
      } catch (error) {
        console.error('[Video] Error getting chat history:', error)
      }
    })

    // Raise hand
    socket.on('video:raise-hand', ({ meetingId }) => {
      if (!meetingId) return

      socket.to(`video:${meetingId}`).emit('video:hand-raised', {
        userId: socket.userId,
        username: socket.username,
      })
    })

    // Lower hand
    socket.on('video:lower-hand', ({ meetingId }) => {
      if (!meetingId) return

      socket.to(`video:${meetingId}`).emit('video:hand-lowered', {
        userId: socket.userId,
      })
    })

    // Log call statistics
    socket.on('video:log-stats', async ({ meetingId, sessionId, stats }) => {
      try {
        if (!meetingId || !sessionId) return

        await videoService.logCallStats(sessionId, meetingId, stats)
      } catch (error) {
        console.error('[Video] Error logging stats:', error)
      }
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('socket.io not initialized')
  return io
}
