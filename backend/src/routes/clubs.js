import { Router } from 'express';
import * as ctrl from '../controllers/clubs.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Clubs & Activities list
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], ctrl.listClubs);

// Enroll to a club
router.post('/enroll', [
  body('clubId').isString()
], ctrl.enrollClub);

// My clubs (with membership & officer status)
router.get('/my', ctrl.myClubs);

export default router;
