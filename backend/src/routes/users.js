import { Router } from 'express';
import * as ctrl from '../controllers/users.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Admin creates account
router.post('/', [
  body('username').isString(), body('role').isIn(['student','teacher','admin']), body('profile').isObject()
], ctrl.createUser);

// Get current user profile
router.get('/me', [
  // no validators yet
], ctrl.getMe);

// Update own profile
router.patch('/me', [
  // no validators yet
], ctrl.updateMe);

export default router;
