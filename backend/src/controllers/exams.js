import { prisma } from "../db.js"

/**
 * List exams schedule
 * @route GET /
 */
export const listExams = async (req, res, next) => {
  try {
    const { classId } = req.query

    let where = {}
    if (classId) where.classId = classId

    const exams = await prisma.exam.findMany({
      where,
      include: { class: { select: { name: true } }, grades: true },
      orderBy: { date: 'asc' }
    })

    res.json(exams)
  } catch (err) {
    next(err)
  }
}

/**
 * Create exam
 * @route POST /
 */
export const createExam = async (req, res, next) => {
  try {
    const { title, subject, date, room, duration, classId } = req.body
    if (!title || !date || !classId) {
      return res.status(400).json({ error: "title, date, classId are required" })
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        subject,
        date: new Date(date),
        room,
        duration,
        classId
      },
      include: { class: { select: { name: true } } }
    })

    res.status(201).json(exam)
  } catch (err) {
    next(err)
  }
}

/**
 * Get my exam grades
 * @route GET /my
 */
export const myExams = async (req, res, next) => {
  try {
    const grades = await prisma.grade.findMany({
      where: { studentId: req.user?.sub },
      include: { exam: { include: { class: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(grades)
  } catch (err) {
    next(err)
  }
}
