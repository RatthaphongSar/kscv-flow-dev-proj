/**
 * @file auth.test.js
 * @description Unit tests for authentication controller
 * @module tests/unit/controllers/auth
 */

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      cookies: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
  });

  describe('Login', () => {
    test('should successfully login with valid credentials', async () => {
      mockReq.body = {
        username: 'teacher-demo',
        password: 'Teacher123!'
      };

      // Expected behavior:
      // 1. Validate input
      // 2. Find user by username
      // 3. Compare password hash
      // 4. Generate JWT tokens
      // 5. Set auth cookies
      // 6. Return success with user data

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            user: expect.objectContaining({
              id: expect.any(String),
              username: 'teacher-demo',
              role: 'TEACHER'
            })
          })
        })
      );
    });

    test('should reject login with invalid username', async () => {
      mockReq.body = {
        username: 'nonexistent-user',
        password: 'password'
      };

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: expect.stringContaining('Invalid credentials')
        })
      );
    });

    test('should reject login with invalid password', async () => {
      mockReq.body = {
        username: 'teacher-demo',
        password: 'wrongpassword'
      };

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error'
        })
      );
    });

    test('should validate required fields', async () => {
      mockReq.body = { username: 'test' }; // missing password

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('password')
        })
      );
    });
  });

  describe('Refresh Token', () => {
    test('should refresh access token with valid refresh token', async () => {
      mockReq.cookies.refresh_token = 'valid-refresh-token';

      // Expected: New access token
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            access_token: expect.any(String)
          })
        })
      );
    });

    test('should reject expired refresh token', async () => {
      mockReq.cookies.refresh_token = 'expired-token';

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('should reject missing refresh token', async () => {
      mockReq.cookies.refresh_token = undefined;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Logout', () => {
    test('should successfully logout and clear cookies', async () => {
      mockReq.user = { id: '123', username: 'test' };

      // Expected: Clear cookies and return success
      expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Verify Token', () => {
    test('should verify valid JWT token', async () => {
      mockReq.user = {
        id: 'user-123',
        username: 'teacher-demo',
        role: 'TEACHER'
      };

      // Expected: Return user data from token
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'teacher-demo',
            role: 'TEACHER'
          })
        })
      );
    });
  });
});
