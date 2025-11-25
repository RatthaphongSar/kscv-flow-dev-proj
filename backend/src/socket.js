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

    // ============ VIDEO CONFERENCING EVENTS ============
    // Video room namespace: /meetings/:meetingId
    
    // Join video call
    socket.on('video:join', async ({ meetingId, sessionId }) => {
      try {
        if (!meetingId || !sessionId) {
          socket.emit('error', { message: 'Missing meetingId or sessionId' })
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
        if (!meetingId || !sessionId) return

        const participant = await videoService.leaveVideoCall(meetingId, socket.userId, sessionId)

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

      socket.to(`video:${meetingId}`).emit('video:offer', {
        from: socket.userId,
        sdp,
      })
    })

    // WebRTC Signaling: Send answer
    socket.on('video:answer', ({ meetingId, to, sdp }) => {
      if (!meetingId || !to) return

      socket.to(`video:${meetingId}`).emit('video:answer', {
        from: socket.userId,
        sdp,
      })
    })

    // WebRTC Signaling: Send ICE candidate
    socket.on('video:ice-candidate', ({ meetingId, to, candidate }) => {
      if (!meetingId || !to) return

      socket.to(`video:${meetingId}`).emit('video:ice-candidate', {
        from: socket.userId,
        candidate,
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
