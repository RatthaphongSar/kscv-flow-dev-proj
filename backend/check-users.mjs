import { prisma } from './src/db.js'

async function check() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      passwordHash: true,
      role: true
    }
  })
  
  console.log('Users in DB:')
  users.forEach(u => {
    console.log(`  - ${u.username} (${u.id}): has passwordHash = ${!!u.passwordHash}`)
  })
}

check().catch(console.error).finally(() => process.exit(0))
