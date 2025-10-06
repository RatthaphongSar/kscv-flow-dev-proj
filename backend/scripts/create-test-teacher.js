import jwt from 'jsonwebtoken';
import { prisma } from '../src/db.js';

async function createTeacherAndToken() {
  // สร้าง teacher user
  const teacher = await prisma.user.create({
    data: {
      id: 'teacher-123',
      username: 'teachertest',
      passwordHash: 'dummy-hash',  // ในสถานการณ์จริงควรใช้ bcrypt hash
      role: 'TEACHER',
      year: 2025,
      major: 'CS'
    }
  });

  // สร้าง token สำหรับ teacher
  const teacherToken = jwt.sign({
    sub: teacher.id,
    role: teacher.role,
    username: teacher.username,
    year: teacher.year,
    major: teacher.major
  }, process.env.JWT_ACCESS_SECRET || 'your-secret-key');

  console.log('Teacher created with id:', teacher.id);
  console.log('Teacher JWT Token:');
  console.log(teacherToken);
}

createTeacherAndToken()
  .catch(console.error)
  .finally(() => prisma.$disconnect());