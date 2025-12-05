import { prisma } from '../db.js'

/**
 * Get all announcements (for current user's classes)
 * @route GET /
 * @returns {Array} List of announcements
 */
export const getAnnouncements = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get all classes the user is enrolled in or teaching
    const userClasses = await prisma.class.findMany({
      where: {
        OR: [
          { teacherId: userId },
          { students: { some: { studentId: userId } } }
        ]
      },
      select: { id: true }
    })

    const classIds = userClasses.map(c => c.id)

    // Get announcements for these classes
    const announcements = await prisma.announcementPin.findMany({
      where: {
        classId: { in: classIds }
      },
      include: {
        class: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return res.json(announcements || [])
  } catch (err) {
    console.error('Error fetching announcements:', err)
    return res.status(500).json({ error: 'Failed to fetch announcements' })
  }
}

/**
 * Create announcement (teacher only)
 * @route POST /
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { classId, title, description } = req.body
    const userId = req.user?.id

    if (!userId || !classId || !title) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify user is the class teacher
    const classRecord = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classRecord || classRecord.teacherId !== userId) {
      return res.status(403).json({ error: 'Not authorized to create announcements for this class' })
    }

    const announcement = await prisma.announcementPin.create({
      data: {
        classId,
        title,
        content: description || '',
        pinned: true
      },
      include: { class: { select: { name: true } } }
    })

    return res.status(201).json(announcement)
  } catch (err) {
    console.error('Error creating announcement:', err)
    return res.status(500).json({ error: 'Failed to create announcement' })
  }
}
