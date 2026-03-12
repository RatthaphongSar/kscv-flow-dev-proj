// backend/src/controllers/users.js
import { prisma } from '../db.js'
import { parsePagination, buildOrderBy, buildSearch } from '../utils/query.js'
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
      where: { id: req.user.id },
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
 * GET /profile
 * Get full profile with advisor info (for students)
 */
export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        year: true,
        major: true,
        studentId: true,
        address: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // If student, get advisor info
    let advisor = null
    if (user.role === 'STUDENT') {
      const advisorData = await prisma.advisor.findFirst({
        where: {
          // Get advisor for this student
          // Assuming there's a relationship or we fetch by year/major
        },
        select: {
          id: true,
          email: true,
          phone: true,
          office: true,
          bio: true,
          user: {
            select: {
              username: true,
              fullname: true,
            },
          },
        },
      })
      if (advisorData) {
        advisor = {
          ...advisorData,
          fullname: advisorData.user?.fullname,
        }
      }
    }

    return res.json({ user, advisor })
  } catch (err) {
    console.error('getProfile error:', err)
    return next(err)
  }
}

/**
 * PATCH /profile
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { fullname, phone, address } = req.body
    const data = {}

    if (typeof fullname === 'string') data.fullname = fullname
    if (typeof phone === 'string') data.phone = phone
    if (typeof address === 'string') data.address = address

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        year: true,
        major: true,
        studentId: true,
        address: true,
        avatar: true,
      },
    })

    return res.json(updated)
  } catch (err) {
    console.error('updateProfile error:', err)
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
      where: { id: req.user.id },
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
    if (!['TEACHER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { role, year, major } = req.query
    const where = {}

    if (role) where.role = String(role).toUpperCase()
    if (year) where.year = Number(year)
    if (major) where.major = String(major)

    const search = buildSearch(req.query, ['username', 'fullname', 'email'])
    if (search) where.OR = search.OR

    const pagination = parsePagination(req.query, { defaultPageSize: 30, maxPageSize: 100 })
    const orderBy = buildOrderBy(req.query, ['username', 'role', 'year', 'major', 'createdAt'], 'username', 'asc')

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          role: true,
          year: true,
          major: true,
        },
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      })
    ])

    return res.json({
      data: users.map((u) => ({
        ...u,
        displayName: u.fullname || u.username
      })),
      pagination: { ...pagination, total }
    })
  } catch (err) {
    console.error('listUsers error:', err)
    return next(err)
  }
}
