import { prisma } from '../db.js'

/**
 * List all classes (or filter by teacher/student)
 * GET /api/classes
 */
export const listClasses = async (req, res, next) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role

    let where = {}

    // If student: only show enrolled classes
    // If teacher: only show taught classes
    if (userRole === 'student' || userRole === 'STUDENT') {
      where = {
        enrollments: {
          some: {
            studentId: userId
          }
        }
      }
    } else if (userRole === 'teacher' || userRole === 'TEACHER') {
      where = {
        teacherId: userId
      }
    }

    const classes = await prisma.class.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        section: true,
        major: true,
        year: true,
        schedule: true,
        location: true,
        teacher: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: [{ major: 'asc' }, { code: 'asc' }, { section: 'asc' }]
    })

    res.status(200).json({ classes })
  } catch (err) {
    next(err)
  }
}
