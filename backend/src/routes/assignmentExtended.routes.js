/**
 * Assignment Extended Routes
 * Handles submissions, grading, and resubmission
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authRequired } from '../middleware/devAuth.js';
import * as ctrl from '../controllers/assignmentExtended.controller.js';

const router = Router();
router.use(authRequired);

// ==================== SUBMISSION ====================

router.post(
  '/:assignmentId/submit',
  param('assignmentId').isString().trim().notEmpty(),
  body('fileUrl').optional().isURL(),
  body('content').optional().isString(),
  ctrl.submitAssignment
);

router.post(
  '/:assignmentId/cancel-submission',
  param('assignmentId').isString().trim().notEmpty(),
  ctrl.cancelSubmission
);

// ==================== GRADING ====================

router.post(
  '/:assignmentId/grade',
  param('assignmentId').isString().trim().notEmpty(),
  body('studentId').isString().trim().notEmpty(),
  body('score').isFloat({ min: 0 }).withMessage('Score must be >= 0'),
  body('feedback').optional().isString(),
  ctrl.gradeSubmission
);

router.post(
  '/:assignmentId/request-resubmit',
  param('assignmentId').isString().trim().notEmpty(),
  body('studentId').isString().trim().notEmpty(),
  body('feedback').optional().isString(),
  ctrl.requestResubmission
);

// ==================== STATS ====================

router.get(
  '/:assignmentId/stats/:classId',
  param('assignmentId').isString().trim().notEmpty(),
  param('classId').isString().trim().notEmpty(),
  ctrl.getSubmissionStats
);

export default router;
