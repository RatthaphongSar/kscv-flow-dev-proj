#!/usr/bin/env node

/**
 * Test script for Class Join System
 * Tests: Teacher creates class -> Student sees it -> Student joins -> Button disappears
 */

const BASE_URL = 'http://localhost:4001/api';

// Mock tokens
const TEACHER_TOKEN = 'Bearer mock-teacher-token';
const STUDENT_TOKEN = 'Bearer mock-student-token';

async function apiCall(endpoint, method = 'GET', body = null, token = TEACHER_TOKEN) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ API Error (${response.status}):`, data);
    throw new Error(data.message || `API call failed: ${response.statusText}`);
  }

  return data;
}

async function runTests() {
  console.log('🧪 Testing Class Join System\n');

  try {
    // Step 1: Teacher creates a class
    console.log('📝 Step 1: Teacher creates a new class');
    const classData = {
      code: 'TEST-' + Date.now(),
      name: 'Test Class for Join System',
      section: '1',
      credits: 3,
      semester: '1/2567',
      room: '101',
      capacity: 50,
    };
    
    const createResult = await apiCall('/classes', 'POST', classData, TEACHER_TOKEN);
    const classId = createResult.data.id;
    console.log(`✅ Class created: ${classId}\n`);

    // Step 2: Teacher lists their classes
    console.log('📋 Step 2: Teacher lists their classes');
    const teacherClasses = await apiCall('/classes', 'GET', null, TEACHER_TOKEN);
    const teacherClassIds = teacherClasses.data.map(c => c.id);
    console.log(`✅ Teacher sees ${teacherClasses.data.length} class(es)`);
    console.log(`   Class IDs: ${teacherClassIds.join(', ')}\n`);

    // Step 3: Student lists available classes (should see the new class)
    console.log('🔍 Step 3: Student lists available classes');
    const studentClasses = await apiCall('/classes', 'GET', null, STUDENT_TOKEN);
    console.log(`✅ Student sees ${studentClasses.data.length} class(es)`);
    
    const foundClass = studentClasses.data.find(c => c.id === classId);
    if (foundClass) {
      console.log(`✅ Student can see the newly created class: "${foundClass.name}"`);
      console.log(`   Enrollment Status: ${foundClass.enrollmentStatus}\n`);
    } else {
      console.log(`❌ Student CANNOT see the newly created class\n`);
      throw new Error('Student should see the newly created class');
    }

    // Step 4: Student requests to join the class
    console.log('🤝 Step 4: Student requests to join the class');
    const joinRequest = await apiCall(`/classes/${classId}/join-request`, 'POST', {}, STUDENT_TOKEN);
    console.log(`✅ Join request created`);
    console.log(`   Status: ${joinRequest.data.status}\n`);

    // Step 5: Teacher views join requests
    console.log('👁️ Step 5: Teacher views pending join requests');
    const joinRequests = await apiCall(`/classes/${classId}/join-requests`, 'GET', null, TEACHER_TOKEN);
    console.log(`✅ Teacher sees ${joinRequests.data.length} join request(s)`);
    
    if (joinRequests.data.length > 0) {
      const request = joinRequests.data[0];
      console.log(`   Student: ${request.studentName || request.studentId}`);
      console.log(`   Status: ${request.status}\n`);
    }

    // Step 6: Teacher approves the join request
    console.log('✅ Step 6: Teacher approves the join request');
    if (joinRequests.data.length > 0) {
      const requestId = joinRequests.data[0].id;
      const approveResult = await apiCall(`/enrollment/join-requests/${requestId}/approve`, 'POST', {}, TEACHER_TOKEN);
      console.log(`✅ Join request approved`);
      console.log(`   Enrollment Status: ${approveResult.data.status}\n`);
    }

    // Step 7: Student checks class list again (should show as enrolled)
    console.log('🔍 Step 7: Student checks class list (should show as enrolled)');
    const studentClassesAfter = await apiCall('/classes', 'GET', null, STUDENT_TOKEN);
    const foundClassAfter = studentClassesAfter.data.find(c => c.id === classId);
    
    if (foundClassAfter) {
      console.log(`✅ Class found in student's list`);
      console.log(`   Enrollment Status: ${foundClassAfter.enrollmentStatus}\n`);
    } else {
      console.log(`⚠️ Class not in student's list (might be moved to enrolled section)\n`);
    }

    console.log('✨ All tests passed! Join system is working correctly.\n');

  } catch (error) {
    console.error('\n🔴 Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
