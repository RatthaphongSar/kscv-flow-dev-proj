import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js'

async function createTeacher(username, password, email = null) {
  try {
    const hash = await bcrypt.hash(password, 12)

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        passwordHash: hash,
        role: 'TEACHER',
      },
      create: {
        username,
        passwordHash: hash,
        email,
        role: 'TEACHER',
        year: 0,
        major: 'Teaching',
      },
    })
    console.log('✅ Teacher user created:', user.username, '(ID:', user.id, ')')
    return user
  } catch (err) {
    console.error('❌ Error creating teacher:', err.message)
    throw err
  }
}

async function main() {
  if (process.argv.length < 4) {
    console.error('Usage: node seed-teacher.js <username> <password> [email]')
    console.error('Example: node seed-teacher.js test-aj-123 123456 teacher@example.com')
    process.exit(1)
  }

  const username = process.argv[2]
  const password = process.argv[3]
  const email = process.argv[4] || null

  await createTeacher(username, password, email)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
