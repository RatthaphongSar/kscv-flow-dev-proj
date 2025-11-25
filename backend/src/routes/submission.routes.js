import { Router } from 'express';
import { param, body } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import * as ctrl from '../controllers/submission.controller.js';

const router = Router();
router.use(authRequired);

// ==================== SUBMISSION MANAGEMENT ====================

/**
 * Get student's submission for an assignment
 * GET /api/submissions/assignments/:assignmentId
 */
router.get(
  '/assignments/:assignmentId',
  param('assignmentId').isString().trim().notEmpty(),
  ctrl.getSubmission
);

/**
 * Submit/update assignment
 * POST /api/submissions/assignments/:assignmentId
 */
router.post(
  '/assignments/:assignmentId',
  param('assignmentId').isString().trim().notEmpty(),
  body('content').optional().isString(),
  body('fileUrl').optional().isString(),
  ctrl.submitAssignment
);

/**
 * Get all submissions for an assignment (teacher only)
 * GET /api/submissions/assignments/:assignmentId/all
 */
router.get(
  '/assignments/:assignmentId/all',
  param('assignmentId').isString().trim().notEmpty(),
  ctrl.getAssignmentSubmissions
);

/**
 * Grade a submission (teacher only)
 * PATCH /api/submissions/:submissionId/grade
 */
router.patch(
  '/:submissionId/grade',
  param('submissionId').isString().trim().notEmpty(),
  body('grade').optional().isFloat({ min: 0 }),
  body('feedback').optional().isString(),
  body('status').optional().isIn(['submitted', 'graded', 'late', 'requested_resubmit']),
  ctrl.gradeSubmission
);

/**
 * Request resubmission (teacher only)
 * POST /api/submissions/:submissionId/request-resubmit
 */
router.post(
  '/:submissionId/request-resubmit',
  param('submissionId').isString().trim().notEmpty(),
  body('feedback').optional().isString(),
  ctrl.requestResubmission
);

export default router;
