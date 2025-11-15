import { prisma } from "../db.js"

/**
 * Clubs & Activities list
 * @route GET /
 */
export const listClubs = async (req, res, next) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        members: { select: { id: true, userId: true, role: true } },
        activities: { orderBy: { date: 'desc' }, take: 5 }
      },
      orderBy: { name: 'asc' }
    })

    res.json(clubs)
  } catch (err) {
    next(err)
  }
}

/**
 * Enroll to a club
 * @route POST /enroll
 */
export const enrollClub = async (req, res, next) => {
  try {
    const { clubId, role } = req.body
    if (!clubId) return res.status(400).json({ error: "clubId is required" })

    const member = await prisma.clubMember.create({
      data: {
        clubId,
        userId: req.user?.sub,
        role: role || 'member'
      },
      include: { club: { select: { name: true } }, user: { select: { username: true } } }
    })

    res.status(201).json(member)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Already a member of this club" })
    }
    next(err)
  }
}

/**
 * My clubs
 * @route GET /my
 */
export const myClubs = async (req, res, next) => {
  try {
    const clubs = await prisma.clubMember.findMany({
      where: { userId: req.user?.sub },
      include: { club: { include: { activities: { take: 3 } } } },
      orderBy: { club: { name: 'asc' } }
    })

    res.json(clubs)
  } catch (err) {
    next(err)
  }
}
