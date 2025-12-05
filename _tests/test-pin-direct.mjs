#!/usr/bin/env node
// Direct test of auth and pin endpoints
import http from 'http'

function makeRequest(method, path, body, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (cookies) {
      options.headers['Cookie'] = cookies
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        // Extract Set-Cookie header if present
        const setCookie = res.headers['set-cookie']
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
          setCookie: setCookie
        })
      })
    })

    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function test() {
  console.log('=== AUTH & PIN TEST ===\n')

  // Test 1: Login
  console.log('TEST 1: Login as student1')
  const login = await makeRequest('POST', '/auth/login', {
    username: 'student1',
    password: 'password123'
  })
  console.log(`Status: ${login.status}`)
  console.log(`User: ${login.body?.username}`)
  console.log(`Set-Cookie: ${login.setCookie?.join(', ') || 'none'}`)

  // Extract cookies from Set-Cookie headers
  let cookies = ''
  if (login.setCookie) {
    cookies = login.setCookie.map(c => c.split(';')[0]).join('; ')
  }
  console.log(`Extracted cookies: ${cookies}\n`)

  // Test 2: Get current user with cookie
  console.log('TEST 2: Get current user')
  const me = await makeRequest('GET', '/auth/me', null, cookies)
  console.log(`Status: ${me.status}`)
  console.log(`User: ${me.body?.username}\n`)

  // Test 3: Get pinned rooms
  console.log('TEST 3: Get pinned rooms')
  const pinned = await makeRequest('GET', '/api/chat/me/pinned', null, cookies)
  console.log(`Status: ${pinned.status}`)
  console.log(`Pinned count: ${pinned.body?.length || 0}`)
  if (Array.isArray(pinned.body)) {
    pinned.body.forEach(p => console.log(`  - Room ${p.roomId}: ${p.room?.name}`))
  }
  console.log()

  // Test 4: Pin a room
  console.log('TEST 4: Pin room 2')
  const pin = await makeRequest('POST', '/api/chat/rooms/2/pin', {}, cookies)
  console.log(`Status: ${pin.status}`)
  console.log(`Response: ${JSON.stringify(pin.body, null, 2)}\n`)

  // Test 5: Get pinned rooms again
  console.log('TEST 5: Get pinned rooms again')
  const pinned2 = await makeRequest('GET', '/api/chat/me/pinned', null, cookies)
  console.log(`Status: ${pinned2.status}`)
  console.log(`Pinned count: ${pinned2.body?.length || 0}`)
  if (Array.isArray(pinned2.body)) {
    pinned2.body.forEach(p => console.log(`  - Room ${p.roomId}: ${p.room?.name}`))
  }

  console.log('\n=== TEST COMPLETE ===')
}

test().catch(console.error)
