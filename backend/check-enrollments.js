import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking class enrollments...\n');
  
  const classes = await prisma.class.findMany({
    include: {
      students: {
        select: {
          id: true,
          status: true,
          studentId: true,
          student: { select: { username: true } }
        }
      }
    }
  });
  
  classes.forEach(cls => {
    console.log(`📚 ${cls.code} - ${cls.name}:`);
    if (cls.students.length === 0) {
      console.log('   ✅ No enrollments (correct!)');
    } else {
      console.log(`   ⚠️  ${cls.students.length} enrollment(s):`);
      cls.students.forEach(e => {
        console.log(`      - ${e.student.username} (Status: ${e.status})`);
      });
    }
    console.log('');
  });
  
  await prisma.$disconnect();
}

main();
