import { prisma } from "../db.js"

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
    const advisors = await prisma.advisor.findMany({
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { user: { username: 'asc' } }
    })

    res.json(advisors)
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
