// backend/src/controllers/chat.js
import { prisma } from "../db.js"
import { getIO } from '../socket.js'

/**
 * POST /rooms
 * body: { name: string, description?: string, type?: string, memberIds?: string[] }
 */
export const createRoom = async (req, res, next) => {
  try {
    const { name, description, type = 'group', memberIds } = req.body
    if (!name) return res.status(400).json({ error: "Room name is required" })
    if (!['group', 'private', 'public'].includes(type)) {
      return res.status(400).json({ error: "Invalid room type" })
    }

    // ตรวจว่ามี user จริงกี่คน
    const userIds = memberIds || []
    const users = userIds.length
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
        description,
        type,
        members: {
          create: [...existingIds].map(userId => ({
            userId,
            role: type === 'private' ? 'member' : userId === req.user.id ? 'admin' : 'member'
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          }
        },
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
 * GET /rooms
 * Query: search?: string
 */
export const getRooms = async (req, res, next) => {
  try {
    const search = req.query.search?.toString()
    const rooms = await prisma.room.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      },
    })
    return res.json(rooms)
  } catch (err) {
    console.error("getRooms error:", err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/messages
 */
export const getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      take: 50,
    })
    return res.json(messages)
  } catch (err) {
    console.error("getRoomMessages error:", err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/messages/:messageId/read
 * Mark a message as read by the current user
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const userId = req.user.id

    // Check if user is member of room
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    })
    if (!member) {
      return res.status(403).json({ error: "Not a member of this room" })
    }

    // Mark message as read
    const messageRead = await prisma.messageRead.create({
      data: {
        messageId,
        userId
      },
      include: {
        message: true
      }
    })

    // Notify other users
    getIO().to(roomId).emit('messageRead', { messageId, userId })

    return res.json(messageRead)
  } catch (err) {
    if (err?.code === 'P2002') {
      // Already marked as read
      return res.status(409).json({ error: "Message already marked as read" })
    }
    console.error("markMessageAsRead error:", err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/messages/:messageId/reply
 * Reply to a message
 * body: { content: string, type?: string }
 */
export const replyToMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const { content, type = 'text' } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({ error: "Message content is required" })
    }

    // Check if user is member of room
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    })
    if (!member) {
      return res.status(403).json({ error: "Not a member of this room" })
    }

    // Create reply message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        userId,
        roomId,
        replyToId: messageId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    })

    // Notify room members
    getIO().to(roomId).emit('newMessage', message)

    return res.status(201).json(message)
  } catch (err) {
    console.error("replyToMessage error:", err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/messages
 * body: { content: string, type?: string, fileUrl?: string }
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { content, type = 'text', fileUrl } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (!['text', 'image', 'file'].includes(type)) {
      return res.status(400).json({ error: 'Invalid message type' })
    }

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })
    if (!member) return res.status(403).json({ error: 'Not a member of this room' })

    const message = await prisma.message.create({
      data: {
        content,
        type,
        fileUrl,
        userId,
        roomId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        readBy: true
      },
    })

    // Update last seen
    await prisma.roomMember.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastSeen: new Date() }
    })

    // Notify room members
    getIO().to(roomId).emit('newMessage', message)

    return res.status(201).json(message)
  } catch (err) {
    console.error('sendMessage error:', err)
    return next(err)
  }
}
