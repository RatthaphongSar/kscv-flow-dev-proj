import { prisma } from '../db.js'

/**
 * List communities (auto-generate by year & major)
 * GET /api/community
 */
export const listCommunities = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user's year and major
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { year: true, major: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get or create communities for this year/major combo
    // Year rooms: 1, 2, 3, 4
    // Major rooms: Engineering, Agriculture, etc.
    const communities = []

    // Year-based community
    if (user.year) {
      const yearCommunity = await prisma.chatRoom.upsert({
        where: {
          slug: `year-${user.year}`
        },
        update: {},
        create: {
          name: `Year ${user.year}`,
          slug: `year-${user.year}`,
          description: `Community for Year ${user.year} students`,
          isAuto: true,
          createdBy: userId
        }
      })
      communities.push({ ...yearCommunity, type: 'year' })
    }

    // Major-based community
    if (user.major) {
      const majorCommunity = await prisma.chatRoom.upsert({
        where: {
          slug: `major-${user.major.toLowerCase().replace(/\s+/g, '-')}`
        },
        update: {},
        create: {
          name: `${user.major} Program`,
          slug: `major-${user.major.toLowerCase().replace(/\s+/g, '-')}`,
          description: `Community for ${user.major} students`,
          isAuto: true,
          createdBy: userId
        }
      })
      communities.push({ ...majorCommunity, type: 'major' })
    }

    // Year + Major combo
    if (user.year && user.major) {
      const comboCommunity = await prisma.chatRoom.upsert({
        where: {
          slug: `year${user.year}-${user.major.toLowerCase().replace(/\s+/g, '-')}`
        },
        update: {},
        create: {
          name: `Year ${user.year} - ${user.major}`,
          slug: `year${user.year}-${user.major.toLowerCase().replace(/\s+/g, '-')}`,
          description: `Community for Year ${user.year} ${user.major} students`,
          isAuto: true,
          createdBy: userId
        }
      })
      communities.push({ ...comboCommunity, type: 'combo' })
    }

    res.status(200).json({ communities })
  } catch (err) {
    next(err)
  }
}
