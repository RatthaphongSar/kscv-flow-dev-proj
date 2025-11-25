// backend/src/routes/videoConferencing.js
import { Router } from 'express'
import * as ctrl from '../controllers/videoConferencing.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authRequired)

// ============ RECORDING ENDPOINTS ============

// Start recording
router.post('/:id/recording/start', ctrl.startRecording)

// Stop recording
router.post('/:id/recording/stop', ctrl.stopRecording)

// Get recording status
router.get('/:id/recording/status', ctrl.getRecordingStatus)

// ============ VIDEO CALL ENDPOINTS ============

// Get current participants
router.get('/:id/video/participants', ctrl.getVideoParticipants)

// ============ STATS ENDPOINTS ============

// Log call statistics
router.post('/:id/stats/log', ctrl.logStats)

// Get quality statistics
router.get('/:id/stats/quality', ctrl.getQualityStats)

// ============ CHAT ENDPOINTS ============

// Send chat message
router.post('/:id/chat/message', ctrl.sendChatMessage)

// Get chat history
router.get('/:id/chat/history', ctrl.getChatHistory)

export default router
