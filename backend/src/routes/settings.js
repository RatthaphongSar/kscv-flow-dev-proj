import { Router } from 'express';
import * as ctrl from '../controllers/settings.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Update user preferences (i18n, dark mode, notifications)
router.patch('/preferences', [
  // no validators yet
], ctrl.updatePreferences);

export default router;
