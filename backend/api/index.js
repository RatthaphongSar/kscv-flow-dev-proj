import dotenv from 'dotenv'
import { createApp, registerPostHandlers } from '../src/app.js'
import { mountAssistant } from '../src/assistant.module.js'
import { prisma } from '../src/db.js'

dotenv.config()

const app = createApp()
mountAssistant({ app, basePath: '/api/assistant', prisma })
registerPostHandlers(app)

export default app
