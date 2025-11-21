// backend/src/middleware/devAuth.js
// Development-only auth middleware that accepts simple bearer tokens
// For production, use authRequired middleware instead

export function authRequired(req, res, next) {
  try {
    // Check for simple Bearer token in development
    const auth = req.headers.authorization || ''
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7)
      
      // In dev, accept any bearer token and create a mock user
      if (process.env.NODE_ENV !== 'production') {
        // For testing: any bearer token starting with 'bearer-token-' is valid
        if (token.startsWith('bearer-token-')) {
          const role = token.includes('teacher') ? 'TEACHER' : 'STUDENT'
          const id = token.includes('teacher') ? 'teacher-001' : 'student-001'
          
          req.user = {
            id,
            username: role === 'TEACHER' ? 'teacher' : 'student1',
            role,
            year: 1,
            major: 'General'
          }
          console.log('[DevAuth] User authenticated:', { userId: req.user.id, username: req.user.username })
          return next()
        }
      }
    }
    
    // No valid token found
    console.warn('[Auth] No valid token in request')
    return res.status(401).json({ error: 'Unauthorized' })
    
  } catch (err) {
    console.error('[Auth] Error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}
