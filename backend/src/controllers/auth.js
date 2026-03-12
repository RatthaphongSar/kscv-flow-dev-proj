import { prisma } from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/**
 * Login with username/password (JWT issuance)
 * @route POST /login
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    console.log(`[Login] Attempting login with username: ${username}`)

    // Find user
    const user = await prisma.user.findUnique({ where: { username } })
    
    console.log(`[Login] Query result for username '${username}':`, user ? `Found user ${user.id}` : 'User not found')
    
    if (!user || !user.passwordHash) {
      console.log(`[Login] Failed: user not found or no password hash`)
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        sub: user.id,
        username: user.username, 
        role: user.role,
        year: user.year,
        major: user.major
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    )

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookies
    const envSameSite = String(process.env.COOKIE_SAMESITE || '').toLowerCase()
    const sameSite = (envSameSite === 'lax' || envSameSite === 'strict' || envSameSite === 'none')
      ? envSameSite
      : (process.env.NODE_ENV === 'production' ? 'strict' : 'lax')
    const secure = sameSite === 'none' || process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIES === 'true'

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 1000 // 1 hour
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.json({ 
      id: user.id,
      username: user.username,
      role: user.role,
      year: user.year,
      major: user.major,
      accessToken: accessToken,
      refreshToken: refreshToken
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
};

/**
 * Invalidate token (client-side + server revocation optional)
 * @route POST /logout
 * @remarks Request/Response schema documented in docs/openapi.yaml
 */
export const logout = async (req, res) => {
  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  return res.json({ message: 'Logged out successfully' })
};
