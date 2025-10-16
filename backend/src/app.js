// backend/src/app.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'
import { apiRouter } from './routes/index.js'
 
// ----- Utils: parse CORS allowlist -----
function parseCorsOrigins(raw) {
  if (!raw || raw === '*') return '*'

  const list = raw.split(',').map(s => s.trim()).filter(Boolean)

  return list.map(o => (o.startsWith('/') && o.endsWith('/')) ? new RegExp(o.slice(1, -1)) : o)
}

export const createApp = () => {
  const app = express()

  app.set('trust proxy', 1)
  app.set('etag', 'strong')

  // --- Core middlewares ---
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } 
  }))

  // CORS allowlist
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN)
  app.use(cors({
    origin: corsOrigins === '*' ? true : corsOrigins,
    credentials: true,
    maxAge: 86400 // preflight cache 24h
  }))

  // ประสิทธิภาพ network
  app.use(compression()) 
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'))

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 120),
    standardHeaders: true,
    legacyHeaders: false
  })
  app.use(limiter)

  // Public cache policy (GET เท่านั้น)
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    }
    next()
  })

  // Root welcome
  app.get('/', (_req, res) => {
    res.json({ service: 'KVC API', version: '0.1.0', health: '/health', docs: '/docs' })
  })

  app.get('/health', (_req, res) => res.json({ ok: true }))

  // API หลัก
  app.use('/api', apiRouter)

  // Swagger UI from docs/openapi.yaml (with safe loading)
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const openapiPath = path.join(__dirname, '../../docs/openapi.yaml')

  let swaggerDoc = null
  try {
    swaggerDoc = YAML.load(openapiPath)
  } catch (e) {
    console.warn('⚠️  Cannot load OpenAPI file at', openapiPath, e?.message)
    swaggerDoc = { openapi: '3.0.0', info: { title: 'KVC API', version: '0.1.0' }, paths: {} }
  }

  // JSON spec endpoint (สะดวกสำหรับเครื่องมือภายนอก)
  app.get('/docs.json', (_req, res) => res.json(swaggerDoc))
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

  // ❗ อย่าใส่ 404 / error handler ที่นี่
  return app
}

/**
 * ติดตั้ง 404 และ error handlers
 * ต้องเรียกฟังก์ชันนี้ "หลัง" จาก mount โมดูลอื่น ๆ (เช่น Assistant) แล้วเท่านั้น
 */
export const registerPostHandlers = (app) => {
  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  // JSON parse error แยก 400 ให้สวยงาม
  app.use((err, _req, res, next) => {
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON payload' })
    }
    next(err)
  })

  // Error handler สุดท้าย
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Server Error' })
  })
}
