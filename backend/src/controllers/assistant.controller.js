// backend/src/controllers/assistant.controller.js
import { prisma } from '../db.js'

// helper: สร้าง/หา user
async function ensureUser(userId) {
  if (!userId) return null
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, username: userId, year: 1, major: 'General' }
  })
  return userId
}

// helper: หา roomId จาก roomId หรือ roomName (ถ้าไม่พบและ allowAutoCreate = true จะสร้าง)
async function resolveRoom({ roomId, roomName, allowAutoCreate = true }) {
  if (roomId) {
    const r = await prisma.room.findUnique({ where: { id: roomId } })
    if (r) return r
  }
  if (roomName) {
    let r = await prisma.room.findUnique({ where: { name: roomName } })
    if (!r && allowAutoCreate) {
      r = await prisma.room.create({ data: { name: roomName, type: 'manual' } })
    }
    if (r) return r
  }
  return null
}

// helper: ใส่ user เข้าเป็นสมาชิกห้อง (idempotent)
async function ensureMember({ roomId, userId }) {
  if (!roomId || !userId) return
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId, userId } },
    update: {},
    create: { roomId, userId }
  })
}

export async function statusHandler(_req, res) {
  res.json({
    service: 'KVC Assistant',
    version: '1.0.0',
    endpoints: ['/chat'],
    provider: process.env.AI_PROVIDER || 'none',
    vector: 'none'
  })
}

export async function chatHandler(req, res) {
  try {
    const { message, userId, roomId, roomName } = req.body
    if (!message) return res.status(400).json({ error: 'message is required' })

    // 1) ensure user
    await ensureUser(userId)

    // 2) resolve room
    const room = await resolveRoom({ roomId, roomName, allowAutoCreate: true })
    if (!room) {
      return res.status(400).json({ error: 'room not found (or cannot create). Provide roomId or roomName.' })
    }

    // 3) ensure membership
    await ensureMember({ roomId: room.id, userId })

    // 4) สร้างคำตอบจาก assistant (ตัวอย่างแบบ rule-based)
    const reply =
      "สวัสดีครับ 👋 ฉันคือ Assistant ของ KVC คุณสามารถถามเกี่ยวกับ ‘ตารางเรียน’, ‘ข่าว/ประกาศ’, ‘ระบบลาเรียน’, ‘ลงทะเบียนเรียน’, หรือ ‘ติดต่ออาจารย์ที่ปรึกษา’ ได้เลยครับ"

    // 5) persist ก่อนตอบ (กัน FK error)
    let persisted = false
    try {
      await prisma.message.create({
        data: {
          content: message,
          userId: userId ?? null,
          roomId: room.id
        }
      })
      await prisma.message.create({
        data: {
          content: reply,
          userId: userId ?? null, // ถ้าจะเก็บเป็น bot user แยก ให้เปลี่ยนเป็น botId
          roomId: room.id
        }
      })
      persisted = true
    } catch (e) {
      // ถ้าพัง ให้บอก persisted = false แทนที่จะ throw
      console.error('[assistant.persist] error:', e)
      persisted = false
    }

    return res.json({
      reply,
      sources: [],
      meta: { route: 'rules', eval: { ok: true, signals: { lowInfo: false, hasApology: false, sourced: false } } },
      persisted
    })
  } catch (err) {
    console.error('[assistant.chatHandler] fatal:', err)
    return res.status(500).json({ error: err.message })
  }
}
