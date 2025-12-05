#!/usr/bin/env node

/**
 * ================================================================
 * KVC WebApp - Complete API Test Suite (Node.js)
 * Purpose: Test backend APIs, Database, and Token generation
 * Date: 2025-11-20
 * Usage: node test-complete-system.mjs [--user testuser] [--pass Test@1234]
 * ================================================================
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Configuration
const config = {
  backend: process.env.BACKEND_URL || 'http://localhost:4001',
  username: 'testuser',
  password: 'Test@1234',
  timeout: 10000,
};

// Parse command line arguments
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg === '--user' && arr[i + 1]) config.username = arr[i + 1];
  if (arg === '--pass' && arr[i + 1]) config.password = arr[i + 1];
});

// Test state
const state = {
  accessToken: null,
  refreshToken: null,
  testClassId: null,
  passCount: 0,
  failCount: 0,
  results: [],
};

// ================================================================
// Console Utilities
// ================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(message) {
  log(`✓ ${message}`, 'green');
  state.passCount++;
}

function fail(message, error = '') {
  log(`✗ ${message}`, 'red');
  if (error) log(`  Error: ${error}`, 'red');
  state.failCount++;
}

function info(message) {
  log(`→ ${message}`, 'yellow');
}

function header(title) {
  log(`\n${'═'.repeat(40)}`, 'blue');
  log(title, 'blue');
  log(`${'═'.repeat(40)}\n`, 'blue');
}

// ================================================================
// API Request Helper
// ================================================================

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const url = new URL(path, config.backend);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KVC-Test-Suite/1.0',
      },
      timeout: config.timeout,
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    let bodyStr = '';
    if (body) {
      bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: null,
        error: error.message,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: null,
        error: 'Request timeout',
        success: false,
      });
    });

    if (bodyStr) {
      req.write(bodyStr);
    }

    req.end();
  });
}

// ================================================================
// Test Suites
// ================================================================

async function testConnections() {
  header('1. CONNECTION & INFRASTRUCTURE TESTS');

  info(`Testing backend connection to ${config.backend}...`);
  const response = await makeRequest('GET', '/api/health');

  if (response.success || response.status === 404) {
    pass('Backend is reachable');
  } else {
    fail('Backend is not responding', response.error);
  }
}

async function testAuthentication() {
  header('2. AUTHENTICATION & TOKEN TESTS');

  info(`Testing login with username: ${config.username}...`);
  const loginResp = await makeRequest('POST', '/api/auth/login', {
    username: config.username,
    password: config.password,
  });

  if (loginResp.success && loginResp.data) {
    pass(`Login successful (Status: ${loginResp.status})`);

    const token = loginResp.data.accessToken || loginResp.data.token || loginResp.data.access_token;
    if (token) {
      state.accessToken = token;
      pass('Access token received');
      info(`Token: ${token.substring(0, 30)}...`);
    } else {
      fail('No access token in response', JSON.stringify(loginResp.data));
    }

    if (loginResp.data.user) {
      pass(
        `User data received: ${loginResp.data.user.username} - Role: ${loginResp.data.user.role}`
      );
    }

    const refreshToken = loginResp.data.refreshToken || loginResp.data.refresh_token;
    if (refreshToken) {
      state.refreshToken = refreshToken;
      info('Refresh token received');
    }
  } else {
    fail(`Login failed (Status: ${loginResp.status})`, loginResp.error || JSON.stringify(loginResp.data));
    info('Ensure user exists in database');
  }

  if (state.accessToken) {
    info('Testing token refresh...');
    const refreshResp = await makeRequest('POST', '/api/auth/refresh');

    if (refreshResp.success) {
      pass('Token refresh successful');
      if (refreshResp.data.accessToken) {
        state.accessToken = refreshResp.data.accessToken;
      }
    } else {
      fail('Token refresh failed');
    }
  }
}

async function testClassSystem() {
  header('3. CLASS SYSTEM API TESTS');

  if (!state.accessToken) {
    fail('Skipping class tests - no valid token');
    return;
  }

  // Get classes
  info('Fetching user classes...');
  const classesResp = await makeRequest('GET', '/api/classes', null, state.accessToken);

  if (classesResp.success) {
    const count = Array.isArray(classesResp.data) ? classesResp.data.length : 1;
    pass(`Classes fetched (Count: ${count}) - Status: ${classesResp.status}`);

    if (classesResp.data && classesResp.data.length > 0) {
      state.testClassId = classesResp.data[0].id;
      info(`First class: ${classesResp.data[0].code} - ${classesResp.data[0].name}`);
    }
  } else {
    fail(`Failed to fetch classes (Status: ${classesResp.status})`, classesResp.error);
    return;
  }

  if (!state.testClassId) {
    info('No classes available for further testing');
    return;
  }

  // Get class details
  info('Fetching class details...');
  const detailResp = await makeRequest(
    'GET',
    `/api/classes/${state.testClassId}`,
    null,
    state.accessToken
  );

  if (detailResp.success) {
    pass(`Class details fetched - Status: ${detailResp.status}`);
  } else {
    fail('Failed to fetch class details');
  }

  // Get students
  info('Fetching enrolled students...');
  const studentsResp = await makeRequest(
    'GET',
    `/api/classes/${state.testClassId}/students`,
    null,
    state.accessToken
  );

  if (studentsResp.success) {
    pass(`Students fetched - Status: ${studentsResp.status}`);
  } else {
    fail('Failed to fetch students');
  }

  // Get assignments
  info('Fetching assignments...');
  const assignResp = await makeRequest(
    'GET',
    `/api/classes/${state.testClassId}/assignments`,
    null,
    state.accessToken
  );

  if (assignResp.success) {
    pass(`Assignments fetched - Status: ${assignResp.status}`);
  } else {
    fail('Failed to fetch assignments');
  }

  // Get attendance
  info('Fetching attendance records...');
  const attendResp = await makeRequest(
    'GET',
    `/api/classes/${state.testClassId}/attendance`,
    null,
    state.accessToken
  );

  if (attendResp.success) {
    pass(`Attendance records fetched - Status: ${attendResp.status}`);
  } else {
    fail('Failed to fetch attendance');
  }
}

async function testJoinRequests() {
  header('4. JOIN REQUEST FLOW TESTS');

  if (!state.accessToken) {
    fail('Skipping join request tests - no valid token');
    return;
  }

  if (!state.testClassId) {
    info('No test class available');
    return;
  }

  // Try join request
  info('Attempting to send join request...');
  const joinResp = await makeRequest(
    'POST',
    `/api/classes/${state.testClassId}/join-request`,
    { reason: 'Test join request' },
    state.accessToken
  );

  if (joinResp.success) {
    pass(`Join request sent - Status: ${joinResp.status}`);
    if (joinResp.data.id) {
      info(`Join Request ID: ${joinResp.data.id}`);
    }
  } else {
    info(`Join request returned: ${joinResp.status} (may be expected if already enrolled)`);
  }

  // Get pending requests
  info('Fetching pending join requests...');
  const pendingResp = await makeRequest(
    'GET',
    `/api/classes/${state.testClassId}/join-requests`,
    null,
    state.accessToken
  );

  if (pendingResp.success) {
    pass(`Pending requests fetched - Status: ${pendingResp.status}`);
  } else {
    info(`Pending requests returned: ${pendingResp.status} (may require teacher role)`);
  }
}

async function testErrorHandling() {
  header('5. ERROR HANDLING & EDGE CASES');

  // Test without token
  info('Testing API call without authentication...');
  const noAuthResp = await makeRequest('GET', '/api/classes');

  if (noAuthResp.status === 401) {
    pass('Correctly rejected unauthenticated request (401)');
  } else {
    fail(`Expected 401 for unauthenticated request, got ${noAuthResp.status}`);
  }

  // Test invalid token
  info('Testing API call with invalid token...');
  const invalidResp = await makeRequest('GET', '/api/classes', null, 'invalid.token.here');

  if (invalidResp.status === 401 || invalidResp.status === 403) {
    pass(`Correctly rejected invalid token (${invalidResp.status})`);
  } else {
    fail(`Expected 401/403 for invalid token, got ${invalidResp.status}`);
  }

  // Test non-existent resource
  info('Testing non-existent resource...');
  const notFoundResp = await makeRequest(
    'GET',
    '/api/classes/nonexistent-id',
    null,
    state.accessToken
  );

  if (notFoundResp.status === 404) {
    pass('Correctly returned 404 for non-existent resource');
  } else {
    info(`Non-existent resource returned: ${notFoundResp.status}`);
  }
}

async function testDatabase() {
  header('6. DATABASE VERIFICATION');

  if (!state.accessToken) {
    fail('Skipping database tests - no valid token');
    return;
  }

  info('Checking database has sample data...');
  const classesResp = await makeRequest('GET', '/api/classes', null, state.accessToken);

  if (classesResp.success) {
    const count = Array.isArray(classesResp.data) ? classesResp.data.length : 0;

    if (count > 0) {
      pass(`Database has class data (${count} classes)`);

      const sample = classesResp.data[0];
      const required = ['id', 'code', 'name', 'teacherId'];
      const missing = required.filter((field) => !(field in sample));

      if (missing.length === 0) {
        pass('Class data structure is valid');
      } else {
        fail(`Class data missing fields: ${missing.join(', ')}`);
      }
    } else {
      info('Database appears empty (no classes found)');
    }
  }
}

// ================================================================
// Summary & Main
// ================================================================

function printSummary() {
  header('TEST SUMMARY');

  const total = state.passCount + state.failCount;
  const percent = total > 0 ? Math.round((state.passCount / total) * 100) : 0;

  log(`Passed: ${state.passCount}`, 'green');
  log(`Failed: ${state.failCount}`, 'red');
  log(`Total:  ${total}`);
  log(`\nSuccess Rate: ${percent}%\n`);

  if (state.failCount === 0) {
    log('✓ ALL TESTS PASSED!\n', 'green');
  } else {
    log('⚠ Some tests failed. Review output above.\n', 'yellow');
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   KVC WebApp - Complete Test Suite     ║', 'blue');
  log(`║   Backend: ${config.backend.padEnd(29)}║`, 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  try {
    await testConnections();
    await testAuthentication();
    await testClassSystem();
    await testJoinRequests();
    await testErrorHandling();
    await testDatabase();

    printSummary();

    process.exit(state.failCount > 0 ? 1 : 0);
  } catch (error) {
    log(`\nFatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run
main();
