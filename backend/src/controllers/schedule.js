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
    const userId = req.user?.id
    if (!userId) return res.json([])

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    let classIds = []

    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      // Teachers: get classes they teach
      const classes = await prisma.class.findMany({
        where: { teacherId: userId },
        select: { id: true }
      })
      classIds = classes.map(c => c.id)
    } else {
      // Students: get classes they are enrolled in
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId, status: 'active' },
        select: { classId: true }
      })
      classIds = enrollments.map(e => e.classId)
    }

    if (classIds.length === 0) {
      return res.json([])
    }

    const schedules = await prisma.schedule.findMany({
      where: { classId: { in: classIds } },
      include: { class: { select: { name: true, code: true, section: true, teacherId: true, teacher: { select: { fullname: true, username: true } } } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    })

    res.json(schedules)
  } catch (err) {
    next(err)
  }
}
