#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔍 Checking Database...\n');

    // Get users
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        createdAt: true
      }
    });

    console.log('👥 Users in Database:');
    console.log(`   Total: ${users.length}\n`);
    
    if (users.length > 0) {
      users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username} (${u.role}) - ${u.email || 'no email'}`);
      });
    } else {
      console.log('   ⚠️  No users found!');
    }

    // Get classes
    const classes = await prisma.class.findMany({
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
        teacherId: true,
        createdAt: true
      }
    });

    console.log(`\n📚 Classes in Database:`);
    console.log(`   Total: ${classes.length}\n`);

    if (classes.length > 0) {
      classes.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.code} - ${c.name}`);
      });
    } else {
      console.log('   ⚠️  No classes found!');
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        classId: true,
        status: true
      }
    });

    console.log(`\n📋 Enrollments in Database:`);
    console.log(`   Total: ${enrollments.length}\n`);

    // Get join requests
    const joinRequests = await prisma.joinRequest.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        classId: true,
        status: true
      }
    });

    console.log(`✋ Join Requests in Database:`);
    console.log(`   Total: ${joinRequests.length}\n`);

    // Summary
    console.log('\n✅ Database Connection: OK\n');

  } catch (error) {
    console.error('\n❌ Database Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
