// backend/src/services/chatSocket.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

/**
 * Socket event names (รวมไว้กันสะกดผิด)
 */
const EVT = {
  AUTH: 'auth',                 // client -> server: { accessToken? , userId? }  (อย่างใดอย่างหนึ่ง)
  JOIN: 'room:join',            // client -> server: { roomId }
  LEAVE: 'room:leave',          // client -> server: { roomId }

  TYPING_START: 'typing:start', // client -> server: { roomId }
  TYPING_STOP: 'typing:stop',   // client -> server: { roomId }

  MSG_SEND: 'message:send',     // client -> server: { tempId, roomId, content }
  MSG_EDIT: 'message:edit',     // client -> server: { messageId, content }
  MSG_DELETE: 'message:delete', // client -> server: { messageId }

  MSG_SENT: 'message:sent',     // server -> client: { tempId, message }
  MSG_NEW: 'message:new',       // server -> room: message (ผู้ส่ง + คนอื่นในห้อง)
  MSG_UPDATED: 'message:updated',
  MSG_REMOVED: 'message:removed',

  MSG_DELIVERED: 'message:delivered', // client -> server: { messageId }
  MSG_READ: 'message:read',           // client -> server: { messageId }
  MSG_DELIVERED_BROADCAST: 'message:delivered:ok', // server -> room
  MSG_READ_BROADCAST: 'message:read:ok',           // server -> room

  PRESENCE: 'presence',         // server -> room: { userId, status: 'online'|'offline' }
  ERROR: 'error',
}

/**
 * ตัวช่วย: auth แบบยืดหยุ่น
 * - ถ้ามี JWT มากับ event 'auth' จะ verify JWT แล้วผูก userId ให้ socket
 * - ถ้าไม่มี JWT แต่ส่ง userId แบบ dev ก็อนุโลม (เฉพาะ dev/testing)
 */
function bindAuthHandlers(io, socket) {
  socket.data.userId = null

  socket.on(EVT.AUTH, async (payload = {}) => {
    try {
      const { accessToken, userId } = payload
      let uid = null

      if (accessToken) {
        // แนะนำ: ใช้ JWT_ACCESS_SECRET เดียวกับ REST /auth
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        uid = decoded?.sub
      } else if (userId && process.env.NODE_ENV !== 'production') {
        // dev-mode fallback
        uid = userId
      }

      if (!uid) throw new Error('Unauthenticated')

      // ตรวจว่ามี user จริง
      const u = await prisma.user.findUnique({ where: { id: uid } })
      if (!u) throw new Error('User not found')

      socket.data.userId = uid
      socket.emit('auth:ok', { userId: uid })
    } catch (e) {
      socket.emit(EVT.ERROR, { code: 'AUTH_FAIL', message: e.message })
    }
  })
}

/**
 * ตรวจสิทธิ์ว่าเป็นสมาชิกห้องหรือไม่ (กันยิงข้ามห้อง)
 */
async function ensureMember(roomId, userId) {
  const m = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
    select: { userId: true },
  })
  return !!m
}

/**
 * Presence: track ออนไลน์/ออฟไลน์ ด้วย in-memory
 * - userSockets: Map<userId, Set<socketId>>
 */
const userSockets = new Map()

function addPresence(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set())
  userSockets.get(userId).add(socketId)
}

function removePresence(userId, socketId) {
  if (!userId) return
  const set = userSockets.get(userId)
  if (!set) return
  set.delete(socketId)
  if (set.size === 0) userSockets.delete(userId)
}

function isOnline(userId) {
  return userSockets.has(userId)
}

/**
 * ติดตั้ง Socket.IO ให้พร้อมใช้งาน
 */
