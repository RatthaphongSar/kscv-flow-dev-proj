// backend/src/routes/chat.js
import { Router } from 'express'
import * as ctrl from '../controllers/chat.js'
import { body, param, query } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// Create group room (manual) — เฉพาะ TEACHER/ADMIN
router.post(
  '/rooms',
  authRequired,
  [
    body('name').isString().withMessage('Room name is required'),
    body('memberIds')
      .optional()
      .isArray()
      .withMessage('memberIds must be an array'),
  ],
  validate,
  ctrl.createRoom
)

// Auto-generate rooms by year & major (communities)
router.get('/rooms/auto', authRequired, ctrl.autoRooms)

// Get all students (for teacher to add to room)
router.get('/students', authRequired, ctrl.getStudents)

// List rooms for current user (จาก JWT)
router.get('/rooms', authRequired, ctrl.listRooms)

// Send message
router.post(
  '/rooms/:roomId/messages',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    body('content').isString().withMessage('content is required'),
  ],
  validate,
  ctrl.sendMessage
)

// List messages of room
router.get(
  '/rooms/:roomId/messages',
  authRequired,
  [
    param('roomId').isString(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  ctrl.listMessages
)

// Edit message
router.patch(
  '/rooms/:roomId/messages/:messageId',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    param('messageId').isString().withMessage('messageId is required'),
    body('content').isString().withMessage('content is required'),
  ],
  validate,
  ctrl.editMessage
)

// Delete message
router.delete(
  '/rooms/:roomId/messages/:messageId',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    param('messageId').isString().withMessage('messageId is required'),
  ],
  validate,
  ctrl.deleteMessage
)

// Mark message as read
router.post(
  '/rooms/:roomId/messages/:messageId/read',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    param('messageId').isString().withMessage('messageId is required'),
  ],
  validate,
  ctrl.markMessageAsRead
)

// Add members to room (by teacher/admin)
router.post(
  '/rooms/:roomId/add-members',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    body('memberIds')
      .isArray({ min: 1 })
      .withMessage('memberIds must be a non-empty array'),
  ],
  validate,
  ctrl.addMembersToRoom
)

export default router
