import { Router } from 'express';
import * as ctrl from '../controllers/settings.js';
const router = Router();

// Update user preferences (i18n, dark mode, notifications)
router.patch('/preferences', [
  // no validators yet
], ctrl.updatePreferences);

export default router;
