const { Router } = require('express')
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcements')
const { authRequired } = require('../middleware/auth')

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

module.exports = router
