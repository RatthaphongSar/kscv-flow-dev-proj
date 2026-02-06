import http from 'http'

const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', data)
    process.exit(0)
  })
})

req.on('error', (e) => {
  console.error('Error:', e.message)
  process.exit(1)
})

const body = JSON.stringify({ username: 'somchai', password: 'password123' })
req.write(body)
req.end()
