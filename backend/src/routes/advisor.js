import { Router } from 'express';
import * as ctrl from '../controllers/advisor.js';
import { param } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all advisor routes
router.use(authRequired);

// Advisor contact info (my assigned advisor)
router.get('/contact', ctrl.advisorContact);

// List all advisors
router.get('/', ctrl.listAdvisors);

// Get specific advisor details
router.get('/:id', [
  param('id').isString()
], ctrl.getAdvisor);

export default router;
