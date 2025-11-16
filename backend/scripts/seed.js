import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js'

async function main() {
  console.log('🌱 Seeding database...')

  // สร้าง teacher
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher-001' },
    update: {},
    create: {
      username: 'teacher-001',
      passwordHash: await bcrypt.hash('kvc2025!', 12),
      email: 'teacher@kvc.edu.th',
      role: 'TEACHER',
      year: 0,
      major: 'Teaching',
    }
  })
  console.log('✅ Teacher created:', teacher.username)

  // สร้าง students
  const students = []
  for (let i = 1; i <= 3; i++) {
    const student = await prisma.user.upsert({
      where: { username: `student-${i}` },
      update: {},
      create: {
        username: `student-${i}`,
        passwordHash: await bcrypt.hash('kvc2025!', 12),
        email: `student${i}@kvc.edu.th`,
        role: 'STUDENT',
        year: 1,
        major: 'IT',
      }
    })
    students.push(student)
    console.log(`✅ Student created: ${student.username}`)
  }

  // สร้างห้องแชท
  const room = await prisma.room.upsert({
    where: { name: 'IT Class - Year 1' },
    update: {},
    create: {
      name: 'IT Class - Year 1',
      type: 'group',
      members: {
        create: [
          { userId: teacher.id },
          ...students.map(s => ({ userId: s.id }))
        ]
      }
    },
    include: {
      members: true
    }
  })
  console.log('✅ Room created:', room.name)

  // สร้าง messages
  for (let i = 1; i <= 5; i++) {
    await prisma.message.create({
      data: {
        content: `Test message ${i}`,
        type: 'text',
        userId: students[i % students.length].id,
        roomId: room.id,
      }
    })
  }
  console.log('✅ 5 messages created')

  console.log('✨ Seeding complete!')
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
