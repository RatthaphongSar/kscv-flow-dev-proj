import { Router } from 'express';
import * as ctrl from '../controllers/assignments.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List assignments
router.get('/', [
  // no validators yet
], ctrl.listAssignments);

// Create new assignment (teacher)
router.post('/', [
  // no validators yet
], ctrl.createAssignment);

// Submit assignment (file/link)
router.post('/:id/submit', [
  param('id').isString()
], ctrl.submitAssignment);

export default router;
