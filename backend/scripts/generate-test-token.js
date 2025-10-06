import jwt from 'jsonwebtoken';

// ข้อมูลทดสอบ
const testUser = {
  sub: 'student-123',
  role: 'STUDENT',
  username: 'testuser',
  year: 2025,
  major: 'CS'
};

// สร้าง token
const token = jwt.sign(testUser, process.env.JWT_ACCESS_SECRET || 'your-secret-key');
console.log('Test JWT Token:');
console.log(token);