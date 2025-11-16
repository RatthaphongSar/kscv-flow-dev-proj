import { Router } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { prisma } from '../db.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(cookieParser())

const ACCESS_TTL  = process.env.ACCESS_TOKEN_TTL  || '15m'
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '30d'

function signAccess(u) {
  return jwt.sign(
    { sub: u.id, role: u.role, username: u.username, year: u.year, major: u.major },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  )
}
function signRefresh(u) {
  return jwt.sign({ sub: u.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL })
}
function setAuthCookies(res, access, refresh) {
  const isProd = process.env.NODE_ENV === 'production'
  const secure = isProd || process.env.FORCE_SECURE_COOKIES === 'true'
  // Dev (HTTP): use 'lax'; Prod (HTTPS): use 'strict'
  const sameSite = isProd ? 'strict' : 'lax'
  
  res.cookie('access_token', access, { 
    httpOnly: true, 
    sameSite, 
    secure, 
    path: '/',
    maxAge: 1000*60*15 // 15 mins = JWT ACCESS exp
  })
  res.cookie('refresh_token', refresh, { 
    httpOnly: true, 
    sameSite, 
    secure, 
    path: '/',
    maxAge: 1000*60*60*24*30 // 30 days = JWT REFRESH exp
  })
  
  console.log('[Auth] Cookies set:', {
    secure,
    sameSite,
    hasAccessToken: !!access,
    hasRefreshToken: !!refresh,
  })
}

/**
 * Login (username/password) – ใช้เฉพาะผู้ใช้ที่สร้างมาจาก Register Service/seed เท่านั้น
 */
router.post('/login',
  [ body('username').isString(), body('password').isString() ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body
      console.log('Login attempt:', { username }) // Debug log

      const u = await prisma.user.findUnique({ where: { username } })
      console.log('Found user:', u ? { id: u.id, username: u.username } : null) // Debug log

      if (!u || !u.passwordHash) {
        console.log('No user or no password hash') // Debug log
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const passwordValid = await bcrypt.compare(password, u.passwordHash)
      console.log('Password valid:', passwordValid) // Debug log

      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const access  = signAccess(u)
      const refresh = signRefresh(u)
      setAuthCookies(res, access, refresh)
      console.log('[Login] User logged in successfully:', { id: u.id, username: u.username })
      res.json({ id: u.id, username: u.username, role: u.role, year: u.year, major: u.major })
    } catch (e) { next(e) }
  }
)

/**
 * Refresh – ใช้ cookie refresh_token ออก access ใหม่
 */
router.post('/refresh', async (req, res) => {
  try {
    const rt = req.cookies?.refresh_token
    if (!rt) {
      console.warn('[Refresh] No refresh token in cookies')
      return res.status(401).json({ error: 'No refresh token' })
    }
    
    // Verify refresh token
    let payload
    try {
      payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET)
    } catch (err) {
      console.error('[Refresh] JWT verification failed:', err.message)
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const u = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!u) {
      console.warn('[Refresh] User not found for sub:', payload.sub)
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const access = signAccess(u)
    setAuthCookies(res, access, rt)
    console.log('[Refresh] Token refreshed for user:', u.username)
    res.json({ ok: true })
  } catch (err) {
    console.error('[Refresh] Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/** Logout – ลบคุกกี้ */
router.post('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  res.json({ ok: true })
})

/** Me – ดูข้อมูลผู้ใช้จาก access_token ถ้ามี */
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.access_token
    if (!token) return res.json(null)
    const p = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const u = await prisma.user.findUnique({ where: { id: p.sub } })
    if (!u) return res.json(null)
    res.json({ id:u.id, username:u.username, role:u.role, year:u.year, major:u.major })
  } catch {
    res.json(null)
  }
})

export default router
