// backend/src/routes/chat.js
import { Router } from 'express'
import * as ctrl from '../controllers/chat.js'
import * as ctrlExt from '../controllers/chatExtended.js'
import { body, param, query } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authRequired } from '../middleware/auth.js'
import { uploadMiddleware, handleUploadError } from '../middleware/upload.js'

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

// Send message (with file upload support)
router.post(
  '/rooms/:roomId/messages',
  authRequired,
  uploadMiddleware.array('files', 10), // max 10 files
  handleUploadError,
  [
    param('roomId').isString().withMessage('roomId is required'),
    body('content').optional().isString(),
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

// PUT /rooms/:roomId - Update room name (teacher-only)
router.put(
  '/rooms/:roomId',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
    body('name').isString().withMessage('Room name is required'),
  ],
  validate,
  ctrl.updateRoom
)

// DELETE /rooms/:roomId - Delete room (teacher-only)
router.delete(
  '/rooms/:roomId',
  authRequired,
  [
    param('roomId').isString().withMessage('roomId is required'),
  ],
  validate,
  ctrl.deleteRoom
)

// ==================== CHAT NOTES ====================

// GET /rooms/:roomId/notes
router.get(
  '/rooms/:roomId/notes',
  authRequired,
  ctrlExt.getNotes
)

// GET /rooms/:roomId/notes/:noteId
router.get(
  '/rooms/:roomId/notes/:noteId',
  authRequired,
  ctrlExt.getNote
)

// POST /rooms/:roomId/notes
router.post(
  '/rooms/:roomId/notes',
  authRequired,
  [
    body('title').isString().withMessage('title is required'),
    body('content').isString().withMessage('content is required'),
  ],
  validate,
  ctrlExt.createNote
)

// PUT /rooms/:roomId/notes/:noteId
router.put(
  '/rooms/:roomId/notes/:noteId',
  authRequired,
  [
    body('title').optional().isString(),
    body('content').optional().isString(),
  ],
  validate,
  ctrlExt.updateNote
)

// DELETE /rooms/:roomId/notes/:noteId
router.delete(
  '/rooms/:roomId/notes/:noteId',
  authRequired,
  ctrlExt.deleteNote
)

// ==================== CHAT FILES ====================

// GET /rooms/:roomId/files
router.get(
  '/rooms/:roomId/files',
  authRequired,
  ctrlExt.getFiles
)

// GET /rooms/:roomId/files/:fileId
router.get(
  '/rooms/:roomId/files/:fileId',
  authRequired,
  ctrlExt.getFile
)

// POST /rooms/:roomId/files
router.post(
  '/rooms/:roomId/files',
  authRequired,
  [
    body('fileName').isString().withMessage('fileName is required'),
    body('mimeType').isString().withMessage('mimeType is required'),
    body('sizeBytes').isInt({ min: 0 }).withMessage('sizeBytes must be a number'),
    body('url').isString().withMessage('url is required'),
    body('width').optional().isInt({ min: 0 }),
    body('height').optional().isInt({ min: 0 }),
  ],
  validate,
  ctrlExt.uploadFile
)

// DELETE /rooms/:roomId/files/:fileId
router.delete(
  '/rooms/:roomId/files/:fileId',
  authRequired,
  ctrlExt.deleteFile
)

// ==================== CHAT MEMBERS ====================

// GET /rooms/:roomId/members
router.get(
  '/rooms/:roomId/members',
  authRequired,
  ctrlExt.getRoomMembers
)

// GET /rooms/:roomId/members/available
router.get(
  '/rooms/:roomId/members/available',
  authRequired,
  ctrlExt.getAvailableMembers
)

// POST /rooms/:roomId/members
router.post(
  '/rooms/:roomId/members',
  authRequired,
  [
    body('userId').isString().withMessage('userId is required'),
  ],
  validate,
  ctrlExt.addMember
)

// DELETE /rooms/:roomId/members/:userId
router.delete(
  '/rooms/:roomId/members/:userId',
  authRequired,
  ctrlExt.removeMember
)

// ==================== CHAT READ RECEIPTS ====================

// POST /rooms/:roomId/messages/mark-read
router.post(
  '/rooms/:roomId/messages/mark-read',
  authRequired,
  ctrlExt.markRoomAsRead
)

// GET /rooms/:roomId/messages/read-receipts
router.get(
  '/rooms/:roomId/messages/read-receipts',
  authRequired,
  ctrlExt.getReadReceipts
)

// GET /rooms/:roomId/messages/:messageId/readers
router.get(
  '/rooms/:roomId/messages/:messageId/readers',
  authRequired,
  ctrlExt.getMessageReaders
)

// ==================== UNREAD SUMMARY ====================

// GET /unread-summary
router.get(
  '/unread-summary',
  authRequired,
  ctrlExt.getUnreadSummary
)

// ==================== ROOM PIN ====================

// POST /rooms/:roomId/pin
router.post(
  '/rooms/:roomId/pin',
  authRequired,
  [param('roomId').isString().withMessage('roomId is required')],
  validate,
  ctrlExt.pinRoom
)

// DELETE /rooms/:roomId/pin
router.delete(
  '/rooms/:roomId/pin',
  authRequired,
  [param('roomId').isString().withMessage('roomId is required')],
  validate,
  ctrlExt.unpinRoom
)

// GET /me/pinned
router.get(
  '/me/pinned',
  authRequired,
  ctrlExt.getPinnedRooms
)

// GET /rooms/:roomId/pin/status
router.get(
  '/rooms/:roomId/pin/status',
  authRequired,
  [param('roomId').isString().withMessage('roomId is required')],
  validate,
  ctrlExt.checkRoomPinStatus
)

export default router
