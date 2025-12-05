/**
 * @file leave.test.js
 * @description Unit tests for leave controller
 * @module tests/unit/controllers/leave
 */

describe('Leave Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user-123', role: 'STUDENT' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Request Leave', () => {
    test('should submit sick leave request (1 day)', async () => {
      mockReq.body = {
        type: 'sick',
        startDate: '2025-12-10',
        endDate: '2025-12-10'
      };

      // Expected: Leave created with pending status
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'sick',
            startDate: '2025-12-10',
            status: 'pending',
            certificateRequired: false
          })
        })
      );
    });

    test('should flag certificate required for sick leave > 2 days', async () => {
      mockReq.body = {
        type: 'sick',
        startDate: '2025-12-10',
        endDate: '2025-12-13'
      };

      // Expected: Certificate flag set
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certificateRequired: true
          })
        })
      );
    });

    test('should validate leave type', async () => {
      mockReq.body = {
        type: 'invalid-type',
        startDate: '2025-12-10',
        endDate: '2025-12-10'
      };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('type')
        })
      );
    });

    test('should validate date range', async () => {
      mockReq.body = {
        type: 'sick',
        startDate: '2025-12-15',
        endDate: '2025-12-10'
      };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('date')
        })
      );
    });

    test('should enforce leave limits per type', async () => {
      // Personal leave max 7 days
      mockReq.body = {
        type: 'personal',
        startDate: '2025-12-10',
        endDate: '2025-12-20' // 11 days
      };

      // Expected: 400 Exceeds limit
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('limit')
        })
      );
    });

    test('should not allow overlapping leaves', async () => {
      // Assume previous leave exists: 2025-12-10 to 2025-12-12
      mockReq.body = {
        type: 'personal',
        startDate: '2025-12-11',
        endDate: '2025-12-13'
      };

      // Expected: 400 Conflict
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('overlap')
        })
      );
    });
  });

  describe('View My Leaves', () => {
    test('should list user leave requests', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Array of user's leaves
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              type: expect.stringMatching(/sick|personal|ordination|other/),
              status: expect.stringMatching(/pending|approved|rejected/),
              startDate: expect.any(String),
              endDate: expect.any(String)
            })
          ])
        })
      );
    });

    test('should filter leaves by status', async () => {
      mockReq.query = { status: 'approved' };

      // Expected: Only approved leaves
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              status: 'approved'
            })
          ])
        })
      );
    });

    test('should require authentication', async () => {
      mockReq.user = null;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Attach Doctor Certificate', () => {
    test('should attach certificate to leave', async () => {
      mockReq.params = { id: 'leave-123' };
      mockReq.body = { docUrl: 'https://storage.example.com/cert.pdf' };
      mockReq.user = { id: 'user-123' };

      // Expected: Certificate attached
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            docUrl: 'https://storage.example.com/cert.pdf',
            certificateAttached: true
          })
        })
      );
    });

    test('should validate certificate URL', async () => {
      mockReq.params = { id: 'leave-123' };
      mockReq.body = { docUrl: 'invalid-url' };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('URL')
        })
      );
    });
  });

  describe('Approve/Reject Leave', () => {
    test('should approve leave request (advisor/admin)', async () => {
      mockReq.params = { id: 'leave-123' };
      mockReq.body = { status: 'approved', reason: '' };
      mockReq.user = { id: 'advisor-1', role: 'TEACHER' };

      // Expected: Leave approved
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'approved'
          })
        })
      );
    });

    test('should reject leave with reason', async () => {
      mockReq.params = { id: 'leave-123' };
      mockReq.body = {
        status: 'rejected',
        reason: 'Exceeds annual limit'
      };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Leave rejected with reason
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'rejected',
            reason: 'Exceeds annual limit'
          })
        })
      );
    });

    test('should not allow student to approve leaves', async () => {
      mockReq.params = { id: 'leave-123' };
      mockReq.body = { status: 'approved' };
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
