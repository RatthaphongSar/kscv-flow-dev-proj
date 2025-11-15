// backend/src/controllers/chat.js
import { prisma } from '../db.js'
import { getIO } from '../socket.js'

/**
 * POST /rooms
 * body: { name: string, memberIds?: string[] }
 * เฉพาะ TEACHER / ADMIN เท่านั้นที่สร้างห้องได้
 * - ถ้าไม่ส่ง memberIds → ดึงนักเรียน (role = STUDENT) ทั้งหมด + ครูผู้สร้าง เป็นสมาชิกห้อง
 * - ถ้าส่ง memberIds → ใช้ชุดนั้น + ครูผู้สร้าง แล้ว dedupe
 */
export const createRoom = async (req, res, next) => {
  try {
    const { name, memberIds = [] } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['TEACHER', 'ADMIN'].includes(currentUser.role)) {
      return res
        .status(403)
        .json({ error: 'Only teacher or admin can create rooms' })
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' })
    }

    // เริ่มจากเพิ่ม creator เข้าไปแน่นอน
    let targetIds = Array.isArray(memberIds) ? [...memberIds] : []
    targetIds.push(currentUser.id)

    // ถ้าไม่ส่ง memberIds → ดึงนักเรียนทั้งหมด
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true },
      })
      targetIds.push(...students.map((s) => s.id))
    }

    // ลบซ้ำ
    targetIds = [...new Set(targetIds)]

    if (targetIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'No members to add to this room' })
    }

    // ตรวจว่ามี user จริงกี่คน
    const users = await prisma.user.findMany({
      where: { id: { in: targetIds } },
      select: { id: true },
    })
    const existingIds = users.map((u) => u.id)
    const missing = targetIds.filter((id) => !existingIds.includes(id))

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Some memberIds do not exist',
        missing,
      })
    }

    const room = await prisma.room.create({
      data: {
        name,
        type: 'manual',
        members: {
          create: existingIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: { include: { user: true } },
      },
    })

    return res.status(201).json(room)
  } catch (err) {
    if (err?.code === 'P2002') {
      // ชื่อห้องซ้ำ
      return res.status(409).json({ error: 'Room name already exists' })
    }
    console.error('createRoom error:', err)
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
      const key = `${u.major || 'UNKNOWN'}-Y${u.year ?? '?'}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(u.id)
    }

    const createdRooms = []
    for (const [name, userIds] of groups.entries()) {
      const room = await prisma.room.upsert({
        where: { name },
        update: {},
        create: { name, type: 'auto' },
      })

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
    console.error('autoRooms error:', err)
    return next(err)
  }
}

/**
 * GET /rooms
 * คืน list ห้องที่ user คนนั้นเป็นสมาชิก
 * ใช้ user จาก JWT เป็นหลัก (req.user.sub)
 * ถ้าไม่มี (เผื่อกรณี legacy) ค่อย fallback ไปใช้ req.query.userId
 */
export const listRooms = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const rooms = await prisma.room.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { user: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(rooms)
  } catch (err) {
    console.error('listRooms error:', err)
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
      include: { 
        user: true,
        replyTo: {
          include: { user: true }
        }
      },
    })
    res.json(msgs)
  } catch (e) {
    next(e)
  }
}

/**
 * POST /rooms/:roomId/messages
 * ส่งข้อความในห้อง
 * ใช้ userId จาก JWT เป็นหลัก
 * body: { content, replyToId? }
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { content, replyToId } = req.body
    const userId = req.user?.id || req.body.userId

    if (!userId || !content) {
      return res
        .status(400)
        .json({ error: 'userId and content are required' })
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) return res.status(404).json({ error: 'Room not found' })

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })
    if (!member) {
      return res
        .status(403)
        .json({ error: 'Not a member of this room' })
    }

    // ตรวจสอบ replyToId ถ้ามี
    if (replyToId) {
      const replyTo = await prisma.message.findUnique({ where: { id: replyToId } })
      if (!replyTo) {
        return res.status(404).json({ error: 'Reply message not found' })
      }
      if (replyTo.roomId !== roomId) {
        return res.status(400).json({ error: 'Reply message is from different room' })
      }
    }

    const message = await prisma.message.create({
      data: { 
        content, 
        userId, 
        roomId,
        ...(replyToId && { replyToId })
      },
      include: { 
        user: true,
        replyTo: {
          include: { user: true }
        }
      },
    })

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

/**
 * PATCH /rooms/:roomId/messages/:messageId
 * แก้ไขข้อความ (เจ้าของข้อความเท่านั้น)
 */
export const editMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const { content } = req.body
    const userId = req.user?.id || req.body.userId

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    if (message.roomId !== roomId) {
      return res.status(400).json({ error: 'Room mismatch' })
    }

    if (!userId || message.userId !== userId) {
      return res.status(403).json({ error: 'Not message owner' })
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
        editedAt: new Date(),
      },
      include: {
        user: true,
      },
    })

    const io = getIO()
    io.to(roomId).emit('messageEdited', updated)

    return res.json(updated)
  } catch (err) {
    console.error('editMessage error:', err)
    return next(err)
  }
}

/**
 * DELETE /rooms/:roomId/messages/:messageId
 * ลบข้อความ (เจ้าของข้อความ หรือ member ที่ role = 'admin' ในห้อง)
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const userId = req.user?.id || req.body.userId

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    if (message.roomId !== roomId) {
      return res.status(400).json({ error: 'Room mismatch' })
    }

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })

    if (message.userId !== userId && member?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete' })
    }

    await prisma.message.delete({
      where: { id: messageId },
    })

    const io = getIO()
    io.to(roomId).emit('messageDeleted', { messageId })

    return res.status(204).send()
  } catch (err) {
    console.error('deleteMessage error:', err)
    return next(err)
  }
}

/**
 * GET /students
 * ดึงรายชื่อนักเรียนทั้งหมด (สำหรับ TEACHER/ADMIN เพื่อเพิ่มลงห้อง)
 */
export const getStudents = async (req, res, next) => {
  try {
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['TEACHER', 'ADMIN'].includes(currentUser.role)) {
      return res
        .status(403)
        .json({ error: 'Only teacher or admin can view students' })
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        username: true,
        email: true,
        year: true,
        major: true,
      },
      orderBy: [
        { year: 'asc' },
        { major: 'asc' },
        { username: 'asc' },
      ],
    })

    return res.json(students)
  } catch (err) {
    console.error('getStudents error:', err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/add-members
 * เพิ่มสมาชิกเข้าห้อง (เฉพาะผู้สร้างห้องหรือ ADMIN)
 * body: { memberIds: string[] }
 */
export const addMembersToRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { memberIds = [] } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!['TEACHER', 'ADMIN'].includes(currentUser.role)) {
      return res
        .status(403)
        .json({ error: 'Only teacher or admin can add members to room' })
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'memberIds must be a non-empty array' })
    }

    // ตรวจว่าห้องมีอยู่
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // ตรวจว่า user เป็นสมาชิกห้องแล้ว
    const isMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember && currentUser.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'You are not a member of this room' })
    }

    // ตรวจว่า memberIds ที่ส่งมา มีอยู่จริง
    const users = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    })
    const existingIds = users.map((u) => u.id)
    const missing = memberIds.filter((id) => !existingIds.includes(id))

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Some memberIds do not exist',
        missing,
      })
    }

    // เพิ่มสมาชิกใหม่ (ถ้าไม่มีแล้ว)
    const addedMembers = []
    for (const userId of existingIds) {
      const existing = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId } },
      })

      if (!existing) {
        const member = await prisma.roomMember.create({
          data: { roomId, userId },
          include: { user: true },
        })
        addedMembers.push(member)
      }
    }

    return res.json({
      message: 'Members added successfully',
      count: addedMembers.length,
      members: addedMembers,
    })
  } catch (err) {
    console.error('addMembersToRoom error:', err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/messages/:messageId/read
 * Mark message as read
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const userId = req.user?.id || req.body.userId

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    })

    if (!member) {
      return res.status(403).json({ error: 'Not a room member' })
    }

    const readMark = await prisma.messageRead.create({
      data: {
        messageId,
        userId,
      },
      include: {
        message: true,
        user: true,
      },
    })

    const io = getIO()
    io.to(roomId).emit('messageRead', readMark)

    return res.status(201).json(readMark)
  } catch (err) {
    if (err.code === 'P2002') {
      // อ่านไปแล้ว
      return res.status(200).json({ message: 'Already marked as read' })
    }
    console.error('markMessageAsRead error:', err)
    return next(err)
  }
}
