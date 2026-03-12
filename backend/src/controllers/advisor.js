import { prisma } from "../db.js"
import { parsePagination, buildOrderBy } from '../utils/query.js'

/**
 * Advisor contact info
 * @route GET /contact
 */
export const advisorContact = async (req, res, next) => {
  try {
    // Find advisor for student's class
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { classId: true }
    })

    if (!user?.classId) {
      return res.json(null)
    }

    // Get an advisor (simplified - you may need a proper advisor assignment)
    const advisor = await prisma.advisor.findFirst({
      include: { user: { select: { id: true, username: true, email: true, role: true } } }
    })

    res.json(advisor)
  } catch (err) {
    next(err)
  }
}

/**
 * List all advisors
 * @route GET /
 */
export const listAdvisors = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query, { defaultPageSize: 20, maxPageSize: 100 })
    const orderBy = buildOrderBy(req.query, ['email', 'createdAt'], 'createdAt', 'desc')
    const q = String(req.query.q || '').trim()
    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { user: { username: { contains: q, mode: 'insensitive' } } },
            { user: { fullname: { contains: q, mode: 'insensitive' } } }
          ]
        }
      : {}

    const [total, advisors] = await prisma.$transaction([
      prisma.advisor.count({ where }),
      prisma.advisor.findMany({
        where,
        include: { user: { select: { id: true, username: true, fullname: true, email: true } } },
        orderBy,
        skip: pagination.skip,
        take: pagination.take
      })
    ])

    res.json({ data: advisors, pagination: { ...pagination, total } })
  } catch (err) {
    next(err)
  }
}

/**
 * Get advisor by ID
 * @route GET /:id
 */
export const getAdvisor = async (req, res, next) => {
  try {
    const { id } = req.params

    const advisor = await prisma.advisor.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, email: true, phone: true } } }
    })

    if (!advisor) return res.status(404).json({ error: "Advisor not found" })

    res.json(advisor)
  } catch (err) {
    next(err)
  }
}
