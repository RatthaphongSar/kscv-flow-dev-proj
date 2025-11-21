#!/usr/bin/env node

/**
 * Test script for Class Management System
 * Tests backend API endpoints for classes, assignments, attendance, and grades
 */

import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

// Mock users for testing
const TEACHER_ID = 'teacher-001';
const STUDENT_ID = 'student-001';
const TEACHER_TOKEN = 'bearer-token-teacher';
const STUDENT_TOKEN = 'bearer-token-student';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Helper to make requests with auth
const request = async (method, path, data = null, token = TEACHER_TOKEN) => {
  try {
    const config = {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    };

    // Don't send data for GET requests
    const response = await api({
      method,
      url: path,
      ...(method !== 'GET' && data ? { data } : {}),
      ...config,
    });

    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const errorMsg = error.response?.data || error.message;
    console.log(`    [DEBUG] ${method} ${path} - Status: ${error.response?.status}, Error:`, errorMsg);
    return { success: false, error: errorMsg, status: error.response?.status };
  }
};

// Test functions
const tests = {
  async testClassCreation() {
    console.log('\n📚 Test 1: Create Class');
    // Generate unique code to avoid duplicate constraints
    const uniqueCode = `TEST-${Date.now().toString().slice(-6)}`;
    const classData = {
      code: uniqueCode,
      name: 'Test Class ' + Date.now(),
      section: Math.floor(Math.random() * 100).toString(),
      credits: 3,
      semester: '1/2567',
      room: 'A101',
      capacity: 30,
    };

    const result = await request('POST', '/classes', classData);
    if (result.success) {
      console.log('✅ Class created:', result.data.data?.id);
      return result.data.data?.id;
    } else {
      console.log('❌ Failed to create class:', result.error);
      return null;
    }
  },

  async testListClasses() {
    console.log('\n📚 Test 2: List Classes');
    const result = await request('GET', '/classes', null);
    if (result.success) {
      console.log('✅ Classes listed:', result.data.data?.length || 0, 'classes');
      return result.data.data;
    } else {
      console.log('❌ Failed to list classes:', result.error);
      return [];
    }
  },

  async testGetClass(classId) {
    if (!classId) {
      console.log('⏭️  Test 3: Get Class (skipped - no classId)');
      return;
    }
    console.log('\n📚 Test 3: Get Class');
    const result = await request('GET', `/classes/${classId}`);
    if (result.success) {
      console.log('✅ Class retrieved:', result.data.data?.name);
    } else {
      console.log('❌ Failed to get class:', result.error);
    }
  },

  async testCreateAssignment(classId) {
    if (!classId) {
      console.log('⏭️  Test 4: Create Assignment (skipped - no classId)');
      return null;
    }
    console.log('\n📖 Test 4: Create Assignment');
    const assignmentData = {
      title: 'Essay: My Favorite Book',
      description: 'Write a 500-word essay about your favorite book',
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      assignmentType: 'homework',
    };

    const result = await request(
      'POST',
      `/classes/${classId}/assignments`,
      assignmentData
    );
    if (result.success) {
      console.log('✅ Assignment created:', result.data.data?.id);
      return result.data.data?.id;
    } else {
      console.log('❌ Failed to create assignment:', result.error);
      return null;
    }
  },

  async testGetAssignments(classId) {
    if (!classId) {
      console.log('⏭️  Test 5: Get Assignments (skipped - no classId)');
      return;
    }
    console.log('\n📖 Test 5: Get Assignments');
    const result = await request('GET', `/classes/${classId}/assignments`);
    if (result.success) {
      console.log(
        '✅ Assignments listed:',
        result.data.data?.length || 0,
        'assignments'
      );
    } else {
      console.log('❌ Failed to get assignments:', result.error);
    }
  },

  async testMarkAttendance(classId) {
    if (!classId) {
      console.log('⏭️  Test 6: Mark Attendance (skipped - no classId)');
      return;
    }
    console.log('\n✅ Test 6: Mark Attendance');
    const attendanceData = {
      studentId: STUDENT_ID,
      date: new Date().toISOString().split('T')[0], // Today's date
      status: 'present',
    };

    const result = await request(
      'POST',
      `/classes/${classId}/attendance/mark`,
      attendanceData
    );
    if (result.success) {
      console.log('✅ Attendance marked: student present');
    } else {
      console.log('❌ Failed to mark attendance:', result.error);
    }
  },

  async testGetAttendanceSummary(classId) {
    if (!classId) {
      console.log('⏭️  Test 7: Get Attendance Summary (skipped - no classId)');
      return;
    }
    console.log('\n✅ Test 7: Get Attendance Summary');
    const result = await request(
      'GET',
      `/classes/${classId}/attendance/${STUDENT_ID}`
    );
    if (result.success) {
      const summary = result.data.data;
      console.log('✅ Attendance summary:', {
        total: summary?.total,
        present: summary?.present,
        absent: summary?.absent,
        percentage: summary?.percentage,
      });
    } else {
      console.log('❌ Failed to get attendance summary:', result.error);
    }
  },

  async testCreateGradeItem(classId) {
    if (!classId) {
      console.log('⏭️  Test 8: Create Grade Item (skipped - no classId)');
      return null;
    }
    console.log('\n🎯 Test 8: Create Grade Item');
    const gradeItemData = {
      name: 'Midterm Exam',
      itemType: 'exam',
      maxScore: 100,
      weight: 0.3, // 30%
      description: 'Comprehensive midterm examination',
    };

    const result = await request(
      'POST',
      `/classes/${classId}/grade-items`,
      gradeItemData
    );
    if (result.success) {
      console.log('✅ Grade item created:', result.data.data?.id);
      return result.data.data?.id;
    } else {
      console.log('❌ Failed to create grade item:', result.error);
      return null;
    }
  },

  async testCreateGradeRecord(classId, gradeItemId) {
    if (!classId || !gradeItemId) {
      console.log('⏭️  Test 9: Create Grade Record (skipped - missing IDs)');
      return;
    }
    console.log('\n🎯 Test 9: Create Grade Record');
    const gradeData = {
      gradeItemId,
      studentId: STUDENT_ID,
      score: 85,
      feedback: 'Good performance. Keep it up!',
    };

    const result = await request(
      'POST',
      `/classes/${classId}/grades`,
      gradeData
    );
    if (result.success) {
      console.log('✅ Grade recorded: student scored 85/100');
    } else {
      console.log('❌ Failed to create grade:', result.error);
    }
  },

  async testGetStudentGrades(classId) {
    if (!classId) {
      console.log('⏭️  Test 10: Get Student Grades (skipped - no classId)');
      return;
    }
    console.log('\n🎯 Test 10: Get Student Grades');
    const result = await request(
      'GET',
      `/classes/${classId}/grades/${STUDENT_ID}`
    );
    if (result.success) {
      const grades = result.data.data;
      console.log('✅ Student grades:', {
        totalScore: grades?.totalScore,
        totalMaxScore: grades?.totalMaxScore,
        percentage: grades?.percentage,
        grade: grades?.grade,
      });
    } else {
      console.log('❌ Failed to get grades:', result.error);
    }
  },

  async testGetClassSummary(classId) {
    if (!classId) {
      console.log('⏭️  Test 11: Get Class Summary (skipped - no classId)');
      return;
    }
    console.log('\n📊 Test 11: Get Class Summary');
    const result = await request(
      'GET',
      `/classes/${classId}/summary?userId=${STUDENT_ID}`
    );
    if (result.success) {
      const summary = result.data.data;
      console.log('✅ Class summary:', {
        totalAssignments: summary?.totalAssignments,
        submittedAssignments: summary?.submittedAssignments,
        attendancePercentage: summary?.attendancePercentage,
        currentPercentage: summary?.currentPercentage,
      });
    } else {
      console.log('❌ Failed to get summary:', result.error);
    }
  },
};

// Run all tests
async function runTests() {
  console.log('🚀 Starting Class System API Tests');
  console.log('================================\n');

  let classId = null;
  let assignmentId = null;
  let gradeItemId = null;

  try {
    // Test basic CRUD
    classId = await tests.testClassCreation();
    await tests.testListClasses();
    await tests.testGetClass(classId);

    // Test assignments
    assignmentId = await tests.testCreateAssignment(classId);
    await tests.testGetAssignments(classId);

    // Test attendance
    await tests.testMarkAttendance(classId);
    await tests.testGetAttendanceSummary(classId);

    // Test grades
    gradeItemId = await tests.testCreateGradeItem(classId);
    await tests.testCreateGradeRecord(classId, gradeItemId);
    await tests.testGetStudentGrades(classId);

    // Test summary
    await tests.testGetClassSummary(classId);

    console.log('\n================================');
    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }

  process.exit(0);
}

// Run tests
runTests().catch(console.error);
