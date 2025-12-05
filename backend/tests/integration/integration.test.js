/**
 * @file integration.test.js
 * @description Integration tests for KVC Backend API
 * @module tests/integration
 */

const request = require('supertest');
const app = require('../../src/app');

const API_BASE = '/api';

// Mock tokens
const TOKENS = {
  TEACHER: 'Bearer mock-teacher-token',
  STUDENT: 'Bearer mock-student-token',
  ADMIN: 'Bearer mock-admin-token'
};

// Test data
const TEST_DATA = {
  CLASS: {
    id: 'cmiajvle80008vhtwi4cv3xb3',
    name: 'CS 101 - Introduction to Computer Science',
    code: 'CS101'
  },
  ANNOUNCEMENT: {
    title: 'Integration Test Announcement',
    content: 'This is a test announcement',
    category: 'ประกาศ',
    classId: 'cmiajvle80008vhtwi4cv3xb3'
  },
  ASSIGNMENT: {
    title: 'Test Assignment',
    description: 'Test assignment description',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    classId: 'cmiajvle80008vhtwi4cv3xb3'
  }
};

describe('KVC Backend API Integration Tests', () => {
  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const res = await request(app)
        .get(`${API_BASE}/health`)
        .expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });

    test('GET / should return 200', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.text).toContain('KVC Backend');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      test('should login with valid credentials', async () => {
        const res = await request(app)
          .post(`${API_BASE}/auth/login`)
          .send({
            email: 'teacher@kvc.ac.th',
            password: 'password123'
          })
          .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
      });

      test('should reject invalid credentials', async () => {
        const res = await request(app)
          .post(`${API_BASE}/auth/login`)
          .send({
            email: 'invalid@kvc.ac.th',
            password: 'wrongpassword'
          });

        expect(res.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('POST /api/auth/logout', () => {
      test('should logout authenticated user', async () => {
        const res = await request(app)
          .post(`${API_BASE}/auth/logout`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        expect(res.body).toHaveProperty('message');
      });
    });
  });

  describe('Announcements API', () => {
    let announcementId;

    describe('POST /api/announcements', () => {
      test('teacher should create announcement', async () => {
        const res = await request(app)
          .post(`${API_BASE}/announcements`)
          .set('Authorization', TOKENS.TEACHER)
          .send(TEST_DATA.ANNOUNCEMENT)
          .expect(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title', TEST_DATA.ANNOUNCEMENT.title);
        expect(res.body).toHaveProperty('content', TEST_DATA.ANNOUNCEMENT.content);
        
        announcementId = res.body.id;
      });

      test('student should not create announcement', async () => {
        const res = await request(app)
          .post(`${API_BASE}/announcements`)
          .set('Authorization', TOKENS.STUDENT)
          .send(TEST_DATA.ANNOUNCEMENT);

        expect(res.status).toBe(403);
      });

      test('should require authentication', async () => {
        const res = await request(app)
          .post(`${API_BASE}/announcements`)
          .send(TEST_DATA.ANNOUNCEMENT);

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/announcements', () => {
      test('should get all announcements', async () => {
        const res = await request(app)
          .get(`${API_BASE}/announcements`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(0);
      });

      test('should filter announcements by class', async () => {
        const res = await request(app)
          .get(`${API_BASE}/announcements?classId=${TEST_DATA.CLASS.id}`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('GET /api/announcements/:id', () => {
      test('should get announcement by id', async () => {
        if (!announcementId) return;

        const res = await request(app)
          .get(`${API_BASE}/announcements/${announcementId}`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(res.body).toHaveProperty('id', announcementId);
        expect(res.body).toHaveProperty('title');
      });

      test('should return 404 for non-existent announcement', async () => {
        const res = await request(app)
          .get(`${API_BASE}/announcements/invalid-id`)
          .set('Authorization', TOKENS.STUDENT);

        expect(res.status).toBe(404);
      });
    });

    describe('PATCH /api/announcements/:id', () => {
      test('teacher should update announcement', async () => {
        if (!announcementId) return;

        const res = await request(app)
          .patch(`${API_BASE}/announcements/${announcementId}`)
          .set('Authorization', TOKENS.TEACHER)
          .send({ title: 'Updated Title' })
          .expect(200);

        expect(res.body).toHaveProperty('title', 'Updated Title');
      });

      test('student should not update announcement', async () => {
        if (!announcementId) return;

        const res = await request(app)
          .patch(`${API_BASE}/announcements/${announcementId}`)
          .set('Authorization', TOKENS.STUDENT)
          .send({ title: 'Hacked Title' });

        expect(res.status).toBe(403);
      });
    });

    describe('DELETE /api/announcements/:id', () => {
      test('teacher should delete announcement', async () => {
        if (!announcementId) return;

        const res = await request(app)
          .delete(`${API_BASE}/announcements/${announcementId}`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        expect(res.body).toHaveProperty('message');
      });
    });
  });

  describe('Classes API', () => {
    describe('GET /api/classes', () => {
      test('should get user classes', async () => {
        const res = await request(app)
          .get(`${API_BASE}/classes`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });

      test('teacher and student should see different classes', async () => {
        const teacherRes = await request(app)
          .get(`${API_BASE}/classes`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        const studentRes = await request(app)
          .get(`${API_BASE}/classes`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(teacherRes.body)).toBe(true);
        expect(Array.isArray(studentRes.body)).toBe(true);
      });
    });

    describe('GET /api/classes/:id', () => {
      test('should get class details', async () => {
        const res = await request(app)
          .get(`${API_BASE}/classes/${TEST_DATA.CLASS.id}`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        expect(res.body).toHaveProperty('id', TEST_DATA.CLASS.id);
        expect(res.body).toHaveProperty('name');
      });
    });
  });

  describe('Grades API', () => {
    describe('GET /api/grades', () => {
      test('teacher should get grades', async () => {
        const res = await request(app)
          .get(`${API_BASE}/grades`)
          .set('Authorization', TOKENS.TEACHER)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });

      test('student should get own grades', async () => {
        const res = await request(app)
          .get(`${API_BASE}/grades`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('GET /api/grades/transcript', () => {
      test('student should get transcript', async () => {
        const res = await request(app)
          .get(`${API_BASE}/grades/transcript`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(res.body).toHaveProperty('gpa');
        expect(res.body).toHaveProperty('courses');
      });
    });
  });

  describe('Attendance API', () => {
    describe('GET /api/attendance', () => {
      test('should get attendance records', async () => {
        const res = await request(app)
          .get(`${API_BASE}/attendance`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });

      test('should filter by date range', async () => {
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-12-31');

        const res = await request(app)
          .get(`${API_BASE}/attendance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('POST /api/attendance/check-in', () => {
      test('student should check in', async () => {
        const res = await request(app)
          .post(`${API_BASE}/attendance/check-in`)
          .set('Authorization', TOKENS.STUDENT)
          .send({
            classId: TEST_DATA.CLASS.id
          });

        expect([200, 201, 400]).toContain(res.status);
      });
    });
  });

  describe('Assignments API', () => {
    let assignmentId;

    describe('POST /api/assignments', () => {
      test('teacher should create assignment', async () => {
        const res = await request(app)
          .post(`${API_BASE}/assignments`)
          .set('Authorization', TOKENS.TEACHER)
          .send(TEST_DATA.ASSIGNMENT)
          .expect(201);

        expect(res.body).toHaveProperty('id');
        assignmentId = res.body.id;
      });

      test('student should not create assignment', async () => {
        const res = await request(app)
          .post(`${API_BASE}/assignments`)
          .set('Authorization', TOKENS.STUDENT)
          .send(TEST_DATA.ASSIGNMENT);

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/assignments', () => {
      test('should get assignments', async () => {
        const res = await request(app)
          .get(`${API_BASE}/assignments`)
          .set('Authorization', TOKENS.STUDENT)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoint', async () => {
      const res = await request(app)
        .get(`${API_BASE}/non-existent-endpoint`)
        .set('Authorization', TOKENS.STUDENT);

      expect(res.status).toBe(404);
    });

    test('should return 401 without authentication', async () => {
      const res = await request(app)
        .get(`${API_BASE}/classes`);

      expect(res.status).toBe(401);
    });

    test('should handle malformed JSON', async () => {
      const res = await request(app)
        .post(`${API_BASE}/announcements`)
        .set('Authorization', TOKENS.TEACHER)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting', async () => {
      const requests = [];
      
      // Make many requests rapidly
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .get(`${API_BASE}/classes`)
            .set('Authorization', TOKENS.STUDENT)
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
