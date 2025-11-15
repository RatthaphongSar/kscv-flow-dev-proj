import { prisma } from "../db.js"

/**
 * List assignments
 * @route GET /
 */
export const listAssignments = async (req, res, next) => {
  try {
    const { classId } = req.query
    if (!classId) return res.status(400).json({ error: "classId is required" })

    const assignments = await prisma.assignment.findMany({
      where: { classId },
      include: {
        teacher: { select: { id: true, username: true } },
        submissions: true
      },
      orderBy: { dueDate: 'asc' }
    })

    res.json(assignments)
  } catch (err) {
    next(err)
  }
}

/**
 * Create new assignment (teacher)
 * @route POST /
 */
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, classId } = req.body
    if (!title || !dueDate || !classId) {
      return res.status(400).json({ error: "title, dueDate, classId are required" })
    }

    const assignment = await prisma.assignment.create({
      data: { 
        title, 
        description, 
        dueDate: new Date(dueDate), 
        classId, 
        teacherId: req.user?.sub || req.body.teacherId
      },
      include: { teacher: { select: { id: true, username: true } } }
    })

    res.status(201).json(assignment)
  } catch (err) {
    next(err)
  }
}

/**
 * Submit assignment (file/link)
 * @route POST /:id/submit
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const { id: assignmentId } = req.params
    const { submissionUrl, submissionText, studentId } = req.body

    if (!assignmentId) return res.status(400).json({ error: "assignmentId is required" })

    const submission = await prisma.assignmentSubmission.upsert({
      where: { 
        assignmentId_studentId: { 
          assignmentId, 
          studentId: studentId || req.user?.sub 
        } 
      },
      update: { submissionUrl, submissionText, submittedAt: new Date() },
      create: { 
        assignmentId, 
        studentId: studentId || req.user?.sub, 
        submissionUrl, 
        submissionText
      },
      include: { student: { select: { username: true } } }
    })

    res.status(201).json(submission)
  } catch (err) {
    next(err)
  }
}
