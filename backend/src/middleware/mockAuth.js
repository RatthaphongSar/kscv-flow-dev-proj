/**
 * Mock authentication middleware for testing
 * Sets req.user based on Authorization header token
 * Allows public endpoints like /auth/login to proceed
 */

export const mockAuthMiddleware = (req, res, next) => {
  // Allow public endpoints to proceed without authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  const authHeader = req.headers.authorization || '';

  // Parse Bearer token (format: "bearer-token-XXX")
  const token = authHeader.replace('bearer ', '').toLowerCase();

  if (token.includes('teacher')) {
    req.user = {
      id: 'teacher-001',
      username: 'teacher',
      email: 'teacher@university.edu',
      role: 'TEACHER',
    };
  } else if (token.includes('student')) {
    req.user = {
      id: 'student-001',
      username: 'student',
      email: 'student@university.edu',
      role: 'STUDENT',
    };
  } else if (token.includes('admin')) {
    req.user = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@university.edu',
      role: 'ADMIN',
    };
  } else if (authHeader) {
    // If Authorization header exists but token not recognized, deny
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};
