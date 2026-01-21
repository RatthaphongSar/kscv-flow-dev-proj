import { prisma } from '../src/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding test data...');

  try {
    // Hash passwords for test users
    // Teacher demo: teacher-demo / Teacher123!
    const teacherHash = await bcrypt.hash('Teacher123!', 10);
    // Student demo: student-demo / Student123!
    const studentHash = await bcrypt.hash('Student123!', 10);

    // Create test users matching Login.jsx quick fill buttons
    const teacher = await prisma.user.upsert({
      where: { id: 'teacher-001' },
      update: { 
        username: 'teacher-demo',
        passwordHash: teacherHash 
      },
      create: {
        id: 'teacher-001',
        username: 'teacher-demo',
        email: 'teacher@university.edu',
        role: 'TEACHER',
        passwordHash: teacherHash,
      },
    });
    console.log('✅ Teacher user created:', teacher.id);

    const student1 = await prisma.user.upsert({
      where: { id: 'student-001' },
      update: { 
        username: 'student-demo',
        passwordHash: studentHash 
      },
      create: {
        id: 'student-001',
        username: 'student-demo',
        email: 'student1@university.edu',
        role: 'STUDENT',
        year: 1,
        major: 'English',
        passwordHash: studentHash,
      },
    });
    console.log('✅ Student 1 created:', student1.id);

    const student2 = await prisma.user.upsert({
      where: { id: 'student-002' },
      update: { 
        username: 'student-second',
        passwordHash: studentHash 
      },
      create: {
        id: 'student-002',
        username: 'student-second',
        email: 'student2@university.edu',
        role: 'STUDENT',
        year: 1,
        major: 'English',
        passwordHash: studentHash,
      },
    });
    console.log('✅ Student 2 created:', student2.id);

    // Create or update test class
    const testClass = await prisma.class.upsert({
      where: { 
        code_section_semester: {
          code: 'ENG-101',
          section: '1',
          semester: '1/2567',
        }
      },
      update: { teacherId: teacher.id },
      create: {
        code: 'ENG-101',
        name: 'English Fundamentals',
        section: '1',
        credits: 3,
        semester: '1/2567',
        room: 'A101',
        capacity: 30,
        teacherId: teacher.id,
      },
    });
    console.log('✅ Test class created/updated:', testClass.id);

    // Enroll students (skip if already enrolled)
    await prisma.enrollment.upsert({
      where: {
        classId_studentId: {
          classId: testClass.id,
          studentId: student1.id,
        }
      },
      update: { status: 'active' },
      create: {
        studentId: student1.id,
        classId: testClass.id,
        status: 'active',
      },
    });
    console.log('✅ Student 1 enrolled');

    await prisma.enrollment.upsert({
      where: {
        classId_studentId: {
          classId: testClass.id,
          studentId: student2.id,
        }
      },
      update: { status: 'active' },
      create: {
        studentId: student2.id,
        classId: testClass.id,
        status: 'active',
      },
    });
    console.log('✅ Student 2 enrolled');

    console.log('\n✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch(console.error);
