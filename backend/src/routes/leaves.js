import { Router } from 'express';
import * as ctrl from '../controllers/leaves.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Submit leave request (sick/personal/ordination/other) with rules
router.post('/', [
  body('type').isIn(['sick','personal','ordination','other']), body('from').isISO8601(), body('to').isISO8601()
], ctrl.requestLeave);

// List my leave requests
router.get('/my', [
  // no validators yet
], ctrl.myLeaves);

// Attach doctor certificate when sick leave > 2 days
router.post('/:id/attach-doctor-cert', [
  param('id').isString()
], ctrl.attachDoctorCert);

// Advisor/Admin approve/reject
router.patch('/:id/status', [
  param('id').isString(), body('status').isIn(['approved','rejected'])
], ctrl.approveOrReject);

export default router;
