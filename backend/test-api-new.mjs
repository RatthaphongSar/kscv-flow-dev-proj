import axios from 'axios'
import jwt from 'jsonwebtoken'

const api = axios.create({
  baseURL: 'http://localhost:4001/api'
})

// Create mock JWT token for testing (same as would be issued by login)
function createMockToken() {
  const secret = process.env.JWT_ACCESS_SECRET || 'sk_access_super_secret_key_2025_kvc_auth_token_access_v1'
  return jwt.sign(
    { 
      sub: 'teacher-001',
      username: 'teacher',
      role: 'TEACHER',
      year: 1,
      major: 'General'
    },
    secret,
    { expiresIn: '1h' }
  )
}

async function testAPI() {
  try {
    // ใช้ Bearer token ที่ simple สำหรับ dev
    const token = 'bearer-token-teacher'
    
    // Set default auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Test 1: Get all classes
    console.log('\n📝 Test 1: Get classes')
    console.log('─'.repeat(50))
    
    const classRes = await api.get('/classes')
    console.log('✅ Classes retrieved')
    console.log('Count:', classRes.data.length)
    if (classRes.data.length > 0) {
      console.log('Sample:', classRes.data.slice(0, 1))
    }
    
    // Test 2: Create class
    console.log('\n📝 Test 2: Create class')
    console.log('─'.repeat(50))
    
    const uniqueCode = `CS${Math.random().toString().slice(2, 5)}`
    const createRes = await api.post('/classes', {
      code: uniqueCode,
      name: 'Introduction to Computer Science',
      section: '1',
      credits: 3,
      semester: 'Fall 2025',
      room: 'Room 101',
      capacity: 30
    })
    
    console.log('✅ Class created')
    console.log('Full response:', createRes.data)
    const classId = createRes.data.id || createRes.data.data?.id
    console.log('Class ID:', classId)
    
    // Test 3: Get join requests
    console.log('\n📝 Test 3: Get join requests for class')
    console.log('─'.repeat(50))
    
    const joinReqRes = await api.get(`/classes/enrollment/${classId}/join-requests`)
    console.log('✅ Join requests retrieved')
    console.log('Count:', joinReqRes.data.length)
    
    // Test 4: Get teaching materials
    console.log('\n📝 Test 4: Get materials for class')
    console.log('─'.repeat(50))
    
    const matsRes = await api.get(`/classes/materials/${classId}`)
    console.log('✅ Materials retrieved')
    console.log('Count:', matsRes.data.length)
    
    console.log('\n✅ All tests passed!')
    
  } catch (e) {
    console.error('\n❌ Error:', e.message)
    if (e.response) {
      console.error('Status:', e.response.status)
      console.error('Data:', e.response.data)
    }
  }
}

testAPI()
