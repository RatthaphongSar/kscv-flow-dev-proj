import { Router } from 'express';
import * as ctrl from '../controllers/advisor.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Advisor contact info
router.get('/contact', [
  // no validators yet
], ctrl.advisorContact);

export default router;
