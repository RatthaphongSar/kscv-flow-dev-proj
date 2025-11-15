import { Router } from 'express';
import * as ctrl from '../controllers/exams.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List exams schedule
router.get('/', [
  query('classId').optional().isString()
], ctrl.listExams);

// Create exam
router.post('/', [
  body('title').isString(),
  body('date').isISO8601(),
  body('classId').isString()
], ctrl.createExam);

// My exam grades
router.get('/my', [], ctrl.myExams);

export default router;
