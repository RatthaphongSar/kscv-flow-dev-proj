import { prisma } from './src/db.js'
import bcrypt from 'bcryptjs'

async function updatePasswords() {
  try {
    const password = 'password123'
    const hash = await bcrypt.hash(password, 10)
    
    console.log('New hash:', hash)
    console.log('Updating user passwords...')
    
    const users = ['teacher', 'student1', 'student2']
    
    for (const username of users) {
      const updated = await prisma.user.update({
        where: { username },
        data: { passwordHash: hash }
      })
      console.log(`✓ Updated ${username}`)
    }
    
    console.log('✅ All users updated')
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    process.exit(0)
  }
}

updatePasswords()
