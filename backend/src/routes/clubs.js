import { Router } from 'express';
import * as ctrl from '../controllers/clubs.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Clubs & Activities list
router.get('/', [
  // no validators yet
], ctrl.listClubs);

// Enroll to a club
router.post('/enroll', [
  body('clubId').isString()
], ctrl.enrollClub);

export default router;
