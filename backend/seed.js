import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Create teacher user
    const teacherPassword = await bcrypt.hash('password123', 10);
    const teacher = await prisma.user.create({
      data: {
        username: 'teacher1',
        email: 'teacher@example.com',
        passwordHash: teacherPassword,
        role: 'TEACHER',
        year: 0,
        major: 'Computer Science',
      },
    });
    console.log(`✅ Created teacher: ${teacher.username}`);

    // Create student users
    const studentPassword = await bcrypt.hash('password123', 10);
    const student1 = await prisma.user.create({
      data: {
        username: 'student1',
        email: 'student1@example.com',
        passwordHash: studentPassword,
        role: 'STUDENT',
        year: 1,
        major: 'Computer Science',
      },
    });
    console.log(`✅ Created student: ${student1.username}`);

    const student2 = await prisma.user.create({
      data: {
        username: 'student2',
        email: 'student2@example.com',
        passwordHash: studentPassword,
        role: 'STUDENT',
        year: 2,
        major: 'Computer Science',
      },
    });
    console.log(`✅ Created student: ${student2.username}`);

    // Create classes
    const class1 = await prisma.class.create({
      data: {
        code: 'CS101',
        name: 'Introduction to Programming',
        section: '1',
        semester: '1/2025',
        credits: 3,
        teacherId: teacher.id,
        capacity: 40,
      },
    });
    console.log(`✅ Created class: ${class1.code} - ${class1.name}`);

    const class2 = await prisma.class.create({
      data: {
        code: 'CS102',
        name: 'Data Structures',
        section: '1',
        semester: '1/2025',
        credits: 3,
        teacherId: teacher.id,
        capacity: 35,
      },
    });
    console.log(`✅ Created class: ${class2.code} - ${class2.name}`);

    const class3 = await prisma.class.create({
      data: {
        code: 'CS201',
        name: 'Web Development',
        section: '1',
        semester: '1/2025',
        credits: 3,
        teacherId: teacher.id,
        capacity: 30,
      },
    });
    console.log(`✅ Created class: ${class3.code} - ${class3.name}`);

    // Enroll student1 in class1
    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        classId: class1.id,
      },
    });
    console.log(`✅ Enrolled ${student1.username} in ${class1.code}`);

    // Create schedule for class1
    await prisma.schedule.create({
      data: {
        classId: class1.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
        room: '101',
      },
    });
    console.log(`✅ Created schedule for ${class1.code}`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Teachers: 1`);
    console.log(`   - Students: 2`);
    console.log(`   - Classes: 3`);
    console.log(`   - Enrollments: 1`);
    console.log('\n🔐 Login credentials:');
    console.log(`   Teacher: teacher1 / password123`);
    console.log(`   Student1: student1 / password123`);
    console.log(`   Student2: student2 / password123`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
