import { prisma } from "../db.js"

/**
 * Get Grades & Transcript for student
 * @route GET /transcript
 */
export const getTranscript = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const grades = await prisma.grade.findMany({
      where: { studentId: userId },
      include: {
        exam: {
          include: { class: { select: { name: true, code: true, section: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const gpa = grades.length > 0
      ? (grades.reduce((sum, g) => sum + (g.score * (g.maxScore || 100) / 100), 0) / grades.length).toFixed(2)
      : 0

    res.json({ grades, gpa, total: grades.length })
  } catch (err) {
    next(err)
  }
}

/**
 * Create or update grade (teacher)
 * @route POST /
 */
export const createGrade = async (req, res, next) => {
  try {
    const { examId, studentId, score, maxScore, grade } = req.body
    if (!examId || !studentId || score === undefined) {
      return res.status(400).json({ error: "examId, studentId, score are required" })
    }

    const percentage = ((score / (maxScore || 100)) * 100).toFixed(2)

    const gradeRecord = await prisma.grade.upsert({
      where: { examId_studentId: { examId, studentId } },
      update: { score, maxScore, percentage: parseFloat(percentage), grade },
      create: { examId, studentId, score, maxScore, percentage: parseFloat(percentage), grade },
      include: { student: { select: { username: true } }, exam: { select: { title: true } } }
    })

    res.json(gradeRecord)
  } catch (err) {
    next(err)
  }
}
