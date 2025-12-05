// backend/src/routes/users.js
import { Router } from 'express'
import * as ctrl from '../controllers/users.js'
import { body, query } from 'express-validator'
import { authRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Admin creates account
router.post(
  '/',
  authRequired,
  [
    body('username').isString(),
    body('password').isString(),
    body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN']),
    body('year').optional().isInt(),
    body('major').optional().isString(),
  ],
  validate,
  ctrl.createUser
)

// List users (ใช้ครูดึงรายชื่อนักเรียน)
router.get(
  '/',
  authRequired,
  [
    query('role').optional().isString(),
    query('year').optional().isInt(),
    query('major').optional().isString(),
  ],
  validate,
  ctrl.listUsers
)

// Get current user profile
router.get('/me', authRequired, ctrl.getMe)

// Get full profile with advisor info
router.get('/profile', authRequired, ctrl.getProfile)

// Update own profile
router.patch('/me', authRequired, ctrl.updateMe)

// Update full profile
router.patch('/profile', authRequired, ctrl.updateProfile)

export default router
