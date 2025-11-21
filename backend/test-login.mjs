import { prisma } from './src/db.js'
import bcrypt from 'bcryptjs'

async function testLogin() {
  try {
    const username = 'teacher'
    const password = 'password123'
    
    console.log(`Testing login for user: ${username}`)
    
    const user = await prisma.user.findUnique({ where: { username } })
    console.log(`Found user: ${user ? user.id + ' (' + user.username + ')' : 'NOT FOUND'}`)
    
    if (!user) {
      console.log('ERROR: User not found')
      return
    }
    
    console.log(`User has passwordHash: ${!!user.passwordHash}`)
    
    if (!user.passwordHash) {
      console.log('ERROR: No password hash')
      return
    }
    
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    console.log(`Password matches: ${passwordValid}`)
    
    if (passwordValid) {
      console.log('✅ LOGIN SUCCESSFUL')
    } else {
      console.log('❌ PASSWORD INCORRECT')
    }
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    process.exit(0)
  }
}

testLogin()
