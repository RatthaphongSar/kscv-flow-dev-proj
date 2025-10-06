import { Router } from 'express';
import * as ctrl from '../controllers/grades.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Get Grades & Transcript for student
router.get('/transcript', [
  // no validators yet
], ctrl.getTranscript);

export default router;