export function mountChatSocket(server, opts = {}) {
  const io = new Server(server, {
    cors: {
      origin: opts.corsOrigin || process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    },
    pingInterval: 20000,
    pingTimeout: 20000,
  })

  io.on('connection', (socket) => {
    // ----- AUTH -----
    bindAuthHandlers(io, socket)

    socket.on('disconnect', () => {
      // on disconnect: อัปเดต presence
      const uid = socket.data.userId
      if (!uid) return
      removePresence(uid, socket.id)

      // Broadcast offline ไปทุกห้องที่ socket อยู่
      // หมายเหตุ: socket.rooms คือ Set ที่มี socket.id และ roomIds
      for (const r of socket.rooms) {
        if (r !== socket.id) {
          io.to(r).emit(EVT.PRESENCE, { userId: uid, status: 'offline' })
        }
      }
    })

    // ----- JOIN / LEAVE -----
    socket.on(EVT.JOIN, async ({ roomId }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!roomId) throw new Error('roomId required')

        // guard membership
        const ok = await ensureMember(roomId, uid)
        if (!ok) throw new Error('Not a member of this room')

        socket.join(roomId)

        // mark presence
        addPresence(uid, socket.id)
        io.to(roomId).emit(EVT.PRESENCE, { userId: uid, status: 'online' })
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'JOIN_FAIL', message: e.message })
      }
    })

    socket.on(EVT.LEAVE, async ({ roomId }) => {
      try {
        if (!roomId) throw new Error('roomId required')
        socket.leave(roomId)
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'LEAVE_FAIL', message: e.message })
      }
    })

    // ----- TYPING -----
    socket.on(EVT.TYPING_START, ({ roomId }) => {
      const uid = socket.data.userId
      if (!uid || !roomId) return
      socket.to(roomId).emit(EVT.TYPING_START, { userId: uid, roomId })
    })
    socket.on(EVT.TYPING_STOP, ({ roomId }) => {
      const uid = socket.data.userId
      if (!uid || !roomId) return
      socket.to(roomId).emit(EVT.TYPING_STOP, { userId: uid, roomId })
    })

    // ----- MESSAGE SEND -----
    socket.on(EVT.MSG_SEND, async ({ tempId, roomId, content }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!roomId || !content?.trim()) throw new Error('roomId and content are required')

        // guard membership
        const ok = await ensureMember(roomId, uid)
        if (!ok) throw new Error('Not a member of this room')

        // persist message
        const message = await prisma.message.create({
          data: { content: content.trim(), userId: uid, roomId },
          include: { user: true },
        })

        // ส่งกลับหา "ผู้ส่ง" เพื่อลบสถานะ sending → sent (จับคู่ด้วย tempId)
        socket.emit(EVT.MSG_SENT, { tempId, message })

        // ส่งไปให้สมาชิกห้องทั้งหมด (รวมผู้ส่ง) เป็น message ใหม่
        io.to(roomId).emit(EVT.MSG_NEW, message)
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'MSG_SEND_FAIL', message: e.message })
      }
    })

    // ----- MESSAGE EDIT -----
    socket.on(EVT.MSG_EDIT, async ({ messageId, content }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!messageId || !content?.trim()) throw new Error('messageId and content required')

        // ตรวจว่าเป็นเจ้าของข้อความ
        const original = await prisma.message.findUnique({ where: { id: messageId } })
        if (!original) throw new Error('Message not found')
        if (original.userId !== uid) throw new Error('Forbidden')

        const updated = await prisma.message.update({
          where: { id: messageId },
          data: { content: content.trim(), edited: true },
        })

        io.to(original.roomId).emit(EVT.MSG_UPDATED, updated)
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'MSG_EDIT_FAIL', message: e.message })
      }
    })

    // ----- MESSAGE DELETE -----
    socket.on(EVT.MSG_DELETE, async ({ messageId }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!messageId) throw new Error('messageId required')

        const original = await prisma.message.findUnique({ where: { id: messageId } })
        if (!original) throw new Error('Message not found')
        if (original.userId !== uid) throw new Error('Forbidden')

        await prisma.message.delete({ where: { id: messageId } })
        io.to(original.roomId).emit(EVT.MSG_REMOVED, { messageId })
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'MSG_DELETE_FAIL', message: e.message })
      }
    })

    // ----- DELIVERY / READ RECEIPTS -----
    socket.on(EVT.MSG_DELIVERED, async ({ messageId }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!messageId) throw new Error('messageId required')

        // บันทึก deliveredAt (ต้องมี model MessageDelivery แยก ถ้าต้องการละเอียดต่อ-user)
        // ที่นี่ตัวอย่างง่าย: อัปเดตฟิลด์ deliveredAt ในตาราง Message (เชิง global)
        const msg = await prisma.message.update({
          where: { id: messageId },
          data: { deliveredAt: new Date() },
        })
        io.to(msg.roomId).emit(EVT.MSG_DELIVERED_BROADCAST, { messageId, at: msg.deliveredAt })
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'MSG_DELIVERED_FAIL', message: e.message })
      }
    })

    socket.on(EVT.MSG_READ, async ({ messageId }) => {
      try {
        const uid = socket.data.userId
        if (!uid) throw new Error('Unauthenticated')
        if (!messageId) throw new Error('messageId required')

        const msg = await prisma.message.update({
          where: { id: messageId },
          data: { readAt: new Date() },
        })
        io.to(msg.roomId).emit(EVT.MSG_READ_BROADCAST, { messageId, at: msg.readAt, readerId: uid })
      } catch (e) {
        socket.emit(EVT.ERROR, { code: 'MSG_READ_FAIL', message: e.message })
      }
    })
  })

  console.log('[ChatSocket] mounted.')

  return io
}
