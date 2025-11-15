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
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    // payload: { sub, username, role, year, major }
    // Map 'sub' to 'id' for consistency
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      year: payload.year,
      major: payload.major
    }
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
