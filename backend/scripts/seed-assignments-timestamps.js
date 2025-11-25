import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAssignments() {
  try {
    console.log('🌱 Seeding assignments with timestamps...');

    // Get a teacher from the database
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    });

    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher first.');
      process.exit(1);
    }

    // Get all classes
    const classes = await prisma.class.findMany({
      take: 3,
    });

    if (classes.length === 0) {
      console.log('❌ No classes found. Please create classes first.');
      process.exit(1);
    }

    for (const classItem of classes) {
      console.log(`\n📚 Seeding assignments for class: ${classItem.id}`);

      // Clear existing assignments
      await prisma.assignment.deleteMany({
        where: { classId: classItem.id },
      });

      // Create sample assignments with timestamps
      const now = new Date();
      const assignments = [
        {
          title: 'บทที่ 1: บทนำ',
          description: 'เขียนความเห็นเกี่ยวกับบทนำของวิชา',
          assignmentType: 'homework',
          maxScore: 10,
          assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 วันที่แล้ว
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 วันข้างหน้า
          teacherId: teacher.id,
          classId: classItem.id,
        },
        {
          title: 'โครงการกลุ่ม',
          description: 'ทำโครงการกลุ่มตามหัวข้อที่กำหนด',
          assignmentType: 'project',
          maxScore: 50,
          assignedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 วันที่แล้ว
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 วันข้างหน้า
          teacherId: teacher.id,
          classId: classItem.id,
        },
        {
          title: 'แบบทดสอบ',
          description: 'แบบทดสอบประจำเดือน',
          assignmentType: 'quiz',
          maxScore: 20,
          assignedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 วันที่แล้ว
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 วันข้างหน้า
          teacherId: teacher.id,
          classId: classItem.id,
        },
        {
          title: 'การอ่านเพิ่มเติม',
          description: 'อ่านบท 5-6 และสรุปเนื้อหา',
          assignmentType: 'homework',
          maxScore: 15,
          assignedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // เมื่อวาน
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 วันข้างหน้า
          teacherId: teacher.id,
          classId: classItem.id,
        },
        {
          title: 'การนำเสนอผลงาน',
          description: 'นำเสนอผลงานของกลุ่มต่อหน้าชั้น',
          assignmentType: 'project',
          maxScore: 25,
          assignedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 วันที่แล้ว
          dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // เมื่อวาน (เลยกำหนด)
          teacherId: teacher.id,
          classId: classItem.id,
        },
      ];

      for (const assignment of assignments) {
        await prisma.assignment.create({
          data: assignment,
        });
        console.log(
          `  ✅ Created: "${assignment.title}" (${assignment.assignmentType}) - สั่งให้เมื่อ ${assignment.assignedAt.toLocaleDateString('th-TH')}`
        );
      }
    }

    console.log('\n✨ Assignment seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAssignments();
