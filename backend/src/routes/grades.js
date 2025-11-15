import { Router } from 'express';
import * as ctrl from '../controllers/grades.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all grade routes
router.use(authRequired);

// Get Grades & Transcript for student
router.get('/transcript', [
], ctrl.getTranscript);

// Create or update grade (teacher)
router.post('/', [
  body('examId').isString(),
  body('studentId').isString(),
  body('score').isFloat({ min: 0 })
], ctrl.createGrade);

export default router;
