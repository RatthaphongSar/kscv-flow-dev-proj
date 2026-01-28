import { io } from 'socket.io-client';
// fetch is global in Node 18+

// Ignore self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://localhost:4001';
const API_URL = `${BASE_URL}/api`;

async function test() {
  console.log('--- Starting Full System Test (HTTPS) ---');

  try {
    // 1. Login as Teacher
    console.log('\n1. Logging in as Teacher...');
    const teacherRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ananda', password: 'password123' })
    });
    
    // If login fails, try 'teacher-demo' / 'Teacher123!' (from AuthContext dev logic)
    let teacherData;
    if (!teacherRes.ok) {
        console.log('   Default login failed (ananda), trying demo credentials...');
        const demoRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'teacher-demo', password: 'Teacher123!' }) 
        });
        if (!demoRes.ok) throw new Error(`Teacher Login failed: ${demoRes.status} ${demoRes.statusText}`);
        teacherData = await demoRes.json();
    } else {
        teacherData = await teacherRes.json();
    }
    
    // console.log('Teacher Data:', JSON.stringify(teacherData, null, 2));
    const teacherToken = teacherData.accessToken;
    const teacherId = teacherData.id;
    console.log(`   Teacher logged in: ${teacherData.username} (${teacherId})`);

    // 2. Get or Create Class
    console.log('\n2. Getting/Creating Class...');
    let classId;
    const classesRes = await fetch(`${API_URL}/classes`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    if (!classesRes.ok) throw new Error('Failed to list classes');
    const classesResult = await classesRes.json();
    const classes = classesResult.data || [];
    
    if (classes.length > 0) {
        classId = classes[0].id;
        console.log(`   Using existing class: ${classes[0].name} (${classId})`);
    } else {
        console.log('   No classes found, creating one...');
        const createClassRes = await fetch(`${API_URL}/classes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                code: 'TEST101',
                name: 'Test Class HTTPS',
                section: '1',
                credits: 3
            })
        });
        if (!createClassRes.ok) throw new Error('Failed to create class');
        const newClassResult = await createClassRes.json();
        const newClass = newClassResult.data;
        classId = newClass.id;
        console.log(`   Created class: ${newClass.name} (${classId})`);
    }

    // 3. Create Meeting
    console.log('\n3. Creating Meeting...');
    const meetingRes = await fetch(`${API_URL}/meetings`, { // Correct endpoint
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        title: 'Test HTTPS Meeting',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        type: 'online',
        classId: classId // Add classId
      })
    });

    if (!meetingRes.ok) {
        const err = await meetingRes.text();
        throw new Error(`Create Meeting failed: ${meetingRes.status} ${err}`);
    }
    const meetingData = await meetingRes.json();
    const meetingId = meetingData.data.id; // Correct response structure
    console.log(`   Meeting created: ${meetingData.data.title} (${meetingId})`);

    // 3.5 Start Meeting (to create Video Session)
    console.log('\n3.5 Starting Meeting...');
    const startRes = await fetch(`${API_URL}/meetings/${meetingId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    if (!startRes.ok) {
        const err = await startRes.text();
        throw new Error(`Start Meeting failed: ${startRes.status} ${err}`);
    }
    const startData = await startRes.json();
    const sessionId = startData.data.videoSession?.id;
    console.log(`   Meeting started, Session ID: ${sessionId}`);
    if (!sessionId) throw new Error('No video session ID returned');

    // 4. Teacher Connects to Socket
    console.log('\n4. Teacher connecting to Socket.io...');
    const teacherSocket = io(BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: teacherToken },
      rejectUnauthorized: false
    });

    await new Promise((resolve, reject) => {
      teacherSocket.on('connect', () => {
        console.log('   Teacher Socket connected');
        resolve();
      });
      teacherSocket.on('connect_error', (err) => reject(err));
      setTimeout(() => reject(new Error('Teacher socket timeout')), 5000);
    });

    // 4. Teacher Joins Video Room
    console.log('   Teacher joining video room...');
    teacherSocket.emit('video:join', { meetingId, sessionId });

    // 5. Login as Student
    console.log('\n4. Logging in as Student...');
    const studentRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'somchai', password: 'password123' })
    });
    
    let studentToken, studentId;
    if (studentRes.ok) {
        const studentData = await studentRes.json();
        studentToken = studentData.accessToken;
        studentId = studentData.id;
        console.log(`   Student logged in: ${studentData.username} (${studentId})`);
    } else {
        throw new Error('Student login failed');
    }

    // 6. Student Connects to Socket
    console.log('\n5. Student connecting to Socket.io...');
    const studentSocket = io(BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: studentToken },
      rejectUnauthorized: false
    });

    await new Promise((resolve, reject) => {
      studentSocket.on('connect', () => {
        console.log('   Student Socket connected');
        resolve();
      });
      studentSocket.on('connect_error', (err) => reject(err));
      setTimeout(() => reject(new Error('Student socket timeout')), 5000);
    });

    // 7. Student Joins Video Room
    console.log('   Student joining video room...');
    
    // Setup listeners for Signaling
    const signalPromise = new Promise((resolve) => {
        // Teacher listens for Offer
        teacherSocket.on('video:offer', (data) => {
            console.log(`   [Teacher] Received Offer from ${data.from}`);
            // Teacher sends Answer
            teacherSocket.emit('video:answer', {
                meetingId,
                to: data.from,
                sdp: { type: 'answer', sdp: 'mock-answer-sdp' }
            });
        });

        // Student listens for Answer
        studentSocket.on('video:answer', (data) => {
            console.log(`   [Student] Received Answer from ${data.from}`);
            resolve(true);
        });

        // Student listens for existing participants (Teacher should be there)
        studentSocket.on('video:participants-list', ({ participants }) => {
            console.log(`   [Student] Participants list: ${participants.length}`);
            // Student initiates Offer to Teacher
            const teacher = participants.find(p => p.userId === teacherId);
            if (teacher) {
                console.log('   [Student] Sending Offer to Teacher...');
                studentSocket.emit('video:offer', {
                    meetingId,
                    to: teacherId,
                    sdp: { type: 'offer', sdp: 'mock-offer-sdp' }
                });
            } else if (studentId === teacherId) {
                 console.log('   [Self-Test] Skipping offer to self.');
                 resolve(true); // Treat as pass for self-test
            }
        });
    });

    studentSocket.emit('video:join', { meetingId, sessionId });

    // Wait for signaling to complete
    console.log('\n6. Testing Signaling (Offer/Answer)...');
    await Promise.race([
        signalPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signaling timeout')), 10000))
    ]);
    console.log('   Signaling successful!');

    // Cleanup
    teacherSocket.disconnect();
    studentSocket.disconnect();
    console.log('\n--- Test Passed Successfully ---');

  } catch (err) {
    console.error('\n❌ Test Failed:', err);
    process.exit(1);
  }
}

test();
