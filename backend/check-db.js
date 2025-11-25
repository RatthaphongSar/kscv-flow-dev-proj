import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database state...\n');
    
    // Check classes
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        teacherId: true,
      },
      take: 10,
    });
    
    console.log(`📊 Total Classes: ${classes.length}`);
    if (classes.length > 0) {
      console.log('Classes:');
      classes.forEach(c => {
        console.log(`  - ${c.code}: ${c.name} (ID: ${c.id})`);
      });
    } else {
      console.log('  ❌ No classes found in database!');
    }
    
    // Check users
    console.log('\n');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      take: 5,
    });
    
    console.log(`👥 Total Users: ${users.length}`);
    if (users.length > 0) {
      users.forEach(u => {
        console.log(`  - ${u.username} (${u.role}): ${u.email || 'No email'}`);
      });
    } else {
      console.log('  ❌ No users found!');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
