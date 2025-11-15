import { Router } from 'express';
import * as ctrl from '../controllers/advisor.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Advisor contact info (my assigned advisor)
router.get('/contact', ctrl.advisorContact);

// List all advisors
router.get('/', ctrl.listAdvisors);

// Get specific advisor details
router.get('/:id', [
  param('id').isString()
], ctrl.getAdvisor);

export default router;
