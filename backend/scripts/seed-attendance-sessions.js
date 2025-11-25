import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAttendanceSessions() {
  try {
    console.log('🌱 Seeding attendance sessions...');

    // Get all classes first
    const classes = await prisma.class.findMany({
      take: 3, // Just seed for first 3 classes
    });

    if (classes.length === 0) {
      console.log('❌ No classes found. Please create classes first.');
      process.exit(1);
    }

    for (const classItem of classes) {
      console.log(`\n📚 Seeding sessions for class: ${classItem.id}`);

      // Clear existing sessions for this class
      await prisma.attendanceSession.deleteMany({
        where: { classId: classItem.id },
      });

      // Create sample sessions
      const sessions = [
        {
          subject: 'บรรยาย',
          type: 'lesson',
          startDate: new Date('2025-11-24'),
          endDate: new Date('2025-11-24'),
          status: 'active',
          description: 'บรรยายแรกของเทอม',
          classId: classItem.id,
        },
        {
          subject: 'สอบกลางภาค',
          type: 'midterm',
          startDate: new Date('2025-12-10'),
          endDate: new Date('2025-12-10'),
          status: 'active',
          description: 'สอบกลางภาคช่วงแรก',
          classId: classItem.id,
        },
        {
          subject: 'สอบปลายภาค',
          type: 'final',
          startDate: new Date('2026-01-15'),
          endDate: new Date('2026-01-15'),
          status: 'active',
          description: 'สอบปลายภาคชั่วสุดท้าย',
          classId: classItem.id,
        },
        {
          subject: 'สอบย่อย',
          type: 'quiz',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-01'),
          status: 'completed',
          description: 'สอบย่อยบท 1-3',
          classId: classItem.id,
        },
        {
          subject: 'เก็บคะแนน',
          type: 'collection',
          startDate: new Date('2025-11-30'),
          endDate: new Date('2025-12-05'),
          status: 'active',
          description: 'เก็บคะแนนการบ้าน',
          classId: classItem.id,
        },
      ];

      for (const session of sessions) {
        await prisma.attendanceSession.create({
          data: session,
        });
        console.log(`  ✅ Created: ${session.subject} (${session.type})`);
      }
    }

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding attendance sessions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAttendanceSessions();
