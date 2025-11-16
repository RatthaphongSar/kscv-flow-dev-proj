#!/usr/bin/env node

/**
 * End-to-End Test for Message Management System
 * Uses node-fetch with cookie support
 */

import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import { fetchCookie } from 'fetch-cookie';

const BASE_URL = 'http://localhost:4001';
const jar = new CookieJar();
const cookieFetch = fetchCookie(fetch, jar);

let roomId = null;
let messageId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  test: (msg) => console.log(`\n${colors.blue}▶${colors.reset} ${msg}`),
};

async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await cookieFetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    return {
      status: 0,
      data: null,
      ok: false,
      error,
    };
  }
}

async function runTests() {
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Message Management System - E2E Test${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}\n`);

  try {
    // Login
    log.test('Logging in as teacher');
    const loginResp = await request('POST', '/api/auth/login', {
      username: 'teacher',
      password: 'password123',
    });

    if (!loginResp.ok) {
      log.error(`Login failed: ${loginResp.status}`);
      process.exit(1);
    }
    log.success(`Logged in (ID: ${loginResp.data.id})`);

    // Get rooms
    log.test('Fetching rooms');
    const roomsResp = await request('GET', '/api/chat/rooms');
    if (!roomsResp.ok) {
      log.error(`Failed to get rooms: ${roomsResp.status}`);
      process.exit(1);
    }
    roomId = roomsResp.data[0].id;
    log.success(`Room: ${roomsResp.data[0].name}`);

    // Create message
    log.test('Creating message');
    const createResp = await request('POST', `/api/chat/rooms/${roomId}/messages`, {
      content: `Test message ${new Date().toISOString()}`,
    });
    if (!createResp.ok) {
      log.error(`Failed to create message: ${createResp.status}`);
      process.exit(1);
    }
    messageId = createResp.data.id;
    log.success(`Message created (ID: ${messageId})`);

    // Edit message
    log.test('Editing message');
    const editResp = await request('PATCH', `/api/chat/messages/${messageId}`, {
      text: `Updated message - ${new Date().toISOString()}`,
    });
    if (!editResp.ok) {
      log.error(`Failed to edit: ${editResp.status}`);
    } else {
      log.success('Message edited');
    }

    // Reply to message
    log.test('Replying to message');
    const replyResp = await request('POST', `/api/chat/messages/${messageId}/reply`, {
      content: 'This is a reply',
    });
    if (!replyResp.ok) {
      log.error(`Failed to reply: ${replyResp.status}`);
    } else {
      log.success(`Reply created (ID: ${replyResp.data.id})`);
    }

    // Pin message
    log.test('Pinning message');
    const pinResp = await request('POST', `/api/chat/rooms/${roomId}/pin`, {
      messageId,
    });
    if (!pinResp.ok) {
      log.error(`Failed to pin: ${pinResp.status}`);
    } else {
      log.success('Message pinned');
    }

    // Get pinned messages
    log.test('Fetching pinned messages');
    const pinnedResp = await request('GET', `/api/chat/rooms/${roomId}/pins`);
    if (!pinnedResp.ok) {
      log.error(`Failed to get pinned: ${pinnedResp.status}`);
    } else {
      log.success(`Found ${pinnedResp.data.length} pinned messages`);
    }

    // Unpin message
    log.test('Unpinning message');
    const unpinResp = await request('DELETE', `/api/chat/rooms/${roomId}/pin?messageId=${messageId}`);
    if (!unpinResp.ok) {
      log.error(`Failed to unpin: ${unpinResp.status}`);
    } else {
      log.success('Message unpinned');
    }

    // Delete for me
    log.test('Deleting message for self');
    const delMeResp = await request('DELETE', `/api/chat/messages/${messageId}?mode=me`);
    if (!delMeResp.ok) {
      log.error(`Failed: ${delMeResp.status}`);
    } else {
      log.success('Message deleted for self');
    }

    // Create and delete for everyone
    log.test('Creating another message');
    const create2Resp = await request('POST', `/api/chat/rooms/${roomId}/messages`, {
      content: 'This will be deleted for everyone',
    });
    if (create2Resp.ok) {
      const msg2Id = create2Resp.data.id;
      
      log.test('Deleting message for everyone');
      const delAllResp = await request('DELETE', `/api/chat/messages/${msg2Id}?mode=everyone`);
      if (!delAllResp.ok) {
        log.error(`Failed: ${delAllResp.status}`);
      } else {
        log.success('Message deleted for everyone');
      }
    }

    console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✓ ALL TESTS COMPLETED${colors.reset}`);
    console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

runTests();
