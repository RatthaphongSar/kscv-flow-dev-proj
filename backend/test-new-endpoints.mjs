import http from 'http'

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token' // Mock auth for testing
      }
    }
    
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function test() {
  console.log('🧪 Testing New API Endpoints...\n')
  
  try {
    // 1. Test login
    console.log('1️⃣  Testing Login...')
    const loginRes = await request('POST', '/api/auth/login', {
      username: 'teacher',
      password: 'password123'
    })
    console.log(`   Status: ${loginRes.status}`)
    console.log(`   User: ${loginRes.data.username} (${loginRes.data.role})`)
    console.log()
    
    // 2. Test join requests endpoint (should be 404 or error if not implemented)
    console.log('2️⃣  Testing New Enrollment Endpoints...')
    const enrollRes = await request('GET', '/api/classes/enrollment/join-requests/test-class-id')
    console.log(`   GET /api/classes/enrollment/join-requests: ${enrollRes.status}`)
    console.log(`   Response: ${JSON.stringify(enrollRes.data).substring(0, 100)}...`)
    console.log()
    
    // 3. Test materials endpoint
    console.log('3️⃣  Testing New Materials Endpoints...')
    const matRes = await request('GET', '/api/classes/materials/test-class-id')
    console.log(`   GET /api/classes/materials: ${matRes.status}`)
    console.log(`   Response: ${JSON.stringify(matRes.data).substring(0, 100)}...`)
    console.log()
    
    // 4. Test assignment submission endpoint
    console.log('4️⃣  Testing New Assignment Endpoints...')
    const assignRes = await request('GET', '/api/assignments/test-assign-id/my-submission')
    console.log(`   GET /api/assignments/:id/my-submission: ${assignRes.status}`)
    console.log(`   Response: ${JSON.stringify(assignRes.data).substring(0, 100)}...`)
    console.log()
    
    console.log('✅ API Endpoints Test Complete')
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
  
  process.exit(0)
}

test()
