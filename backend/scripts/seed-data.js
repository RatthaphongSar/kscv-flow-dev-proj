/**
 * Seed script for KVC chat system
 * Creates test users, rooms, and relationships
 */

import { prisma } from '../src/db.js'
import bcrypt from 'bcrypt'

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data (optional - remove if you want to keep existing data)
  // await prisma.roomPin.deleteMany({})
  // await prisma.roomMember.deleteMany({})
  // await prisma.message.deleteMany({})
  // await prisma.room.deleteMany({})
  // await prisma.user.deleteMany({})

  // 1. Create test users
  console.log('👤 Creating users...')
  
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      email: 'teacher@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'TEACHER',
    },
  })
  console.log(`✓ Teacher created: ${teacher.id}`)

  const student1 = await prisma.user.upsert({
    where: { username: 'student1' },
    update: {},
    create: {
      username: 'student1',
      email: 'student1@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'STUDENT',
    },
  })
  console.log(`✓ Student 1 created: ${student1.id}`)

  const student2 = await prisma.user.upsert({
    where: { username: 'student2' },
    update: {},
    create: {
      username: 'student2',
      email: 'student2@test.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'STUDENT',
    },
  })
  console.log(`✓ Student 2 created: ${student2.id}`)

  // 2. Create test rooms
  console.log('🚀 Creating rooms...')
  
  const room1 = await prisma.room.upsert({
    where: { name: 'General Discussion' },
    update: {},
    create: {
      name: 'General Discussion',
      type: 'PUBLIC',
    },
  })
  console.log(`✓ Room 1 created: ${room1.id}`)

  const room2 = await prisma.room.upsert({
    where: { name: 'Math Class' },
    update: {},
    create: {
      name: 'Math Class',
      type: 'PUBLIC',
    },
  })
  console.log(`✓ Room 2 created: ${room2.id}`)

  const room3 = await prisma.room.upsert({
    where: { name: 'Project Team A' },
    update: {},
    create: {
      name: 'Project Team A',
      type: 'PRIVATE',
    },
  })
  console.log(`✓ Room 3 created: ${room3.id}`)

  const room4 = await prisma.room.upsert({
    where: { name: 'English Literature' },
    update: {},
    create: {
      name: 'English Literature',
      type: 'PUBLIC',
    },
  })
  console.log(`✓ Room 4 created: ${room4.id}`)

  // 3. Add members to rooms
  console.log('👥 Adding room members...')
  
  // Room 1 - General Discussion: teacher + both students
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room1.id, userId: teacher.id } },
    update: {},
    create: { roomId: room1.id, userId: teacher.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room1.id, userId: student1.id } },
    update: {},
    create: { roomId: room1.id, userId: student1.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room1.id, userId: student2.id } },
    update: {},
    create: { roomId: room1.id, userId: student2.id },
  })
  console.log('✓ Members added to Room 1')

  // Room 2 - Math Class: teacher + both students
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room2.id, userId: teacher.id } },
    update: {},
    create: { roomId: room2.id, userId: teacher.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room2.id, userId: student1.id } },
    update: {},
    create: { roomId: room2.id, userId: student1.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room2.id, userId: student2.id } },
    update: {},
    create: { roomId: room2.id, userId: student2.id },
  })
  console.log('✓ Members added to Room 2')

  // Room 3 - Project Team A: teacher + student1 only (private)
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room3.id, userId: teacher.id } },
    update: {},
    create: { roomId: room3.id, userId: teacher.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room3.id, userId: student1.id } },
    update: {},
    create: { roomId: room3.id, userId: student1.id },
  })
  console.log('✓ Members added to Room 3')

  // Room 4 - English Literature: teacher + student2 only
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room4.id, userId: teacher.id } },
    update: {},
    create: { roomId: room4.id, userId: teacher.id },
  })
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room4.id, userId: student2.id } },
    update: {},
    create: { roomId: room4.id, userId: student2.id },
  })
  console.log('✓ Members added to Room 4')

  // 4. Create sample pinned rooms (student1 pins some rooms)
  console.log('📌 Creating sample pinned rooms...')
  
  await prisma.roomPin.upsert({
    where: { roomId_userId: { roomId: room1.id, userId: student1.id } },
    update: {},
    create: {
      roomId: room1.id,
      userId: student1.id,
      pinnedAt: new Date(),
    },
  })
  console.log('✓ Student 1 pinned Room 1')

  await prisma.roomPin.upsert({
    where: { roomId_userId: { roomId: room3.id, userId: student1.id } },
    update: {},
    create: {
      roomId: room3.id,
      userId: student1.id,
      pinnedAt: new Date(),
    },
  })
  console.log('✓ Student 1 pinned Room 3')

  // student2 pins rooms
  await prisma.roomPin.upsert({
    where: { roomId_userId: { roomId: room2.id, userId: student2.id } },
    update: {},
    create: {
      roomId: room2.id,
      userId: student2.id,
      pinnedAt: new Date(),
    },
  })
  console.log('✓ Student 2 pinned Room 2')

  // 6. Print summary
  console.log('')
  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Users:')
  console.log(`  • Teacher: teacher@test.com`)
  console.log(`  • Student 1: student1@test.com`)
  console.log(`  • Student 2: student2@test.com`)
  console.log('')
  console.log('🚀 Rooms:')
  console.log(`  • Room 1: General Discussion (all members)`)
  console.log(`  • Room 2: Math Class (all members)`)
  console.log(`  • Room 3: Project Team A (teacher + student1)`)
  console.log(`  • Room 4: English Literature (teacher + student2)`)
  console.log('')
  console.log('📌 Pinned Rooms:')
  console.log(`  • Student 1: Room 1, Room 3`)
  console.log(`  • Student 2: Room 2`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('🔑 Test Login Credentials:')
  console.log(`  Email: teacher@test.com | Password: password123`)
  console.log(`  Email: student1@test.com | Password: password123`)
  console.log(`  Email: student2@test.com | Password: password123`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
