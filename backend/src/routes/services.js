import { Router } from 'express'
import * as ctrl from '../controllers/services.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// Require auth for all service routes
router.use(authRequired)

// Get services
router.get('/', ctrl.getServices)

// Create service request
router.post('/', ctrl.createService)

export default router
