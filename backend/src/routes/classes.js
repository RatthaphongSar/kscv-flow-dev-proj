import { Router } from 'express';
import * as ctrl from '../controllers/classes.js';
import { body, param, query } from 'express-validator';
const router = Router();

// List classes for user (by enrollment)
router.get('/', [
  // no validators yet
], ctrl.listClasses);

export default router;
