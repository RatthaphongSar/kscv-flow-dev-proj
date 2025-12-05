import { Router } from 'express'
import * as ctrl from '../controllers/announcements.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// Require auth for all announcement routes
router.use(authRequired)

// Get announcements
router.get('/', ctrl.getAnnouncements)

// Create announcement
router.post('/', ctrl.createAnnouncement)

export default router
