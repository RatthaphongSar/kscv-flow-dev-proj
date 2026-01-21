import { prisma } from '../db.js'

/**
 * Register for a course or service
 * POST /api/register
 */
export const registerCourse = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { classId, serviceId, reason } = req.body

    // Validate input
    if (!classId && !serviceId) {
      return res.status(400).json({ error: 'Either classId or serviceId is required' })
    }

    // If registering for a class
    if (classId) {
      // Check if student is already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_classId: {
            studentId: userId,
            classId
          }
        }
      })

      if (existingEnrollment) {
        return res.status(400).json({ error: 'Already enrolled in this class' })
      }

      // Check if class exists
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: { teacher: true }
      })

      if (!classData) {
        return res.status(404).json({ error: 'Class not found' })
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: userId,
          classId,
          enrolledAt: new Date(),
          status: 'active'
        },
        include: {
          class: {
            include: { teacher: true }
          },
          student: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      return res.status(201).json({
        message: 'Successfully registered for class',
        enrollment
      })
    }

    // If registering for a service
    if (serviceId) {
      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      })

      if (!service) {
        return res.status(404).json({ error: 'Service not found' })
      }

      // Check if already registered
      const existingRequest = await prisma.serviceRequest.findFirst({
        where: {
          studentId: userId,
          serviceId,
          status: { in: ['pending', 'approved'] }
        }
      })

      if (existingRequest) {
        return res.status(400).json({ error: 'Already registered for this service' })
      }

      // Create service request
      const serviceRequest = await prisma.serviceRequest.create({
        data: {
          studentId: userId,
          serviceId,
          reason: reason || '',
          status: 'pending',
          requestedAt: new Date()
        },
        include: {
          service: true,
          student: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      return res.status(201).json({
        message: 'Service request submitted successfully',
        serviceRequest
      })
    }
  } catch (err) {
    next(err)
  }
}

/**
 * Get user registrations
 * GET /api/register
 */
export const getRegistrations = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        class: {
          include: { teacher: true }
        }
      }
    })

    // Get service requests
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: { studentId: userId },
      include: { service: true }
    })

    res.status(200).json({
      enrollments,
      serviceRequests
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Approve or reject a registration (admin/teacher only)
 * PATCH /api/register/:id
 */
export const updateRegistration = async (req, res, next) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role

    // Only admins can update registrations
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id } = req.params
    const { status, reason } = req.body

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Check if service request exists
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id }
    })

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' })
    }

    // Update service request
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes: reason || ''
      },
      include: {
        service: true,
        student: true
      }
    })

    res.status(200).json({
      message: 'Registration updated successfully',
      serviceRequest: updated
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Register Services request ticket
 * @route POST /services
 * @returns {{}} 501 Not Implemented (Legacy - use registerCourse instead)
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const requestService = async (req, res) => {
  return res.status(501).json({ error: 'Not Implemented', endpoint: 'POST /services' });
};
