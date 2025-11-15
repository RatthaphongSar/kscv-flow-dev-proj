import { Router } from 'express';
import * as ctrl from '../controllers/attendance.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all attendance routes
router.use(authRequired);

// Check-in (checkline) for attendance
router.post('/checkin', [
  body('classId').isString(),
  body('date').isISO8601(),
  body('status').isIn(['present','absent','late']).optional(),
  body('remark').isString().optional()
], ctrl.checkIn);

// My attendance records
router.get('/my', [
  query('month').optional().isISO8601()
], ctrl.myAttendance);

// List attendance by class (for advisor/teacher)
router.get('/class/:classId', [
  param('classId').isString()
], ctrl.listAttendanceByClass);

export default router;
