import { prisma } from "../db.js"

// Standard grade-point mapping
const GRADE_POINTS = { 'A': 4, 'B+': 3.5, 'B': 3, 'C+': 2.5, 'C': 2, 'D+': 1.5, 'D': 1, 'F': 0 }

function scoreToGrade(score, maxScore) {
  const pct = (score / (maxScore || 100)) * 100
  if (pct >= 80) return 'A'
  if (pct >= 75) return 'B+'
  if (pct >= 70) return 'B'
  if (pct >= 65) return 'C+'
  if (pct >= 60) return 'C'
  if (pct >= 55) return 'D+'
  if (pct >= 50) return 'D'
  return 'F'
}

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
          include: { class: { select: { name: true, code: true, section: true, credits: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate GPA using proper grade-point system
    let totalPoints = 0
    let totalCredits = 0
    const enrichedGrades = grades.map(g => {
      const letterGrade = g.grade || scoreToGrade(g.score, g.maxScore)
      const gradePoint = GRADE_POINTS[letterGrade] ?? 0
      const credits = g.exam?.class?.credits || 3
      totalPoints += gradePoint * credits
      totalCredits += credits
      return {
        ...g,
        grade: letterGrade,
        percentage: ((g.score / (g.maxScore || 100)) * 100).toFixed(2),
        code: g.exam?.class?.code,
        name: g.exam?.class?.name,
        credit: credits,
      }
    })

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0

    res.json({ grades: enrichedGrades, gpa: parseFloat(gpa.toFixed(2)), total: grades.length, totalCredits })
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
