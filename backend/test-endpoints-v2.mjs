import http from 'http'

let accessToken = null

async function request(method, path, body = null, includeAuth = true) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (includeAuth && accessToken) {
      options.headers['Cookie'] = `access_token=${accessToken}`
    }
    
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    
    req.on('error', (e) => {
      console.error('Request error:', e.message)
      reject(e)
    })
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
    }, false)
    console.log(`   Status: ${loginRes.status}`)
    if (loginRes.status === 200) {
      console.log(`   ✅ User: ${loginRes.data.username} (${loginRes.data.role})`)
      // Extract access token from cookies
      const setCookie = loginRes.headers['set-cookie']
      if (setCookie) {
        const tokenMatch = setCookie.find(c => c.includes('access_token'))
        if (tokenMatch) {
          accessToken = tokenMatch.split('access_token=')[1].split(';')[0]
          console.log(`   ✅ Token obtained: ${accessToken.substring(0, 20)}...`)
        }
      }
    } else {
      console.log(`   ❌ Login failed: ${loginRes.data.error}`)
    }
    console.log()
    
    // 2. Test join requests endpoint
    console.log('2️⃣  Testing Join Requests Endpoint...')
    const enrollRes = await request('GET', '/api/classes/enrollment/test-class-id/join-requests')
    console.log(`   GET /api/classes/enrollment/:classId/join-requests: ${enrollRes.status}`)
    if (enrollRes.status === 200) {
      console.log(`   ✅ Response: ${JSON.stringify(enrollRes.data).substring(0, 100)}`)
    } else {
      console.log(`   ⚠️  Response: ${JSON.stringify(enrollRes.data).substring(0, 100)}`)
    }
    console.log()
    
    // 3. Test materials endpoint
    console.log('3️⃣  Testing Materials Endpoint...')
    const matRes = await request('GET', '/api/classes/materials/test-class-id')
    console.log(`   GET /api/classes/materials/:classId: ${matRes.status}`)
    if (matRes.status === 200) {
      console.log(`   ✅ Response: ${JSON.stringify(matRes.data).substring(0, 100)}`)
    } else {
      console.log(`   ⚠️  Response: ${JSON.stringify(matRes.data).substring(0, 100)}`)
    }
    console.log()
    
    // 4. Test assignment submission endpoint
    console.log('4️⃣  Testing Assignment Submission Endpoint...')
    const assignRes = await request('GET', '/api/assignments/test-assign-id/my-submission')
    console.log(`   GET /api/assignments/:id/my-submission: ${assignRes.status}`)
    if (assignRes.status === 200) {
      console.log(`   ✅ Response: ${JSON.stringify(assignRes.data).substring(0, 100)}`)
    } else {
      console.log(`   ⚠️  Response: ${JSON.stringify(assignRes.data).substring(0, 100)}`)
    }
    console.log()
    
    console.log('✅ API Endpoints Test Complete')
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
  
  process.exit(0)
}

test()
