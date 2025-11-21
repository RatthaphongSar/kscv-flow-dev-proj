import { Router } from 'express';
import * as ctrl from '../controllers/class.controller.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List classes for user (by enrollment/teaching)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], ctrl.listClasses);

export default router;
