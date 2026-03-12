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

    const communities = []

    // Helper: find-or-create community and auto-join user
    async function ensureCommunity(name, description) {
      let community = await prisma.community.findUnique({ where: { name } })
      if (!community) {
        community = await prisma.community.create({
          data: { name, description }
        })
      }
      // Auto-join user if not already a member
      const existing = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: community.id, userId } }
      })
      if (!existing) {
        await prisma.communityMember.create({
          data: { communityId: community.id, userId, role: 'member' }
        })
      }
      return community
    }

    // Year-based community
    if (user.year) {
      const c = await ensureCommunity(
        `Year ${user.year}`,
        `Community for Year ${user.year} students`
      )
      communities.push({ ...c, type: 'year' })
    }

    // Major-based community
    if (user.major) {
      const c = await ensureCommunity(
        `${user.major} Program`,
        `Community for ${user.major} students`
      )
      communities.push({ ...c, type: 'major' })
    }

    // Year + Major combo
    if (user.year && user.major) {
      const c = await ensureCommunity(
        `Year ${user.year} - ${user.major}`,
        `Community for Year ${user.year} ${user.major} students`
      )
      communities.push({ ...c, type: 'combo' })
    }

    res.status(200).json({ communities })
  } catch (err) {
    next(err)
  }
}
