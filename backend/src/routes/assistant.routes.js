// backend/src/routes/assistant.routes.js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { chatHandler, statusHandler } from '../controllers/assistant.controller.js'

const router = Router()

router.get('/status', statusHandler)

router.post('/chat',
  [
    body('roomId').optional().isString(),
    body('userId').optional().isString(),
    body('message').isString().trim().isLength({ min: 1 }).withMessage('message is required')
  ],
  validate,
  chatHandler
)

export default router
