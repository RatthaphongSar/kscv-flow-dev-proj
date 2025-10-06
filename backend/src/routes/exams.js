import { Router } from 'express';
import * as ctrl from '../controllers/exams.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List exams schedule
router.get('/', [
  // no validators yet
], ctrl.listExams);

export default router;
