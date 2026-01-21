// backend/src/app.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'
import { apiRouter } from './routes/index.js'
import { mockAuthMiddleware } from './middleware/mockAuth.js'
 
// ----- Utils: parse CORS allowlist -----
function parseCorsOrigins(raw) {
  if (!raw || raw === '*') return '*'

  const list = raw.split(',').map(s => s.trim()).filter(Boolean)

  return list.map(o => (o.startsWith('/') && o.endsWith('/')) ? new RegExp(o.slice(1, -1)) : o)
}

export const createApp = () => {
  const app = express()

  // Production optimizations
  const isProduction = process.env.NODE_ENV === 'production'

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
  app.use(compression({
    level: isProduction ? 6 : 3,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false
      return compression.filter(req, res)
    }
  }))
  
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(express.json({ limit: '10mb' }))
  app.use(cookieParser())

  // Logging
  const morganFormat = isProduction ? 'combined' : 'dev'
  app.use(morgan(morganFormat, {
    skip: (req, res) => isProduction && res.statusCode < 400
  }))

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 120),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !isProduction && req.ip === '::1'
  })
  app.use(limiter)

  // Public cache policy (GET เท่านั้น)
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      const cacheTime = isProduction ? 300 : 30
      res.set('Cache-Control', `public, max-age=${cacheTime}, stale-while-revalidate=600`)
    }
    next()
  })

  // Root welcome
  app.get('/', (_req, res) => {
    res.json({ service: 'KSVC Connect API', version: '0.1.0', health: '/health', docs: '/docs', env: process.env.NODE_ENV })
  })

  app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString(), uptime: process.uptime() })
  })

  // Mock auth middleware (for testing/development)
  app.use('/api', mockAuthMiddleware)

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
  app.use((err, _req, res, next) => {
    void next
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Server Error' })
  })
}
