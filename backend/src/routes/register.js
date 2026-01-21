import { Router } from 'express';
import * as ctrl from '../controllers/register.js';
import { body } from 'express-validator';
const router = Router();

// Register Services request ticket
router.post('/services', [
  body('type').isString(), body('payload').isObject()
], ctrl.requestService);

export default router;
