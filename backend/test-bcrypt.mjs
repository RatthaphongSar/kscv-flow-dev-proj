import bcrypt from 'bcryptjs'

async function test() {
  try {
    const password = 'password123'
    const hash = await bcrypt.hash(password, 10)
    console.log('Generated hash:', hash)
    
    const match = await bcrypt.compare(password, hash)
    console.log('Password matches:', match)
  } catch (e) {
    console.error('Error:', e.message)
  }
}

test()
