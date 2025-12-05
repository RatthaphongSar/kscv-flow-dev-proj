/**
 * @file attendance.test.js
 * @description Unit tests for attendance controller
 * @module tests/unit/controllers/attendance
 */

describe('Attendance Controller', () => {
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

  describe('Check-in', () => {
    test('should record attendance check-in', async () => {
      mockReq.body = {
        classId: 'class-123',
        date: '2025-12-06',
        status: 'present'
      };

      // Expected: Attendance recorded
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            classId: 'class-123',
            date: '2025-12-06',
            status: 'present',
            timestamp: expect.any(String)
          })
        })
      );
    });

    test('should record late status', async () => {
      mockReq.body = {
        classId: 'class-123',
        date: '2025-12-06',
        status: 'late'
      };

      // Expected: Late status recorded
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'late'
          })
        })
      );
    });

    test('should allow remark/comment', async () => {
      mockReq.body = {
        classId: 'class-123',
        date: '2025-12-06',
        status: 'absent',
        remark: 'Sick leave submitted'
      };

      // Expected: Remark stored
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            remark: 'Sick leave submitted'
          })
        })
      );
    });

    test('should validate required fields', async () => {
      mockReq.body = {
        classId: 'class-123'
        // missing date and status
      };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('date')
        })
      );
    });

    test('should prevent duplicate check-in same day', async () => {
      // Assume already checked in on 2025-12-06
      mockReq.body = {
        classId: 'class-123',
        date: '2025-12-06',
        status: 'present'
      };

      // Expected: 400 Duplicate
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('already')
        })
      );
    });

    test('should validate status values', async () => {
      mockReq.body = {
        classId: 'class-123',
        date: '2025-12-06',
        status: 'maybe'
      };

      // Expected: 400 Bad Request
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('status')
        })
      );
    });
  });

  describe('My Attendance', () => {
    test('should list user attendance records', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Array of attendance
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              classId: expect.any(String),
              date: expect.any(String),
              status: expect.stringMatching(/present|absent|late/),
              timestamp: expect.any(String)
            })
          ])
        })
      );
    });

    test('should filter by month', async () => {
      mockReq.query = { month: '2025-12' };

      // Expected: Only December records
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              date: expect.stringMatching(/^2025-12/)
            })
          ])
        })
      );
    });

    test('should calculate attendance statistics', async () => {
      mockReq.user = { id: 'user-123' };

      // Expected: Stats included
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            total: expect.any(Number),
            present: expect.any(Number),
            absent: expect.any(Number),
            late: expect.any(Number),
            attendanceRate: expect.any(Number)
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

  describe('Class Attendance', () => {
    test('should list all students attendance (teacher/admin)', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: All students' records
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              studentId: expect.any(String),
              studentName: expect.any(String),
              records: expect.any(Array)
            })
          ])
        })
      );
    });

    test('should not allow student to view class attendance', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { role: 'STUDENT' };

      // Expected: 403 Forbidden
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Attendance Summary', () => {
    test('should get class attendance summary (teacher)', async () => {
      mockReq.params = { classId: 'class-123' };
      mockReq.user = { role: 'TEACHER' };

      // Expected: Summary with statistics
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            classId: 'class-123',
            totalStudents: expect.any(Number),
            averageAttendance: expect.any(Number),
            byStatus: expect.objectContaining({
              present: expect.any(Number),
              absent: expect.any(Number),
              late: expect.any(Number)
            })
          })
        })
      );
    });
  });
});
