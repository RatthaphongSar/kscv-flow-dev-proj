#!/usr/bin/env node

/**
 * ================================================================
 * KVC WebApp - API Test Suite with Cookie Support
 * Purpose: Test backend APIs with httpOnly cookie handling
 * Date: 2025-11-20
 * ================================================================
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const config = {
  backend: process.env.BACKEND_URL || 'http://localhost:4001',
  username: 'student-demo',
  password: 'Test@1234',
  timeout: 10000,
};

// Parse CLI args
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg === '--user' && arr[i + 1]) config.username = arr[i + 1];
  if (arg === '--pass' && arr[i + 1]) config.password = arr[i + 1];
});

// Test state
const state = {
  cookies: [],
  testClassId: null,
  passCount: 0,
  failCount: 0,
};

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function pass(msg) {
  log(`✓ ${msg}`, 'green');
  state.passCount++;
}

function fail(msg, error = '') {
  log(`✗ ${msg}`, 'red');
  if (error) log(`  Error: ${error}`, 'red');
  state.failCount++;
}

function info(msg) {
  log(`→ ${msg}`, 'yellow');
}

function header(title) {
  log(`\n${'═'.repeat(40)}`, 'blue');
  log(title, 'blue');
  log(`${'═'.repeat(40)}\n`, 'blue');
}

// Cookie jar
function addCookies(setCookieHeader) {
  if (!setCookieHeader) return;
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  cookies.forEach(cookie => {
    const cookieParts = cookie.split(';')[0].trim();
    state.cookies.push(cookieParts);
  });
}

function getCookieHeader() {
  return state.cookies.join('; ');
}

// HTTP request helper
function makeRequest(method, path, body = null) {
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
        'User-Agent': 'KVC-Test/1.0',
      },
      timeout: config.timeout,
    };

    const cookieHeader = getCookieHeader();
    if (cookieHeader) {
      options.headers.Cookie = cookieHeader;
    }

    let bodyStr = '';
    if (body) {
      bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(options, (res) => {
      let data = '';

      // Capture cookies
      addCookies(res.headers['set-cookie']);

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

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Tests
async function testConnections() {
  header('1. CONNECTION & INFRASTRUCTURE TESTS');
  info(`Testing backend connection to ${config.backend}...`);
  const resp = await makeRequest('GET', '/api/health');
  if (resp.success || resp.status === 404) {
    pass('Backend is reachable');
  } else {
    fail('Backend is not responding', resp.error);
  }
}

async function testAuthentication() {
  header('2. AUTHENTICATION & TOKEN TESTS');

  info(`Testing login with username: ${config.username}...`);
  const loginResp = await makeRequest('POST', '/api/auth/login', {
    username: config.username,
    password: config.password,
  });

  if (loginResp.success) {
    pass(`Login successful (Status: ${loginResp.status})`);

    if (loginResp.data.username) {
      pass(`User data received: ${loginResp.data.username} - Role: ${loginResp.data.role}`);
    }

    if (state.cookies.length > 0) {
      pass(`Cookies received: ${state.cookies.length}`);
      info(`Cookies: ${state.cookies.map(c => c.split('=')[0]).join(', ')}`);
    }
  } else {
    fail(`Login failed (Status: ${loginResp.status})`, loginResp.error);
  }
}

async function testClassSystem() {
  header('3. CLASS SYSTEM API TESTS');

  if (state.cookies.length === 0) {
    fail('Skipping class tests - no auth cookies');
    return;
  }

  info('Fetching user classes...');
  const classesResp = await makeRequest('GET', '/api/classes');

  if (classesResp.success) {
    const count = Array.isArray(classesResp.data) ? classesResp.data.length : 0;
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
  const detailResp = await makeRequest('GET', `/api/classes/${state.testClassId}`);
  if (detailResp.success) {
    pass(`Class details fetched - Status: ${detailResp.status}`);
  } else {
    fail('Failed to fetch class details');
  }

  // Get students
  info('Fetching enrolled students...');
  const studentsResp = await makeRequest('GET', `/api/classes/${state.testClassId}/students`);
  if (studentsResp.success) {
    pass(`Students fetched - Status: ${studentsResp.status}`);
  } else {
    fail('Failed to fetch students');
  }

  // Get assignments
  info('Fetching assignments...');
  const assignResp = await makeRequest('GET', `/api/classes/${state.testClassId}/assignments`);
  if (assignResp.success) {
    pass(`Assignments fetched - Status: ${assignResp.status}`);
  } else {
    fail('Failed to fetch assignments');
  }

  // Get attendance
  info('Fetching attendance records...');
  const attendResp = await makeRequest('GET', `/api/classes/${state.testClassId}/attendance`);
  if (attendResp.success) {
    pass(`Attendance records fetched - Status: ${attendResp.status}`);
  } else {
    fail('Failed to fetch attendance');
  }
}

async function testJoinRequests() {
  header('4. JOIN REQUEST FLOW TESTS');

  if (state.cookies.length === 0) {
    fail('Skipping join request tests - no auth');
    return;
  }

  if (!state.testClassId) {
    info('No test class available');
    return;
  }

  info('Attempting to send join request...');
  const joinResp = await makeRequest('POST', `/api/classes/${state.testClassId}/join-request`, {
    reason: 'Test join request',
  });

  if (joinResp.success) {
    pass(`Join request sent - Status: ${joinResp.status}`);
  } else {
    info(`Join request returned: ${joinResp.status} (may be expected if already enrolled)`);
  }

  info('Fetching pending join requests...');
  const pendingResp = await makeRequest('GET', `/api/classes/${state.testClassId}/join-requests`);

  if (pendingResp.success) {
    pass(`Pending requests fetched - Status: ${pendingResp.status}`);
  } else {
    info(`Pending requests returned: ${pendingResp.status} (may require teacher role)`);
  }
}

async function testErrorHandling() {
  header('5. ERROR HANDLING & EDGE CASES');

  // Clear cookies to test 401
  const savedCookies = state.cookies;
  state.cookies = [];

  info('Testing API call without authentication...');
  const noAuthResp = await makeRequest('GET', '/api/classes');

  if (noAuthResp.status === 401) {
    pass('Correctly rejected unauthenticated request (401)');
  } else {
    fail(`Expected 401 for unauthenticated request, got ${noAuthResp.status}`);
  }

  // Restore cookies
  state.cookies = savedCookies;

  info('Testing non-existent resource...');
  const notFoundResp = await makeRequest('GET', '/api/classes/nonexistent-id');

  if (notFoundResp.status === 404 || notFoundResp.status === 401) {
    pass(`Correctly returned ${notFoundResp.status} for non-existent resource`);
  } else {
    info(`Non-existent resource returned: ${notFoundResp.status}`);
  }
}

async function testDatabase() {
  header('6. DATABASE VERIFICATION');

  if (state.cookies.length === 0) {
    fail('Skipping database tests - no auth');
    return;
  }

  info('Checking database has sample data...');
  const classesResp = await makeRequest('GET', '/api/classes');

  if (classesResp.success) {
    const count = Array.isArray(classesResp.data) ? classesResp.data.length : 0;

    if (count > 0) {
      pass(`Database has class data (${count} classes)`);

      const sample = classesResp.data[0];
      const required = ['id', 'code', 'name'];
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

main();
