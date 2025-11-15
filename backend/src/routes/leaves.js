import { Router } from 'express';
import * as ctrl from '../controllers/leaves.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all leave routes
router.use(authRequired);

// Submit leave request (sick/personal/ordination/other) with rules
router.post('/', [
  body('type').isIn(['sick','personal','ordination','other']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], ctrl.requestLeave);

// List my leave requests
router.get('/my', [
  query('status').optional().isIn(['pending', 'approved', 'rejected'])
], ctrl.myLeaves);

// Attach doctor certificate when sick leave > 2 days
router.post('/:id/attach-doctor-cert', [
  param('id').isString(),
  body('docUrl').isString()
], ctrl.attachDoctorCert);

// Advisor/Admin approve/reject
router.patch('/:id/status', [
  param('id').isString(),
  body('status').isIn(['approved','rejected'])
], ctrl.approveOrReject);

export default router;
