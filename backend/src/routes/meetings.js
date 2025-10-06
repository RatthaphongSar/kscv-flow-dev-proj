import { Router } from 'express';
import * as ctrl from '../controllers/meetings.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List meetings user can join
router.get('/', [
  // no validators yet
], ctrl.listMeetings);

export default router;
