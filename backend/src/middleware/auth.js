// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken'

function getTokenFrom(req) {
  const cookie = req.cookies?.access_token
  if (cookie) return cookie
  const h = req.headers.authorization || ''
  if (h.startsWith('Bearer ')) return h.slice(7)
  return null
}

export function authRequired(req, res, next) {
  try {
    const token = getTokenFrom(req)
    if (!token) {
      console.warn('[Auth] No token found in request')
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch (err) {
      console.warn('[Auth] JWT verification failed:', err.message)
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // payload: { sub, username, role, year, major }
    // Map 'sub' to 'id' for consistency
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      year: payload.year,
      major: payload.major
    }
    console.log('[Auth] User authenticated:', { userId: req.user.id, username: req.user.username })
    next()
  } catch (err) {
    console.error('[Auth] Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
