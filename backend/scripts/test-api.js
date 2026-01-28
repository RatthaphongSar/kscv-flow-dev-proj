// backend/scripts/test-api.js
const API_URL = 'http://localhost:4001/api';

async function test() {
  console.log('--- Testing API ---');

  // 1. Health
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    console.log('Health Check:', res.status === 200 ? 'PASS' : 'FAIL', data);
  } catch (e) {
    console.error('Health Check Error:', e.message);
  }

  // 2. Create Room (as Teacher)
  try {
    console.log('\n--- Testing Create Room (Teacher) ---');
    const res = await fetch(`${API_URL}/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-teacher-token' // Use the mock token
      },
      body: JSON.stringify({
        name: 'Test Room for UAT ' + Date.now()
      })
    });
    
    if (res.status === 201) {
       const data = await res.json();
       console.log('Create Room:', 'PASS', 'ID:', data.id, 'Name:', data.name);
    } else {
       const txt = await res.text();
       console.log('Create Room:', 'FAIL', res.status, txt);
    }
  } catch (e) {
    console.error('Create Room Error:', e.message);
  }

    // 3. Create Room (as Student) - Should Fail
  try {
    console.log('\n--- Testing Create Room (Student) - Should Fail ---');
    const res = await fetch(`${API_URL}/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-student-token' // Use the mock token
      },
      body: JSON.stringify({
        name: 'Student Room ' + Date.now()
      })
    });
    
    if (res.status === 403) {
       console.log('Create Room (Student):', 'PASS (Correctly Forbidden)');
    } else {
       const txt = await res.text();
       console.log('Create Room (Student):', 'FAIL', 'Expected 403, got', res.status, txt);
    }
  } catch (e) {
    console.error('Create Room Error:', e.message);
  }
}

test();
