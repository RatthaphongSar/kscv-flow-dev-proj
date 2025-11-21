#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n📝 Enrolling student-demo in all classes...\n');

    const student = await prisma.user.findUnique({
      where: { username: 'student-demo' }
    });

    if (!student) {
      console.error('❌ student-demo not found');
      process.exit(1);
    }

    const classes = await prisma.class.findMany();

    for (const cls of classes) {
      const existing = await prisma.enrollment.findUnique({
        where: {
          classId_studentId: {
            studentId: student.id,
            classId: cls.id
          }
        }
      });

      if (existing) {
        console.log(`✅ Already enrolled: ${cls.code} - ${cls.name}`);
      } else {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: cls.id,
            status: 'active'
          }
        });
        console.log(`✅ Enrolled in: ${cls.code} - ${cls.name}`);
      }
    }

    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
