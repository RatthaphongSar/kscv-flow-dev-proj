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

    // Find user
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !user.passwordHash) {
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
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIES === 'true',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIES === 'true',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.json({ 
      id: user.id,
      username: user.username,
      role: user.role,
      year: user.year,
      major: user.major
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
