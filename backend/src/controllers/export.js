import { prisma } from '../db.js'
import { stringify } from 'csv-stringify/sync'
import PDFDocument from 'pdfkit'

/**
 * Export academic transcript as PDF
 * GET /api/export/transcript/pdf
 */
export const exportTranscriptPDF = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Fetch user and grades
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        studentId: true,
        year: true,
        major: true,
        gradeRecords: {
          include: {
            assignment: {
              select: { id: true, title: true }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Create PDF
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${user.studentId || user.username}.pdf"`)

    doc.pipe(res)

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Academic Transcript', { align: 'center' })
    doc.fontSize(10).font('Helvetica').text('Kalasin Vocational College', { align: 'center' })
    doc.moveDown()

    // User Info
    doc.fontSize(11).font('Helvetica-Bold').text('Student Information', { underline: true })
    doc.fontSize(10).font('Helvetica')
    doc.text(`Name: ${user.fullname || 'N/A'}`)
    doc.text(`Student ID: ${user.studentId || 'N/A'}`)
    doc.text(`Year: ${user.year}`)
    doc.text(`Major: ${user.major}`)
    doc.moveDown()

    // Grades Table
    doc.fontSize(11).font('Helvetica-Bold').text('Grade Records', { underline: true })
    doc.moveDown(0.3)

    if (user.gradeRecords && user.gradeRecords.length > 0) {
      // Table header
      const tableTop = doc.y
      const col1 = 50
      const col2 = 200
      const col3 = 350
      const col4 = 480

      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Assignment', col1, tableTop)
      doc.text('Score', col2, tableTop)
      doc.text('Grade', col3, tableTop)
      doc.text('Date', col4, tableTop)

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()

      // Table rows
      doc.fontSize(9).font('Helvetica')
      let y = tableTop + 25

      user.gradeRecords.forEach((grade) => {
        doc.text(grade.assignment?.title || 'Unknown', col1, y)
        doc.text(String(grade.score || 'N/A'), col2, y)
        doc.text(grade.grade || 'N/A', col3, y)
        doc.text(new Date(grade.createdAt).toLocaleDateString(), col4, y)
        y += 20
      })
    } else {
      doc.text('No grade records found')
    }

    // Footer
    doc.moveDown(2)
    doc.fontSize(9).font('Helvetica').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Error exporting transcript PDF:', error)
    res.status(500).json({ error: 'Failed to export transcript' })
  }
}

/**
 * Export activities as CSV
 * GET /api/export/activities/csv
 */
export const exportActivitiesCSV = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Fetch user activities
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        fullname: true,
        clubMembers: {
          include: {
            club: {
              select: { id: true, name: true }
            }
          }
        },
        communities: {
          include: {
            community: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prepare CSV data
    const csvRecords = []

    // Add club memberships
    if (user.clubMembers && user.clubMembers.length > 0) {
      user.clubMembers.forEach((cm) => {
        csvRecords.push({
          type: 'Club Member',
          name: cm.club?.name || 'Unknown',
          joinedDate: new Date(cm.joinedAt).toLocaleDateString(),
          status: cm.status || 'Active'
        })
      })
    }

    // Add community memberships
    if (user.communities && user.communities.length > 0) {
      user.communities.forEach((com) => {
        csvRecords.push({
          type: 'Community Member',
          name: com.community?.name || 'Unknown',
          joinedDate: new Date(com.joinedAt).toLocaleDateString(),
          status: com.status || 'Active'
        })
      })
    }

    // Generate CSV with headers
    const headers = ['Activity Type', 'Name', 'Joined Date', 'Status']
    const csvRows = [headers]
    
    csvRecords.forEach((record) => {
      csvRows.push([record.type, record.name, record.joinedDate, record.status])
    })

    const csv = stringify(csvRows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="activities-${user.username}.csv"`)
    res.send(csv)
  } catch (error) {
    console.error('Error exporting activities CSV:', error)
    res.status(500).json({ error: 'Failed to export activities' })
  }
}

/**
 * Export attendance as CSV
 * GET /api/export/attendance/csv
 */
export const exportAttendanceCSV = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Fetch user attendance records
    const attendances = await prisma.attendance.findMany({
      where: { userId },
      include: {
        class: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Prepare CSV data
    const csvRecords = attendances.map((att) => ({
      classCode: att.class?.code || 'Unknown',
      className: att.class?.name || 'Unknown',
      date: new Date(att.createdAt).toLocaleDateString(),
      time: new Date(att.createdAt).toLocaleTimeString(),
      status: att.status || 'Present',
      remarks: att.remarks || 'N/A'
    }))

    // Generate CSV with headers
    const headers = ['Class Code', 'Class Name', 'Date', 'Time', 'Status', 'Remarks']
    const csvRows = [headers]
    
    csvRecords.forEach((record) => {
      csvRows.push([
        record.classCode,
        record.className,
        record.date,
        record.time,
        record.status,
        record.remarks
      ])
    })

    const csv = stringify(csvRows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${req.user.username}.csv"`)
    res.send(csv)
  } catch (error) {
    console.error('Error exporting attendance CSV:', error)
    res.status(500).json({ error: 'Failed to export attendance' })
  }
}
