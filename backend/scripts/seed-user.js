import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js'

async function main() {
  if (process.argv.length < 4) {
    console.error('Usage: node seed-user.js <username> <password>')
    process.exit(1)
  }
  const username = process.argv[2]
  const password = process.argv[3]
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
