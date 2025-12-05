import http from 'http';

function testLogin() {
  const postData = JSON.stringify({
    username: 'teacher',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 4001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    console.log('Status Code:', res.statusCode);
    console.log('\nResponse Headers:');
    Object.entries(res.headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\nResponse Body:', data);
      
      // Extract Set-Cookie headers specifically
      const setCookieHeader = res.headers['set-cookie'];
      if (setCookieHeader) {
        console.log('\n✅ Set-Cookie Headers Found:');
        Array.isArray(setCookieHeader) 
          ? setCookieHeader.forEach(cookie => console.log(`  ${cookie}`))
          : console.log(`  ${setCookieHeader}`);
      } else {
        console.log('\n❌ No Set-Cookie headers!');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(postData);
  req.end();
}

testLogin();
