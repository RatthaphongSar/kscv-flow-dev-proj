import { Router } from 'express';
import * as ctrl from '../controllers/attendance.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Check-in (checkline) for attendance
router.post('/checkin', [
  body('classId').isString()
], ctrl.checkIn);

// My attendance records
router.get('/my', [
  // no validators yet
], ctrl.myAttendance);

export default router;
