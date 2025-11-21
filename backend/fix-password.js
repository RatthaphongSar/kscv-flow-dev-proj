import { prisma } from './src/db.js'
import bcrypt from 'bcryptjs'

console.log('Checking teacher-demo user...')

const user = await prisma.user.findUnique({
  where: { username: 'teacher-demo' }
})

if (user) {
  console.log(`User: ${user.username}`)
  console.log(`ID: ${user.id}`)
  console.log(`Password hash: ${user.passwordHash}`)
  
  console.log('\nTesting password verification...')
  const testPassword = 'Teacher123!'
  const isValid = await bcrypt.compare(testPassword, user.passwordHash)
  console.log(`Password "${testPassword}" valid: ${isValid}`)
  
  // If invalid, let's hash it again and verify it works
  if (!isValid) {
    console.log('\n⚠️  Password mismatch! Creating new hash...')
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log(`New hash: ${newHash}`)
    
    // Update database with new hash
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    })
    console.log('✅ Updated password hash in database')
    
    // Verify new hash works
    const isValidNew = await bcrypt.compare(testPassword, newHash)
    console.log(`New password "${testPassword}" valid: ${isValidNew}`)
  }
} else {
  console.log('❌ User teacher-demo not found!')
}

await prisma.$disconnect()
