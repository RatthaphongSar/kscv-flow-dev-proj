/**
 * Class Enrollment Routes
 * Handles student enrollment, join requests, and class membership
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import * as ctrl from '../controllers/classEnrollment.controller.js';

const router = Router();
router.use(authRequired);

// ==================== STUDENT SEARCH ====================

router.get(
  '/search/students',
  query('q').isString().trim().notEmpty().withMessage('Search query required'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  ctrl.searchStudents
);

// ==================== ENROLLMENT MANAGEMENT ====================

router.post(
  '/:classId/enroll-multiple',
  param('classId').isString().trim().notEmpty(),
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('studentIds must be a non-empty array'),
  body('studentIds.*').isString().trim(),
  ctrl.enrollMultipleStudents
);

router.delete(
  '/enrollment/:enrollmentId',
  param('enrollmentId').isString().trim().notEmpty(),
  ctrl.removeEnrollment
);

// ==================== JOIN REQUEST ====================

router.post(
  '/:classId/join-request',
  param('classId').isString().trim().notEmpty(),
  ctrl.createJoinRequest
);

router.get(
  '/:classId/join-requests',
  param('classId').isString().trim().notEmpty(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  ctrl.getClassJoinRequests
);

router.post(
  '/join-requests/:joinRequestId/approve',
  param('joinRequestId').isString().trim().notEmpty(),
  ctrl.approveJoinRequest
);

router.post(
  '/join-requests/:joinRequestId/reject',
  param('joinRequestId').isString().trim().notEmpty(),
  body('reason').optional().isString(),
  ctrl.rejectJoinRequest
);

export default router;
