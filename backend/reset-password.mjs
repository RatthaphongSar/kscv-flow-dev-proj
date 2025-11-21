#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(username, newPassword) {
  try {
    console.log(`\n🔐 Resetting password for ${username}...\n`);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    const user = await prisma.user.update({
      where: { username },
      data: { passwordHash },
      select: { id: true, username: true, role: true, email: true }
    });

    console.log(`✅ Password reset successfully!\n`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   New Password: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get username and password from command line
const username = process.argv[2] || 'student-demo';
const password = process.argv[3] || 'Test@1234';

resetPassword(username, password);
