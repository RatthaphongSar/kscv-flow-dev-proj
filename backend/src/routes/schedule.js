import { Router } from 'express';
import * as ctrl from '../controllers/schedule.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Get weekly/daily schedule
router.get('/', [
  query('classId').optional().isString(),
  query('dayOfWeek').optional().isInt()
], ctrl.getSchedule);

// Create schedule (admin/teacher)
router.post('/', [
  body('classId').isString(),
  body('dayOfWeek').isInt(),
  body('startTime').isString(),
  body('endTime').isString()
], ctrl.createSchedule);

// My class schedule
router.get('/my', [
], ctrl.mySchedule);

export default router;
