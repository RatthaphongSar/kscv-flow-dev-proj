// backend/src/routes/index.js
import { Router } from 'express'

// === รวม route ย่อยทั้งหมดของระบบ ===
// (มีอะไรอยู่แล้วคงไว้ได้ตามเดิม เพิ่ม chatRoutes เข้าไป)
import advisorRoutes from './advisor.js'
import announcementsRoutes from './announcements.js'
import assignmentsRoutes from './assignments.js'
import attendanceRoutes from './attendance.js'
import authRoutes from './auth.js'
import classRoutes from './class.routes.js'
import classEnrollmentRoutes from './classEnrollment.routes.js'
import assignmentExtendedRoutes from './assignmentExtended.routes.js'
import teachingMaterialRoutes from './teachingMaterial.routes.js'
import submissionRoutes from './submission.routes.js'
import clubsRoutes from './clubs.js'
import communityRoutes from './community.js'
import examsRoutes from './exams.js'
import gradesRoutes from './grades.js'
import leavesRoutes from './leaves.js'
import meetingsRoutes from './meetings.js'
import videoConferencingRoutes from './videoConferencing.js'
import organizationRoutes from './organization.js'
import registerRoutes from './register.js'
import resourcesRoutes from './resources.js'
import scheduleRoutes from './schedule.js'
import servicesRoutes from './services.js'
import settingsRoutes from './settings.js'
import usersRoutes from './users.js'
import exportRoutes from './export.js'

// 🔵 สำคัญ: มี endpoint /rooms, /rooms/auto, /rooms/:id/messages
import chatRoutes from './chat.js'   // <-- เพิ่มอันนี้

const router = Router()

// mount ตาม base path ที่ต้องการ
router.use('/advisor', advisorRoutes)
router.use('/announcements', announcementsRoutes)
router.use('/assignments', assignmentsRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/auth', authRoutes)
router.use('/classes', classRoutes)
router.use('/classes', classEnrollmentRoutes)
router.use('/assignments', assignmentExtendedRoutes)
router.use('/classes/materials', teachingMaterialRoutes)
router.use('/clubs', clubsRoutes)
router.use('/community', communityRoutes)
router.use('/exams', examsRoutes)
router.use('/grades', gradesRoutes)
router.use('/leaves', leavesRoutes)
router.use('/meetings', meetingsRoutes)
router.use('/meetings', videoConferencingRoutes)
router.use('/organization', organizationRoutes)
router.use('/register', registerRoutes)
router.use('/resources', resourcesRoutes)
router.use('/schedule', scheduleRoutes)
router.use('/services', servicesRoutes)
router.use('/settings', settingsRoutes)
router.use('/users', usersRoutes)
router.use('/submissions', submissionRoutes)
router.use('/export', exportRoutes)

// mount chat routes under /chat
router.use('/chat', chatRoutes)

// อย่ารวม assistant.routes ที่นี่
// Assistant ถูก mount แยกผ่าน mountAssistant() ใน server.js แล้ว

export { router as apiRouter }
