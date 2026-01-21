import { prisma } from "../db.js"

/**
 * Submit leave request (sick/personal/ordination/other) with rules
 * @route POST /
 */
export const requestLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: "type, startDate, endDate are required" })
    }

    const leave = await prisma.leave.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        studentId: req.user?.sub,
        status: 'pending'
      },
      include: { student: { select: { username: true } } }
    })

    res.status(201).json(leave)
  } catch (err) {
    next(err)
  }
}

/**
 * List my leave requests
 * @route GET /my
 */
export const myLeaves = async (req, res, next) => {
  try {
    const { status } = req.query

    let where = { studentId: req.user?.sub }
    if (status) where.status = status

    const leaves = await prisma.leave.findMany({
      where,
      include: { advisor: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(leaves)
  } catch (err) {
    next(err)
  }
}

/**
 * Attach doctor certificate when sick leave > 2 days
 * @route POST /:id/attach-doctor-cert
 */
export const attachDoctorCert = async (req, res, next) => {
  try {
    const { id } = req.params
    const { docUrl } = req.body

    if (!docUrl) return res.status(400).json({ error: "docUrl is required" })

    const leave = await prisma.leave.update({
      where: { id },
      data: { docUrl }
    })

    res.json(leave)
  } catch (err) {
    next(err)
  }
}

/**
 * Advisor/Admin approve/reject
 * @route PATCH /:id/status
 */
export const approveOrReject = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" })
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        advisorId: req.user?.sub,
        updatedAt: new Date()
      },
      include: { student: { select: { username: true } }, advisor: { select: { id: true } } }
    })

    res.json(leave)
  } catch (err) {
    next(err)
  }
}
