// Test cookies being set on login
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4001/api';

async function testLogin() {
  console.log('\n=== Testing Login with Cookie Handling ===\n');

  try {
    console.log('Sending POST /auth/login...');
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'teacher',
        password: 'password123'
      }),
      credentials: 'include', // Important: include cookies
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    
    // Log all headers
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Check for Set-Cookie header
    const setCookie = response.headers.get('set-cookie');
    console.log('\nSet-Cookie Header:', setCookie || '(not found)');

    const body = await response.json();
    console.log('\nResponse Body:', JSON.stringify(body, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful! Cookies should be set.');
    } else {
      console.log('\n❌ Login failed!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
