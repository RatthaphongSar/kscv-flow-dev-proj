// backend/src/socket-handlers.example.js
/**
 * EXAMPLE: Socket.io event handlers for chat message status & unread tracking
 * 
 * Backend is responsible for:
 * 1. Emitting 'message:delivered' when message is saved
 * 2. Emitting 'message:seen' when user marks it read
 * 3. Tracking/emitting unread counts
 * 4. Broadcasting events to other users
 */

const { Server } = require('socket.io')
const db = require('../db') // Your database connection

// ============================================
// SETUP SOCKET.IO
// ============================================
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId
    const username = socket.handshake.auth.username

    console.log(`👤 User connected: ${username} (${userId})`)

    // ============================================
    // EVENT: message:send
    // ============================================
    socket.on('message:send', async (data) => {
      const { roomId, content, replyToId } = data

      try {
        // 1. Save message to database
        const message = await db.message.create({
          roomId,
          senderId: userId,
          content,
          replyToId: replyToId || null,
          createdAt: new Date(),
        })

        console.log('💾 Message saved:', message.id)

        // 2. EMIT to sender: message:delivered
        // Tell sender that message has been stored
        socket.emit('message:delivered', {
          messageId: message.id,
          timestamp: new Date().toISOString(),
        })

        // 3. BROADCAST to all in room: message:new
        // Tell all room members about the new message
        io.to(roomId).emit('message:new', {
          id: message.id,
          roomId,
          senderId: userId,
          content,
          createdAt: message.createdAt,
          status: 'delivered',
          replyToId,
        })

        // 4. UPDATE unread counts for others in room
        // Get all members of this room except sender
        const roomMembers = await db.room.findUnique({
          where: { id: roomId },
          select: { members: true },
        })

        roomMembers.members
          .filter(m => m !== userId)
          .forEach(memberId => {
            // Increment unread count for this member in this room
            db.unreadCount.upsert({
              where: {
                userId_roomId: { userId: memberId, roomId },
              },
              create: { userId: memberId, roomId, count: 1 },
              update: { count: { increment: 1 } },
            })

            // Notify them of updated unread count
            io.to(`user:${memberId}`).emit('room:unreadCountUpdated', {
              roomId,
              unreadCount: 1, // Or fetch actual count
            })
          })
      } catch (error) {
        console.error('❌ Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ============================================
    // EVENT: message:markSeen
    // ============================================
    socket.on('message:markSeen', async (data) => {
      const { roomId, messageId } = data

      try {
        // 1. Get all messages up to this messageId in this room
        const messages = await db.message.findMany({
          where: { roomId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        })

        const messageIndex = messages.findIndex(m => m.id === messageId)
        const messagesToMark = messages.slice(0, messageIndex + 1)

        // 2. Add current user to seenBy array for all these messages
        for (const msg of messagesToMark) {
          await db.message.update({
            where: { id: msg.id },
            data: {
              seenBy: {
                push: userId, // Assuming seenBy is array field in DB
              },
            },
          })
        }

        console.log(`👁️ ${messagesToMark.length} messages marked as seen by ${userId}`)

        // 3. BROADCAST to all in room: message:seen
        // Tell everyone that this user has seen up to this message
        io.to(roomId).emit('message:seen', {
          messageId,
          seenByUserId: userId,
          roomId,
          timestamp: new Date().toISOString(),
        })

        // 4. RESET unread count for this user in this room
        await db.unreadCount.updateMany({
          where: { userId, roomId },
          data: { count: 0 },
        })

        io.to(`user:${userId}`).emit('room:unreadCountUpdated', {
          roomId,
          unreadCount: 0,
        })
      } catch (error) {
        console.error('❌ Error marking message seen:', error)
      }
    })

    // ============================================
    // EVENT: room:join
    // ============================================
    socket.on('room:join', async (data) => {
      const { roomId } = data

      console.log(`🚪 User ${username} joining room ${roomId}`)

      // Join socket.io room
      socket.join(roomId)

      // Join user-specific room for private messages
      socket.join(`user:${userId}`)

      // Reset unread count when joining
      try {
        await db.unreadCount.updateMany({
          where: { userId, roomId },
          data: { count: 0 },
        })

        io.to(`user:${userId}`).emit('room:unreadCountUpdated', {
          roomId,
          unreadCount: 0,
        })
      } catch (error) {
        console.error('Error resetting unread count:', error)
      }
    })

    // ============================================
    // EVENT: room:leave
    // ============================================
    socket.on('room:leave', (data) => {
      const { roomId } = data
      console.log(`🚪 User ${username} leaving room ${roomId}`)
      socket.leave(roomId)
    })

    // ============================================
    // EVENT: Disconnect
    // ============================================
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${username}`)
    })
  })
}

// ============================================
// HELPER: Broadcast unread counts
// ============================================
async function broadcastUnreadCounts(io, userId) {
  try {
    const unreadByRoom = await db.unreadCount.findMany({
      where: { userId },
    })

    unreadByRoom.forEach(({ roomId, count }) => {
      io.to(`user:${userId}`).emit('room:unreadCountUpdated', {
        roomId,
        unreadCount: count,
      })
    })
  } catch (error) {
    console.error('Error broadcasting unread counts:', error)
  }
}

module.exports = { setupSocketHandlers, broadcastUnreadCounts }
