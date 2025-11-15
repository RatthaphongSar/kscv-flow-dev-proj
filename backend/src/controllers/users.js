// backend/src/controllers/users.js
import { prisma } from '../db.js'
import bcrypt from 'bcryptjs'

/**
 * Admin creates account
 * @route POST /
 * body: { username, password, role, year?, major? }
 */
export const createUser = async (req, res, next) => {
  try {
    const current = req.user
    if (!current || current.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can create users' })
    }

    const { username, password, role, year, major } = req.body

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ error: 'username, password and role are required' })
    }

    const hash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hash,
        role: role.toUpperCase(), // STUDENT / TEACHER / ADMIN
        year: year ?? null,
        major: major ?? null,
      },
      select: {
        id: true,
        username: true,
        role: true,
        year: true,
        major: true,
      },
    })

    return res.status(201).json(user)
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Username already exists' })
    }
    console.error('createUser error:', err)
    return next(err)
  }
}

/**
 * GET /me
 * คืนข้อมูล user จาก JWT
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        username: true,
        role: true,
        year: true,
        major: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json(user)
  } catch (err) {
    console.error('getMe error:', err)
    return next(err)
  }
}

/**
 * PATCH /me
 * อัปเดต profile ตัวเอง (เช่น displayName / year / major)
 */
export const updateMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { displayName, year, major } = req.body
    const data = {}

    if (typeof displayName === 'string') data.displayName = displayName
    if (typeof year !== 'undefined') data.year = year
    if (typeof major === 'string') data.major = major

    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        year: true,
        major: true,
      },
    })

    return res.json(updated)
  } catch (err) {
    console.error('updateMe error:', err)
    return next(err)
  }
}

/**
 * GET /
 * list users (ใช้สำหรับหน้าครูเลือกนักเรียนเข้า room)
 * query: role?, year?, major?
 */
export const listUsers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { role, year, major } = req.query
    const where = {}

    if (role) where.role = String(role).toUpperCase()
    if (year) where.year = Number(year)
    if (major) where.major = String(major)

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        year: true,
        major: true,
      },
      orderBy: { username: 'asc' },
    })

    return res.json(users)
  } catch (err) {
    console.error('listUsers error:', err)
    return next(err)
  }
}
