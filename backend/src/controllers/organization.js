import { prisma } from '../db.js'

/**
 * Organization info tree (faculty/majors/years/sections)
 * @route GET /
 * @returns {{chain: Array, leaders: Array}} Organization structure and leaders
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const orgInfo = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No user ID found' })
    }

    // Get current user to know their major and year
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { major: true, year: true, role: true }
    })

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get all teachers/admins in the same major (for support chain and leaders)
    const staff = await prisma.user.findMany({
      where: {
        major: currentUser.major,
        role: { in: ['TEACHER', 'ADMIN'] }
      },
      select: {
        id: true,
        username: true,
        role: true,
        year: true,
        major: true
      },
      take: 20
    })

    // Build student support chain (advisor -> department head -> faculty dean)
    const chain = [
      {
        level: 'Advisor',
        role: 'Academic Advisor',
        name: staff.length > 0 ? staff[0]?.username || 'Dr. Advisor' : 'Dr. Advisor',
        email: `advisor@${currentUser.major}.edu`,
        phone: '+66-1-2345-6789'
      },
      {
        level: 'Department Head',
        role: 'Head of Department',
        name: staff.length > 1 ? staff[1]?.username || 'Prof. Head' : 'Prof. Head',
        email: `head@${currentUser.major}.edu`,
        phone: '+66-1-2345-6790'
      },
      {
        level: 'Dean',
        role: 'Faculty Dean',
        name: staff.length > 2 ? staff[2]?.username || 'Dr. Dean' : 'Dr. Dean',
        email: `dean@faculty.edu`,
        phone: '+66-1-2345-6791'
      }
    ]

    // Build leaders list (all staff in the major)
    const leaders = staff.map((s, idx) => ({
      id: s.id,
      name: s.username,
      role: s.role === 'ADMIN' ? 'Administrator' : 'Faculty Member',
      type: s.role === 'ADMIN' ? 'director' : 'deputy',
      email: `${s.username}@${s.major}.edu`,
      phone: `+66-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      office: `Building ${String.fromCharCode(65 + (idx % 5))}, Room ${100 + idx}`,
      highlight: false
    }))

    return res.json({
      chain,
      leaders
    })
  } catch (err) {
    console.error('Error fetching organization info:', err)
    return res.status(500).json({ error: 'Failed to fetch organization info' })
  }
};
