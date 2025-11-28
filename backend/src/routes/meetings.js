import { Router } from 'express';
import * as ctrl from '../controllers/meetings.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// List meetings (requires auth)
router.get('/', authRequired, [
  query('classId').optional().isString().trim(),
  query('status').optional().isIn(['scheduled', 'active', 'completed', 'cancelled']),
  query('userId').optional().isString().trim(),
], ctrl.listMeetings);

// Create meeting (teacher only - requires auth)
router.post('/', authRequired, [
  body('title').isString().trim().notEmpty(),
  body('classId').isString().trim().notEmpty(),
  body('type').isIn(['online', 'onsite']).notEmpty().withMessage('type must be online or onsite'),
  body('platform').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('description').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
], ctrl.createMeeting);

// Get meeting details (requires auth)
router.get('/:id', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.getMeeting);

// Update meeting (teacher only - requires auth)
router.patch('/:id', authRequired, [
  param('id').isString().trim().notEmpty(),
  body('title').optional().isString().trim(),
  body('description').optional().isString(),
  body('type').optional().isIn(['online', 'onsite']),
  body('platform').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('capacity').optional().isInt({ min: 1 }),
], ctrl.updateMeeting);

// Delete meeting (teacher only - requires auth)
router.delete('/:id', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.deleteMeeting);

// Start meeting (teacher only - requires auth)
router.post('/:id/start', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.startMeeting);

// End meeting (teacher only - requires auth)
router.post('/:id/end', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.endMeeting);

// Join meeting (student - requires auth)
router.post('/:id/join', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.joinMeeting);

// Leave meeting (student - requires auth)
router.post('/:id/leave', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.leaveMeeting);

// Get meeting participants (requires auth)
router.get('/:id/participants', authRequired, [
  param('id').isString().trim().notEmpty(),
], ctrl.getMeetingParticipants);

export default router;
