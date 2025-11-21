import { prisma } from './src/db.js'

console.log('Testing database connection...')

try {
  const users = await prisma.user.findMany()
  console.log('✅ Database connected!')
  console.log('Total users:', users.length)
  console.log('Users:')
  users.forEach(u => {
    console.log(`  - ${u.id}: ${u.username} (${u.role}) - email: ${u.email}`)
  })
} catch (error) {
  console.error('❌ Database error:', error.message)
}

await prisma.$disconnect()
