import { Router } from 'express';
import * as ctrl from '../controllers/settings.js';
import { body, param, query } from 'express-validator';
import {validate} from '../middleware/validate.js';
const router = Router();

// Update user preferences (i18n, dark mode, notifications)
router.patch('/preferences', [
  body('language').optional().isIn(['th', 'en']),
  body('darkMode').optional().isBoolean(),
  body('notifications').optional().isBoolean()
], validate, ctrl.updatePreferences);

export default router;
