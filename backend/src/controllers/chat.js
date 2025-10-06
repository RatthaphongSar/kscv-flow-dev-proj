// backend/src/controllers/chat.js
import { prisma } from "../db.js"
import { getIO } from '../socket.js'
/**
 * POST /rooms
 * body: { name: string, memberIds?: string[] }
 */
export const createRoom = async (req, res, next) => {
  try {
    const { name, memberIds = [] } = req.body
    if (!name) return res.status(400).json({ error: "Room name is required" })

    // ตรวจว่ามี user จริงกี่คน
    const users = memberIds.length
      ? await prisma.user.findMany({
          where: { id: { in: memberIds } },
          select: { id: true },
        })
      : []
    const existingIds = new Set(users.map(u => u.id))
    const missing = memberIds.filter(id => !existingIds.has(id))
    if (missing.length > 0) {
      return res.status(400).json({ error: "Some memberIds do not exist", missing })
    }

    const room = await prisma.room.create({
      data: {
        name,
        type: "manual",
        members: {
          create: [...existingIds].map(userId => ({ userId })),
        },
      },
      include: {
        members: { include: { user: true } },
      },
    })

    return res.status(201).json(room)
  } catch (err) {
    if (err?.code === "P2002") {
      // ชื่อห้องซ้ำ
      return res.status(409).json({ error: "Room name already exists" })
    }
    console.error("createRoom error:", err)
    return next(err)
  }
}

/**
 * GET /rooms/auto
 * สร้างห้อง community: <major>-Y<year> และผูกสมาชิกอัตโนมัติ
 */
export const autoRooms = async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, year: true, major: true },
    })

    const groups = new Map()
    for (const u of users) {
      const key = `${u.major || "UNKNOWN"}-Y${u.year ?? "?"}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(u.id)
    }

    const createdRooms = []
    for (const [name, userIds] of groups.entries()) {
      const room = await prisma.room.upsert({
        where: { name },
        update: {},
        create: { name, type: "auto" },
      })

      // unique(roomId, userId) ป้องกันซ้ำได้
      for (const userId of userIds) {
        await prisma.roomMember.upsert({
          where: { roomId_userId: { roomId: room.id, userId } },
          update: {},
          create: { roomId: room.id, userId },
        })
      }
      createdRooms.push(room)
    }

    return res.json(createdRooms)
  } catch (err) {
    console.error("autoRooms error:", err)
    return next(err)
  }
}

/**
 * GET /rooms?userId=xxx
 * รายการห้องที่ user เป็นสมาชิก + ข้อความล่าสุด
 */
export const listRooms = async (req, res, next) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const rooms = await prisma.room.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { user: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return res.json(rooms)
  } catch (err) {
    console.error("listRooms error:", err)
    return next(err)
  }
}

export const listMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const limit = Number(req.query.limit ?? 50)
    const msgs = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Math.max(limit, 1), 200),
      include: { user: true },
    })
    res.json(msgs)
  } catch (e) {
    next(e)
  }
}

export const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { userId, content } = req.body
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' })
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) return res.status(404).json({ error: 'Room not found' })

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })
    if (!member) return res.status(403).json({ error: 'Not a member of this room' })

    const message = await prisma.message.create({
      data: { content, userId, roomId },
      include: { user: true },
    })

    // ส่ง realtime ถ้ามี socket.io
    try {
      const io = getIO()
      io.to(roomId).emit('chatMessage', message)
    } catch (_) {}

    return res.status(201).json(message)
  } catch (err) {
    console.error('sendMessage error:', err)
    return next(err)
  }
}
