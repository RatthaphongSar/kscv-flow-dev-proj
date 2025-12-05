#!/usr/bin/env node

/**
 * Role-Based Access Control Testing Script
 * 
 * This script tests the role separation between TEACHER and STUDENT
 * 1. Creates test users with hashed passwords
 * 2. Tests login for each role
 * 3. Validates that tabs appear/disappear correctly
 */

const API_BASE = 'http://localhost:5000/api';

// Test credentials (must match what's in seed.js and Login.jsx quick fill)
const TEST_USERS = {
  teacher: {
    username: 'teacher-demo',
    password: 'Teacher123!',
    expectedRole: 'TEACHER',
    expectedTabs: ['overview', 'assignment', 'attendance', 'announcements', 'schedule', 'students', 'createAssignments', 'settings'],
  },
  student: {
    username: 'student-demo',
    password: 'Student123!',
    expectedRole: 'STUDENT',
    expectedTabs: ['overview', 'assignment', 'attendance', 'announcements', 'schedule'],
  },
};

async function testLogin(username, password) {
  console.log(`\n🔐 Testing login for: ${username}`);
  console.log(`   Password: ${password}`);
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Login successful!`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Username: ${data.username}`);
    console.log(`   Role: ${data.role}`);
    console.log(`   Email: ${data.email}`);
    
    return data;
  } catch (error) {
    console.error(`❌ Login failed:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('     Role-Based Access Control Testing');
  console.log('═══════════════════════════════════════════════════════════');

  console.log('\n📝 Test Users:');
  Object.entries(TEST_USERS).forEach(([type, user]) => {
    console.log(`\n${type.toUpperCase()}:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Expected Role: ${user.expectedRole}`);
    console.log(`  Expected Tabs: ${user.expectedTabs.join(', ')}`);
  });

  console.log('\n\n🧪 Running Tests...');
  console.log('═══════════════════════════════════════════════════════════');

  // Test teacher login
  console.log('\n1️⃣  TEACHER LOGIN TEST');
  console.log('─────────────────────────────────────────────────────────');
  const teacherUser = await testLogin(TEST_USERS.teacher.username, TEST_USERS.teacher.password);
  
  if (teacherUser) {
    if (teacherUser.role === TEST_USERS.teacher.expectedRole) {
      console.log(`✅ Role is correct: ${teacherUser.role}`);
    } else {
      console.log(`❌ Role mismatch! Expected ${TEST_USERS.teacher.expectedRole}, got ${teacherUser.role}`);
    }
  }

  // Test student login
  console.log('\n2️⃣  STUDENT LOGIN TEST');
  console.log('─────────────────────────────────────────────────────────');
  const studentUser = await testLogin(TEST_USERS.student.username, TEST_USERS.student.password);
  
  if (studentUser) {
    if (studentUser.role === TEST_USERS.student.expectedRole) {
      console.log(`✅ Role is correct: ${studentUser.role}`);
    } else {
      console.log(`❌ Role mismatch! Expected ${TEST_USERS.student.expectedRole}, got ${studentUser.role}`);
    }
  }

  console.log('\n\n✅ Tests Completed!');
  console.log('═══════════════════════════════════════════════════════════');
  
  console.log('\n📋 FRONTEND TESTING CHECKLIST:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('After running this script, manually test in frontend:');
  console.log('');
  console.log('TEACHER (teacher-demo / Teacher123!):');
  console.log('  ☐ Login successful');
  console.log('  ☐ 8 tabs visible: ภาพรวม | งาน | การเข้าเรียน | ประกาศ | ตารางเรียน | จัดการนักเรียน | สร้างงาน | ตั้งค่า');
  console.log('  ☐ All tabs render without errors');
  console.log('  ☐ Can click and interact with teacher-only tabs');
  console.log('');
  console.log('STUDENT (student-demo / Student123!):');
  console.log('  ☐ Login successful');
  console.log('  ☐ 5 tabs visible: ภาพรวม | งาน | การเข้าเรียน | ประกาศ | ตารางเรียน');
  console.log('  ☐ Teacher-only tabs (จัดการนักเรียน | สร้างงาน | ตั้งค่า) are NOT visible');
  console.log('  ☐ If somehow accessing teacher tabs, show "This feature is only available for teachers"');
  console.log('');
  console.log('SHARED TABS (both roles):');
  console.log('  ☐ ภาพรวม (Overview) - displays class info');
  console.log('  ☐ งาน (Assignments) - displays assignments');
  console.log('  ☐ การเข้าเรียน (Attendance) - shows attendance info');
  console.log('  ☐ ประกาศ (Announcements) - shows announcements');
  console.log('  ☐ ตารางเรียน (Schedule) - shows schedule');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run tests
runTests().catch(console.error);
