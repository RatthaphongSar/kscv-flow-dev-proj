import { Router } from 'express'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// Require auth for all announcement routes
router.use(authRequired)

// Get announcements
router.get('/', getAnnouncements)

// Create announcement (teacher/admin only)
router.post('/', createAnnouncement)

// Update announcement (author/admin only)
router.patch('/:id', updateAnnouncement)

// Delete announcement (author/admin only)
router.delete('/:id', deleteAnnouncement)

export default router
