import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js'

async function main() {
  const username = 'student-123'
  const password = 'kvc2025!'
  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash: hash,
      role: 'STUDENT',
      year: 1,
      major: 'IT',
    }
  })
  console.log('Seed user:', user.username)
}
main().finally(()=>process.exit(0))
