import { prisma } from '../db.js'
import { parsePagination, buildOrderBy, buildSearch } from '../utils/query.js'

/**
 * GET /announcements
 * Get announcements - can filter by classId
 */
async function getAnnouncements(req, res) {
  try {
    const { classId } = req.query
    const userId = req.user?.id

    // Build where clause
    let where = {}

    if (classId) {
      where.classId = classId
    }

    // If student, only show announcements from their classes
    if (req.user?.role?.toLowerCase() === 'student') {
      // Get student's enrolled classes
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        select: { classId: true },
      })
      const classIds = enrollments.map((e) => e.classId)
      if (classIds.length === 0) {
        return res.json({ data: [], pagination: { skip: 0, take: 0, page: 1, pageSize: 0, total: 0 } })
      }
      if (classId) {
        where.classId = classIds.includes(classId) ? classId : '__none__'
      } else {
        where.classId = { in: classIds }
      }
    }

    const search = buildSearch(req.query, ['title', 'content', 'excerpt'])
    if (search) where.OR = search.OR

    // Get total count
    const total = await prisma.announcement.count({ where })
    const pagination = parsePagination(req.query, { defaultPageSize: 20, maxPageSize: 100 })
    const orderBy = buildOrderBy(req.query, ['createdAt', 'title', 'category'], 'createdAt', 'desc')

    // Get announcements with pagination
    const announcements = await prisma.announcement.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        category: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
            role: true,
          },
        },
        class: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy,
      skip: pagination.skip,
      take: pagination.take,
    })

    return res.json({
      data: announcements,
      pagination: { ...pagination, total },
    })
  } catch (err) {
    console.error('getAnnouncements error:', err)
    return res.status(500).json({ error: 'Failed to fetch announcements' })
  }
}

/**
 * POST /announcements
 * Create announcement - teacher/admin only
 */
async function createAnnouncement(req, res) {
  try {
    // Check authorization
    if (!['teacher', 'admin'].includes(req.user?.role?.toLowerCase())) {
      return res.status(403).json({ error: 'Only teachers can create announcements' })
    }

    const { title, content, excerpt, category, image, classId } = req.body
    const userId = req.user?.id

    // Validation
    if (!title || !content || !classId) {
      return res.status(400).json({ error: 'Title, content, and classId are required' })
    }

    // Check if teacher owns the class
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    })

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' })
    }

    if (classData.teacherId !== userId && req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'You can only announce in your own classes' })
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150),
        category: category || 'ประกาศ',
        image,
        authorId: userId,
        classId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        category: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        class: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    })

    return res.status(201).json({
      message: 'Announcement created successfully',
      data: announcement,
    })
  } catch (err) {
    console.error('createAnnouncement error:', err)
    return res.status(500).json({ error: 'Failed to create announcement' })
  }
}

/**
 * PATCH /announcements/:id
 * Update announcement - author/admin only
 */
async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params
    const { title, content, excerpt, category, image } = req.body
    const userId = req.user?.id

    // Get announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' })
    }

    // Check authorization
    if (announcement.authorId !== userId && req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'You can only update your own announcements' })
    }

    // Update announcement
    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(category && { category }),
        ...(image !== undefined && { image }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        category: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
      },
    })

    return res.json({
      message: 'Announcement updated successfully',
      data: updated,
    })
  } catch (err) {
    console.error('updateAnnouncement error:', err)
    return res.status(500).json({ error: 'Failed to update announcement' })
  }
}

/**
 * DELETE /announcements/:id
 * Delete announcement - author/admin only
 */
async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Get announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' })
    }

    // Check authorization
    if (announcement.authorId !== userId && req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own announcements' })
    }

    // Delete announcement
    await prisma.announcement.delete({ where: { id } })

    return res.json({
      message: 'Announcement deleted successfully',
    })
  } catch (err) {
    console.error('deleteAnnouncement error:', err)
    return res.status(500).json({ error: 'Failed to delete announcement' })
  }
}

export {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
}
