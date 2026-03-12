/**
 * Mock authentication middleware for testing
 * Sets req.user based on Authorization header token
 * Allows public endpoints like /auth/login to proceed
 * Only intercepts requests without Bearer tokens
 */

export const mockAuthMiddleware = (req, res, next) => {
  // Allow public endpoints to proceed without authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  const authHeader = req.headers.authorization || '';

  // Parse Bearer token format: "Bearer mock-teacher-token", "Bearer mock-student-token", etc.
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).toLowerCase();
    
    if (token.includes('teacher')) {
      req.user = {
        id: 'teacher-001',
        sub: 'teacher-001',
        username: 'teacher',
        email: 'teacher@university.edu',
        role: 'TEACHER',
      };
      return next();
    } else if (token.includes('student')) {
      req.user = {
        id: 'student-001',
        sub: 'student-001',
        username: 'student',
        email: 'student@university.edu',
        role: 'STUDENT',
      };
      return next();
    } else if (token.includes('admin')) {
      req.user = {
        id: 'admin-001',
        sub: 'admin-001',
        username: 'admin',
        email: 'admin@university.edu',
        role: 'ADMIN',
      };
      return next();
    }
  }

  // Parse non-Bearer token format for backwards compatibility
  const token = authHeader.replace('bearer ', '').toLowerCase();

  if (token.includes('teacher')) {
    req.user = {
      id: 'teacher-001',
      sub: 'teacher-001',
      username: 'teacher',
      email: 'teacher@university.edu',
      role: 'TEACHER',
    };
  } else if (token.includes('student')) {
    req.user = {
      id: 'student-001',
      sub: 'student-001',
      username: 'student',
      email: 'student@university.edu',
      role: 'STUDENT',
    };
  } else if (token.includes('admin')) {
    req.user = {
      id: 'admin-001',
      sub: 'admin-001',
      username: 'admin',
      email: 'admin@university.edu',
      role: 'ADMIN',
    };
  } else if (authHeader && !authHeader.startsWith('Bearer ')) {
    // If Authorization header exists but it's not Bearer format and not recognized, deny
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};
