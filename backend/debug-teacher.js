import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking teacher1 and their classes...\n');
  
  const teacher = await prisma.user.findUnique({
    where: { username: 'teacher1' },
  });
  
  if (!teacher) {
    console.log('❌ Teacher not found!');
    process.exit(1);
  }
  
  console.log(`✅ Found teacher: ${teacher.username} (ID: ${teacher.id})`);
  console.log(`   Email: ${teacher.email}`);
  console.log(`   Role: ${teacher.role}\n`);
  
  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id },
    include: {
      teacher: { select: { id: true, username: true } },
      _count: {
        select: {
          students: true,
        },
      },
    },
  });
  
  console.log(`📚 Classes taught by ${teacher.username}:`);
  if (classes.length === 0) {
    console.log('   ❌ No classes found!');
  } else {
    classes.forEach((cls) => {
      console.log(`   ✅ ${cls.code} - ${cls.name}`);
      console.log(`      Section: ${cls.section}, Semester: ${cls.semester}`);
      console.log(`      Students: ${cls._count.students}`);
    });
  }
  
  await prisma.$disconnect();
}

main();
