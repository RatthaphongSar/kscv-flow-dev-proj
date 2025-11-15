import { Router } from 'express';
import * as ctrl from '../controllers/assignments.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all assignment routes
router.use(authRequired);

// List assignments
router.get('/', [
  query('classId').optional().isString(),
  query('status').optional().isIn(['open','closed','graded'])
], ctrl.listAssignments);

// Create new assignment (teacher)
router.post('/', [
  body('classId').isString(),
  body('title').isString().notEmpty(),
  body('description').optional().isString(),
  body('dueDate').isISO8601()
], ctrl.createAssignment);

// Submit assignment (file/link)
router.post('/:id/submit', [
  param('id').isString(),
  body('submissionUrl').isString().notEmpty(),
  body('submissionText').optional().isString()
], ctrl.submitAssignment);

export default router;
