import fetch from 'node-fetch';

async function test() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'teacher-demo', password: 'Teacher123!' }),
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Cookies:', cookies?.split(';')[0]);
    
    // 2. Get classes with cookie
    console.log('Fetching classes...');
    const classesRes = await fetch('http://localhost:4001/api/classes', {
      method: 'GET',
      headers: { Cookie: cookies },
    });
    
    console.log('Status:', classesRes.status);
    const classesData = await classesRes.json();
    console.log('Response:', JSON.stringify(classesData, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
