import bcrypt from 'bcryptjs'

const testPassword = 'Teacher123!'
const correctHash = '$2a$10$Ektry/Ugxt6.5wYQg.m0AORmZXqBwFD1aYKEQ9BQ4O7bZvI6mfbSC' // One of the hashes from DB

console.log('Testing bcrypt password verification...')
console.log(`Password: ${testPassword}`)
console.log(`Hash from DB: ${correctHash}`)

const isValid = await bcrypt.compare(testPassword, correctHash)
console.log(`Match result: ${isValid}`)

// Also test hash creation
console.log('\nCreating new hash...')
const newHash = await bcrypt.hash(testPassword, 10)
console.log(`New hash: ${newHash}`)
const isValidNew = await bcrypt.compare(testPassword, newHash)
console.log(`New hash validates: ${isValidNew}`)
