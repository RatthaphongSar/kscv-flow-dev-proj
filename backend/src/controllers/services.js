import { prisma } from '../db.js'

/**
 * Get available services
 * @route GET /
 * @returns {Array} List of services
 */
export const getServices = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get all service requests for the current user
    const services = await prisma.serviceRequest.findMany({
      where: {
        userId
      },
      include: {
        user: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return res.json(services || [])
  } catch (err) {
    console.error('Error fetching services:', err)
    return res.status(500).json({ error: 'Failed to fetch services' })
  }
}

/**
 * Create service request
 * @route POST /
 */
export const createService = async (req, res) => {
  try {
    const { title, description, serviceType } = req.body
    const userId = req.user?.id

    if (!userId || !title || !serviceType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const service = await prisma.serviceRequest.create({
      data: {
        userId,
        title,
        description: description || '',
        status: 'pending'
      },
      include: { user: { select: { username: true } } }
    })

    return res.status(201).json(service)
  } catch (err) {
    console.error('Error creating service:', err)
    return res.status(500).json({ error: 'Failed to create service request' })
  }
}
