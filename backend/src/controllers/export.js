import { prisma } from '../db.js'
import { stringify } from 'csv-stringify/sync'
import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'

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

export const exportDashboardExcel = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        studentId: true,
        year: true,
        major: true,
        clubMembers: {
          include: {
            club: { select: { id: true, name: true } }
          }
        },
        communities: {
          include: {
            community: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const grades = await prisma.grade.findMany({
      where: { studentId: userId },
      include: {
        exam: {
          include: { class: { select: { name: true, code: true, section: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      include: {
        class: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const gpa = grades.length > 0
      ? (grades.reduce((sum, g) => sum + (g.score * (g.maxScore || 100) / 100), 0) / grades.length).toFixed(2)
      : '0.00'

    const presentCount = attendances.filter((a) => a.status === 'present').length
    const attendancePercent = attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0

    const activityCount = (user.clubMembers?.length || 0) + (user.communities?.length || 0)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'KVC Connect'
    workbook.created = new Date()

    const summarySheet = workbook.addWorksheet('Summary')
    summarySheet.addRow(['Dashboard Report'])
    summarySheet.addRow(['Generated At', new Date().toLocaleString('th-TH')])
    summarySheet.addRow([])
    summarySheet.addRow(['Student Name', user.fullname || user.username || ''])
    summarySheet.addRow(['Student ID', user.studentId || ''])
    summarySheet.addRow(['Year', user.year || ''])
    summarySheet.addRow(['Major', user.major || ''])
    summarySheet.addRow([])
    summarySheet.addRow(['Attendance %', attendancePercent])
    summarySheet.addRow(['GPA', gpa])
    summarySheet.addRow(['Activities Joined', activityCount])
    summarySheet.addRow(['Total Grades', grades.length])

    const gradesSheet = workbook.addWorksheet('Grades')
    gradesSheet.addRow(['Exam', 'Class', 'Score', 'Max Score', 'Grade', 'Date'])
    grades.forEach((g) => {
      const classLabel = g.exam?.class
        ? `${g.exam.class.code || ''} ${g.exam.class.name || ''}`.trim()
        : ''
      gradesSheet.addRow([
        g.exam?.title || g.exam?.name || 'Exam',
        classLabel,
        g.score ?? '',
        g.maxScore ?? '',
        g.grade ?? '',
        g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ''
      ])
    })

    const attendanceSheet = workbook.addWorksheet('Attendance')
    attendanceSheet.addRow(['Class Code', 'Class Name', 'Date', 'Time', 'Status', 'Remarks'])
    attendances.forEach((att) => {
      attendanceSheet.addRow([
        att.class?.code || '',
        att.class?.name || '',
        att.createdAt ? new Date(att.createdAt).toLocaleDateString() : '',
        att.createdAt ? new Date(att.createdAt).toLocaleTimeString() : '',
        att.status || '',
        att.remarks || ''
      ])
    })

    const activitiesSheet = workbook.addWorksheet('Activities')
    activitiesSheet.addRow(['Type', 'Name', 'Joined Date', 'Status'])
    if (user.clubMembers?.length) {
      user.clubMembers.forEach((cm) => {
        activitiesSheet.addRow([
          'Club',
          cm.club?.name || '',
          cm.joinedAt ? new Date(cm.joinedAt).toLocaleDateString() : '',
          cm.status || 'Active'
        ])
      })
    }
    if (user.communities?.length) {
      user.communities.forEach((com) => {
        activitiesSheet.addRow([
          'Community',
          com.community?.name || '',
          com.joinedAt ? new Date(com.joinedAt).toLocaleDateString() : '',
          com.status || 'Active'
        ])
      })
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-${user.studentId || user.username}.xlsx"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Error exporting dashboard excel:', error)
    res.status(500).json({ error: 'Failed to export dashboard excel' })
  }
}
