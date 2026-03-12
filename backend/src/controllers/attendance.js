import { prisma } from "../db.js"

/**
 * Check-in (checkline) for attendance
 * @route POST /checkin
 */
export const checkIn = async (req, res, next) => {
  try {
    const { classId, date, status, remark } = req.body
    if (!classId || !date || !status) {
      return res.status(400).json({ error: "classId, date, status are required" })
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: req.user?.id,
          classId,
          date: new Date(date)
        }
      },
      update: { status, remark },
      create: {
        studentId: req.user?.id,
        classId,
        date: new Date(date),
        status,
        remark
      },
      include: { student: { select: { username: true } }, class: { select: { name: true } } }
    })

    res.json(attendance)
  } catch (err) {
    next(err)
  }
}

/**
 * My attendance records
 * @route GET /my
 */
export const myAttendance = async (req, res, next) => {
  try {
    const { classId, month } = req.query

    let where = { studentId: req.user?.id }
    if (classId) where.classId = classId
    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(`${year}-${monthNum}-01`)
      const endDate = new Date(year, monthNum, 0)
      where.date = { gte: startDate, lte: endDate }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: { class: { select: { name: true } } },
      orderBy: { date: 'desc' }
    })

    res.json(attendance)
  } catch (err) {
    next(err)
  }
}

/**
 * List attendance by class (teacher)
 * @route GET /class/:classId
 */
export const listAttendanceByClass = async (req, res, next) => {
  try {
    const { classId } = req.params
    const { date } = req.query

    let where = { classId }
    if (date) where.date = new Date(date)

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, username: true, year: true, major: true } }
      },
      orderBy: { student: { username: 'asc' } }
    })

    res.json(attendance)
  } catch (err) {
    next(err)
  }
}

/**
 * Get attendance summary
 * @route GET /summary/:classId
 */
export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { classId } = req.params
    const { startDate, endDate } = req.query

    let where = { classId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const attendance = await prisma.attendance.findMany({
      where,
      select: { status: true }
    })

    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      percentage: attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        : 0
    }

    res.json(summary)
  } catch (err) {
    next(err)
  }
}
