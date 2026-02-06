import { prisma } from "../db.js"

/**
 * Get weekly/daily schedule
 * @route GET /
 */
export const getSchedule = async (req, res, next) => {
  try {
    const { classId, dayOfWeek } = req.query

    let where = {}
    if (classId) where.classId = classId
    if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek)

    const schedules = await prisma.schedule.findMany({
      where,
      include: { class: { select: { name: true, code: true, section: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    })

    res.json(schedules)
  } catch (err) {
    next(err)
  }
}

/**
 * Create schedule (admin/teacher)
 * @route POST /
 */
export const createSchedule = async (req, res, next) => {
  try {
    const { classId, dayOfWeek, startTime, endTime, room } = req.body
    if (!classId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: "classId, dayOfWeek, startTime, endTime are required" })
    }

    const schedule = await prisma.schedule.create({
      data: { classId, dayOfWeek, startTime, endTime, room },
      include: { class: { select: { name: true } } }
    })

    res.status(201).json(schedule)
  } catch (err) {
    next(err)
  }
}

/**
 * My class schedule
 * @route GET /my
 */
export const mySchedule = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { classId: true }
    })

    if (!user?.classId) {
      return res.json([])
    }

    const schedules = await prisma.schedule.findMany({
      where: { classId: user.classId },
      include: { class: { select: { name: true, code: true, section: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    })

    res.json(schedules)
  } catch (err) {
    next(err)
  }
}
