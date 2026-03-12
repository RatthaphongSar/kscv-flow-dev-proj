import { Router } from 'express'
import * as ctrl from '../controllers/export.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// All export routes require authentication
router.use(authRequired)

/**
 * Export academic transcript as PDF
 * GET /api/export/transcript/pdf
 */
router.get('/transcript/pdf', ctrl.exportTranscriptPDF)

/**
 * Export activities as CSV
 * GET /api/export/activities/csv
 */
router.get('/activities/csv', ctrl.exportActivitiesCSV)

/**
 * Export attendance as CSV
 * GET /api/export/attendance/csv
 */
router.get('/attendance/csv', ctrl.exportAttendanceCSV)
router.get('/dashboard/excel', ctrl.exportDashboardExcel)

export default router
