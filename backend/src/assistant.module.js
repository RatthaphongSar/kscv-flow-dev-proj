// backend/src/assistant.module.js
import assistantRouter from './routes/assistant.routes.js'

export function mountAssistant({ app, basePath = '/api/assistant', prisma, io }) {
  if (!app) throw new Error('mountAssistant: app is required')
  if (prisma) app.set('prisma', prisma)
  if (io) app.set('io', io)
  app.use(basePath, assistantRouter)
  console.log(`[Assistant] mounted at ${basePath}`)
}
