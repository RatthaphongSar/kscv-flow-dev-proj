// backend/src/routes/index.js
import { Router } from 'express'

// === รวม route ย่อยทั้งหมดของระบบ ===
// (มีอะไรอยู่แล้วคงไว้ได้ตามเดิม เพิ่ม chatRoutes เข้าไป)
import advisorRoutes from './advisor.js'
import assignmentsRoutes from './assignments.js'
import attendanceRoutes from './attendance.js'
import authRoutes from './auth.js'
import classesRoutes from './classes.js'
import clubsRoutes from './clubs.js'
import communityRoutes from './community.js'
import examsRoutes from './exams.js'
import gradesRoutes from './grades.js'
import leavesRoutes from './leaves.js'
import meetingsRoutes from './meetings.js'
import organizationRoutes from './organization.js'
import registerRoutes from './register.js'
import resourcesRoutes from './resources.js'
import scheduleRoutes from './schedule.js'
import settingsRoutes from './settings.js'
import usersRoutes from './users.js'

// 🔵 สำคัญ: มี endpoint /rooms, /rooms/auto, /rooms/:id/messages
import chatRoutes from './chat.js'   // <-- เพิ่มอันนี้

const router = Router()

// mount ตาม base path ที่ต้องการ
router.use('/advisor', advisorRoutes)
router.use('/assignments', assignmentsRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/auth', authRoutes)
router.use('/classes', classesRoutes)
router.use('/clubs', clubsRoutes)
router.use('/community', communityRoutes)
router.use('/exams', examsRoutes)
router.use('/grades', gradesRoutes)
router.use('/leaves', leavesRoutes)
router.use('/meetings', meetingsRoutes)
router.use('/organization', organizationRoutes)
router.use('/register', registerRoutes)
router.use('/resources', resourcesRoutes)
router.use('/schedule', scheduleRoutes)
router.use('/settings', settingsRoutes)
router.use('/users', usersRoutes)

// ให้เส้นทางของห้องแชทอยู่ใต้ /api (เช่น /api/rooms)
router.use('/', chatRoutes)

// อย่ารวม assistant.routes ที่นี่
// Assistant ถูก mount แยกผ่าน mountAssistant() ใน server.js แล้ว

export { router as apiRouter }
