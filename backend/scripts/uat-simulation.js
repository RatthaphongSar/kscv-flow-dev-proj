// backend/scripts/uat-simulation.js
// import fetch from 'node-fetch'; // Built-in in Node 18+

const API_URL = 'http://localhost:4001/api';
const BASE_URL = 'http://localhost:4001';
let teacherToken = 'mock-teacher-token';
let studentToken = 'mock-student-token';
let createdRoomId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

function log(step, status, message, data = '') {
  const color = status === 'PASS' ? colors.green : (status === 'FAIL' ? colors.red : colors.yellow);
  console.log(`${colors.blue}[${step}]${colors.reset} ${color}${status}${colors.reset} : ${message}`, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
}

async function runUAT() {
  console.log(`\n${colors.yellow}=== STARTING KSVC CONNECT UAT SIMULATION ===${colors.reset}\n`);

  // 1. System Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) {
        log('1. Health Check', 'PASS', 'System is online');
    } else {
        throw new Error(`Status ${res.status}`);
    }
  } catch (e) {
    log('1. Health Check', 'FAIL', `System unreachable: ${e.message}`);
    process.exit(1);
  }

  // 2. Teacher Login (Mock)
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (res.ok && data.role === 'TEACHER') {
        log('2. Teacher Auth', 'PASS', `Logged in as ${data.username} (${data.role})`);
    } else {
        throw new Error('Invalid role or auth failed');
    }
  } catch (e) {
    log('2. Teacher Auth', 'FAIL', e.message);
  }

  // 3. Create Room (Teacher)
  try {
    const res = await fetch(`${API_URL}/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        name: `UAT Class Room ${new Date().toLocaleTimeString()}`,
        memberIds: ['student-001'] // Add student explicitly
      })
    });
    
    if (res.status === 201) {
       const data = await res.json();
       createdRoomId = data.id;
       log('3. Create Room', 'PASS', `Room created: ${data.name} (ID: ${data.id})`);
    } else {
       const txt = await res.text();
       log('3. Create Room', 'FAIL', `Status ${res.status} - ${txt}`);
    }
  } catch (e) {
    log('3. Create Room', 'FAIL', e.message);
  }

  // 4. Student Login & View Room
  if (createdRoomId) {
    try {
        const res = await fetch(`${API_URL}/chat/rooms`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        const found = data.find(r => r.id === createdRoomId);
        
        if (found) {
            log('4. Student View Room', 'PASS', `Student sees room: ${found.name}`);
        } else {
            log('4. Student View Room', 'FAIL', 'Student cannot see the created room');
        }
    } catch (e) {
        log('4. Student View Room', 'FAIL', e.message);
    }
  }

  // 5. Send Message (Teacher)
  if (createdRoomId) {
      try {
        const res = await fetch(`${API_URL}/chat/rooms/${createdRoomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({ content: 'Hello class! Welcome to UAT.' })
        });
        if (res.status === 201) {
            log('5. Teacher Send Msg', 'PASS', 'Message sent successfully');
        } else {
            log('5. Teacher Send Msg', 'FAIL', `Status ${res.status}`);
        }
      } catch (e) {
          log('5. Teacher Send Msg', 'FAIL', e.message);
      }
  }

  // 6. Security Check (Student Create Room)
  try {
    const res = await fetch(`${API_URL}/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ name: 'Hacker Room' })
    });
    
    if (res.status === 403) {
       log('6. Security Check', 'PASS', 'Student correctly blocked from creating room');
    } else {
       log('6. Security Check', 'FAIL', `Student should get 403, got ${res.status}`);
    }
  } catch (e) {
    log('6. Security Check', 'FAIL', e.message);
  }

  console.log(`\n${colors.yellow}=== UAT SIMULATION COMPLETE ===${colors.reset}\n`);
}

runUAT();
