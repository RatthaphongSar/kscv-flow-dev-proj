/**
 * @file class.test.js
 * @description Unit tests for class controller
 * @module tests/unit/controllers/class
 */

describe('Class Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user-123', role: 'TEACHER' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('List Classes', () => {
    test('should list all classes for authenticated user', async () => {
      // Expected: Array of classes
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              code: expect.any(String),
              name: expect.any(String),
              semester: expect.any(String),
              students: expect.any(Array)
            })
          ])
        })
      );
    });

    test('should filter classes by semester', async () => {
      mockReq.query = { semester: '1/2025' };

      // Expected: Filtered classes
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              semester: '1/2025'
            })
          ])
        })
      );
    });

    test('should paginate class results', async () => {
      mockReq.query = { page: 2, limit: 10 };

      // Expected: Paginated response
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 2,
            limit: 10,
            total: expect.any(Number)
          })
        })
      );
    });

    test('should require authentication', async () => {
      mockReq.user = null;

      // Expected: 401 Unauthorized
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Get Class Details', () => {
    test('should get class details including members', async () => {
      mockReq.params = { classId: 'class-123' };

      // Expected: Detailed class info
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'class-123',
            code: expect.any(String),
            name: expect.any(String),
            members: expect.any(Array),
            schedule: expect.any(Array),
            capacity: expect.any(Number)
          })
        })
      );
    });

    test('should return 404 for non-existent class', async () => {
      mockReq.params = { classId: 'nonexistent' };

      // Expected: 404 Not Found
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found')
        })
      );
    });
  });

  describe('Create Class', () => {
    test('should create new class (teacher only)', async () => {
      mockReq.body = {
        code: 'CS101',
        name: 'Introduction to Programming',
        section: '1',
        credits: 3,
        capacity: 40
      };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Created class
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'CS101',
            name: 'Introduction to Programming',
            credits: 3
          })
        })
      );
    });

    test('should reject class creation for non-teachers', async () => {
      mockReq.body = { code: 'CS101', name: 'Test' };
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('permission')
        })
      );
    });

    test('should validate required fields', async () => {
      mockReq.body = { code: 'CS101' }; // missing name
      mockReq.user = { role: 'TEACHER' };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('name')
        })
      );
    });

    test('should generate unique class code', async () => {
      mockReq.body = {
        code: 'AUTO',
        name: 'Test Class',
        section: '1'
      };

      // Expected: Auto-generated unique code
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: expect.stringMatching(/^[A-Z0-9]+$/)
          })
        })
      );
    });
  });

  describe('Update Class', () => {
    test('should update class (teacher only)', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.body = { name: 'Updated Name', room: 'A101' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Updated class
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Updated Name',
            room: 'A101'
          })
        })
      );
    });

    test('should reject update for non-teachers', async () => {
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Delete Class', () => {
    test('should delete class and cascade delete related records', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Success response
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('deleted')
        })
      );
    });
  });

  describe('Enroll in Class', () => {
    test('should enroll student in class', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { id: 'student-123', role: 'STUDENT' };

      // Expected: Enrollment successful
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should reject duplicate enrollment', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { id: 'student-123' };

      // Expected: 400 Conflict
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('already enrolled')
        })
      );
    });

    test('should reject enrollment when class is full', async () => {
      mockReq.params = { classId: 'full-class' };

      // Expected: 400 Class full
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('full')
        })
      );
    });
  });

  describe('Join Requests', () => {
    test('should list join requests (teacher only)', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Array of requests
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              studentId: expect.any(String),
              status: expect.stringMatching(/pending|approved|rejected/)
            })
          ])
        })
      );
    });

    test('should reject request list for non-teachers', async () => {
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('should approve join request', async () => {
      mockReq.params = {
        classId: 'class-123',
        requestId: 'req-123'
      };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Request approved and student enrolled
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'approved'
          })
        })
      );
    });
  });
});
