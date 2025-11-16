import { prisma } from '../src/db.js'
import bcrypt from 'bcrypt'

async function main() {
  console.log('🔄 Updating users...')

  // Update teacher-001 role to TEACHER
  const teacher001 = await prisma.user.update({
    where: { username: 'teacher-001' },
    data: { role: 'TEACHER' }
  })
  console.log(`✓ Updated teacher-001 role: ${teacher001.role}`)

  // Update teacher-001 password
  const newPassword = await bcrypt.hash('password123', 10)
  const updated = await prisma.user.update({
    where: { username: 'teacher-001' },
    data: { passwordHash: newPassword }
  })
  console.log(`✓ Updated teacher-001 password`)

  // Update student-123 password
  const studentPassword = await bcrypt.hash('password123', 10)
  const student = await prisma.user.update({
    where: { username: 'student-123' },
    data: { passwordHash: studentPassword }
  })
  console.log(`✓ Updated student-123 password`)

  console.log('')
  console.log('✅ Users updated successfully!')
  console.log('')
  console.log('🔑 Updated Login Credentials:')
  console.log(`  Username: teacher-001 | Password: password123 | Role: TEACHER`)
  console.log(`  Username: student-123 | Password: password123 | Role: STUDENT`)
  console.log(`  Username: teacher | Password: password123 | Role: TEACHER`)
  console.log(`  Username: student1 | Password: password123 | Role: STUDENT`)
  console.log(`  Username: student2 | Password: password123 | Role: STUDENT`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
