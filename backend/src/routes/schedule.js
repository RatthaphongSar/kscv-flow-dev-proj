import { Router } from 'express';
import * as ctrl from '../controllers/schedule.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Get weekly/daily schedule
router.get('/', [
  // no validators yet
], ctrl.getSchedule);

export default router;
