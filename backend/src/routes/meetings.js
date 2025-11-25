import { Router } from 'express';
import * as ctrl from '../controllers/meetings.js';
import { body, param, query } from 'express-validator';

const router = Router();

// List meetings
router.get('/', [
  query('classId').optional().isString().trim(),
  query('status').optional().isIn(['scheduled', 'active', 'completed', 'cancelled']),
  query('userId').optional().isString().trim(),
], ctrl.listMeetings);

// Create meeting (teacher only)
router.post('/', [
  body('title').isString().trim().notEmpty(),
  body('classId').isString().trim().notEmpty(),
  body('type').isIn(['online', 'onsite']).optional(),
  body('platform').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('description').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
], ctrl.createMeeting);

// Get meeting details
router.get('/:id', [
  param('id').isString().trim().notEmpty(),
], ctrl.getMeeting);

// Update meeting (teacher only)
router.patch('/:id', [
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

// Delete meeting (teacher only)
router.delete('/:id', [
  param('id').isString().trim().notEmpty(),
], ctrl.deleteMeeting);

// Start meeting (teacher only)
router.post('/:id/start', [
  param('id').isString().trim().notEmpty(),
], ctrl.startMeeting);

// End meeting (teacher only)
router.post('/:id/end', [
  param('id').isString().trim().notEmpty(),
], ctrl.endMeeting);

// Join meeting (student)
router.post('/:id/join', [
  param('id').isString().trim().notEmpty(),
], ctrl.joinMeeting);

// Leave meeting (student)
router.post('/:id/leave', [
  param('id').isString().trim().notEmpty(),
], ctrl.leaveMeeting);

// Get meeting participants
router.get('/:id/participants', [
  param('id').isString().trim().notEmpty(),
], ctrl.getMeetingParticipants);

export default router;
