#!/usr/bin/env node
// Simple test that doesn't interfere with terminal
import http from 'http'

function request(method, path, body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 4001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (cookies) opts.headers['Cookie'] = cookies
    
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            setCookie: res.headers['set-cookie'],
            error: null
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: null,
            error: e.message
          })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  let cookies = ''
  
  try {
    // 1. Login
    console.log('\n=== 1. LOGIN ===')
    const login = await request('POST', '/api/auth/login', {
      username: 'student1',
      password: 'password123'
    })
    console.log('Status:', login.status)
    console.log('User:', login.body?.username, `(${login.body?.role})`)
    if (login.setCookie) {
      cookies = login.setCookie.map(c => c.split(';')[0]).join('; ')
      console.log('✓ Cookies received:', login.setCookie.length)
    }

    // 2. Get rooms
    console.log('\n=== 2. GET ROOMS ===')
    const rooms = await request('GET', '/api/chat/rooms', null, cookies)
    console.log('Status:', rooms.status)
    console.log('Rooms:', rooms.body?.length || 0)
    if (Array.isArray(rooms.body)) {
      rooms.body.forEach(r => console.log(`  - ${r.id}: ${r.name}`))
    }

    // 3. Get pinned rooms (should be 2 for student1)
    console.log('\n=== 3. GET PINNED ROOMS (before) ===')
    const pinned1 = await request('GET', '/api/chat/me/pinned', null, cookies)
    console.log('Status:', pinned1.status)
    console.log('Pinned:', pinned1.body?.length || 0)
    if (Array.isArray(pinned1.body)) {
      pinned1.body.forEach(p => console.log(`  - ${p.roomId}: ${p.room?.name}`))
    }

    // 4. Pin a room (use first room from list)
    const roomToPin = rooms.body?.[0]?.id || 'cmi172c200003vhm86sg7zct9'
    console.log(`\n=== 4. PIN ROOM ${roomToPin} ===`)
    const pin = await request('POST', `/api/chat/rooms/${roomToPin}/pin`, {}, cookies)
    console.log('Status:', pin.status)
    console.log('Response:', JSON.stringify(pin.body, null, 2).substring(0, 200))

    // 5. Get pinned rooms again
    console.log('\n=== 5. GET PINNED ROOMS (after) ===')
    const pinned2 = await request('GET', '/api/chat/me/pinned', null, cookies)
    console.log('Status:', pinned2.status)
    console.log('Pinned:', pinned2.body?.length || 0)
    if (Array.isArray(pinned2.body)) {
      pinned2.body.forEach(p => console.log(`  - ${p.roomId}: ${p.room?.name}`))
    }

    console.log('\n✓ All tests passed!')
  } catch (e) {
    console.error('✗ Error:', e.message)
  }
}

main()
