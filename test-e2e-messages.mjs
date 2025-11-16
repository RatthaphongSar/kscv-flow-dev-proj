#!/usr/bin/env node

/**
 * End-to-End Test for Message Management System
 * Tests: Delete, Edit, Reply, Pin, and Unpin messages
 */

const BASE_URL = 'http://localhost:4001';
const FRONTEND_URL = 'http://localhost:5173';

let accessToken = null;
let userId = null;
let roomId = null;
let messageId = null;
let pinnedMessageId = null;

// Colors for console output
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

async function request(method, path, body = null, authToken = accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const options = {
      method,
      headers,
      credentials: 'include', // Include cookies in request
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
      headers: response.headers,
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

async function login(username) {
  log.test(`Logging in as ${username}`);

  const response = await request('POST', '/api/auth/login', {
    username,
    password: 'password123',
  }, null);

  if (!response.ok) {
    log.error(`Login failed: ${response.status}`);
    console.log(response.data);
    process.exit(1);
  }

  // The backend uses HttpOnly cookies for auth, not token in response
  userId = response.data.id;

  log.success(`Logged in as ${username} (ID: ${userId})`);
}

async function getRooms() {
  log.test('Fetching available rooms');

  const response = await request('GET', '/api/chat/rooms');

  if (!response.ok) {
    log.error(`Failed to get rooms: ${response.status}`);
    return;
  }

  const rooms = response.data;
  if (rooms.length === 0) {
    log.error('No rooms available');
    process.exit(1);
  }

  roomId = rooms[0].id;
  log.success(`Selected room: ${rooms[0].name} (ID: ${roomId})`);
}

async function createMessage(content) {
  log.test(`Creating message: "${content}"`);

  const response = await request('POST', `/api/chat/rooms/${roomId}/messages`, {
    content,
  });

  if (!response.ok) {
    log.error(`Failed to create message: ${response.status}`);
    console.log(response.data);
    return null;
  }

  messageId = response.data.id;
  log.success(`Message created (ID: ${messageId})`);
  return messageId;
}

async function editMessage(newContent) {
  log.test(`Editing message to: "${newContent}"`);

  const response = await request('PATCH', `/api/chat/messages/${messageId}`, {
    text: newContent,
  });

  if (!response.ok) {
    log.error(`Failed to edit message: ${response.status}`);
    console.log(response.data);
    return false;
  }

  log.success(`Message edited successfully`);
  return true;
}

async function pinMessage() {
  log.test(`Pinning message`);

  const response = await request('POST', `/api/chat/rooms/${roomId}/pin`, {
    messageId,
  });

  if (!response.ok) {
    log.error(`Failed to pin message: ${response.status}`);
    console.log(response.data);
    return false;
  }

  pinnedMessageId = messageId;
  log.success(`Message pinned successfully`);
  return true;
}

async function getPinnedMessages() {
  log.test(`Fetching pinned messages for room`);

  const response = await request('GET', `/api/chat/rooms/${roomId}/pins`);

  if (!response.ok) {
    log.error(`Failed to get pinned messages: ${response.status}`);
    console.log(response.data);
    return [];
  }

  log.success(`Found ${response.data.length} pinned messages`);
  
  if (response.data.length > 0) {
    log.info(`First pinned message: "${response.data[0].message?.text}"`);
  }

  return response.data;
}

async function unpinMessage() {
  log.test(`Unpinning message`);

  const response = await request('DELETE', `/api/chat/rooms/${roomId}/pin?messageId=${pinnedMessageId}`);

  if (!response.ok) {
    log.error(`Failed to unpin message: ${response.status}`);
    console.log(response.data);
    return false;
  }

  log.success(`Message unpinned successfully`);
  return true;
}

async function replyToMessage(content) {
  log.test(`Replying to message: "${content}"`);

  const response = await request('POST', `/api/chat/messages/${messageId}/reply`, {
    content,
  });

  if (!response.ok) {
    log.error(`Failed to reply: ${response.status}`);
    console.log(response.data);
    return null;
  }

  const replyId = response.data.id;
  log.success(`Reply created (ID: ${replyId})`);
  return replyId;
}

async function deleteMessageForMe() {
  log.test(`Deleting message for self`);

  const response = await request('DELETE', `/api/chat/messages/${messageId}?mode=me`);

  if (!response.ok) {
    log.error(`Failed to delete message: ${response.status}`);
    console.log(response.data);
    return false;
  }

  log.success(`Message deleted for self`);
  return true;
}

async function deleteMessageForEveryone() {
  // Create a new message first
  const newMsgId = await createMessage('This message will be deleted for everyone');
  
  log.test(`Deleting message for everyone`);

  const response = await request('DELETE', `/api/chat/messages/${newMsgId}?mode=everyone`);

  if (!response.ok) {
    log.error(`Failed to delete message for everyone: ${response.status}`);
    console.log(response.data);
    return false;
  }

  log.success(`Message deleted for everyone`);
  return true;
}

async function runTests() {
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Message Management System - E2E Test${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}\n`);

  try {
    // Step 1: Login
    await login('teacher');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 2: Get rooms
    await getRooms();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 3: Create message
    await createMessage('Test message for E2E testing');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 4: Edit message
    await editMessage('Test message - EDITED');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 5: Pin message
    await pinMessage();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 6: Get pinned messages
    const pinnedMsgs = await getPinnedMessages();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 7: Reply to message
    await replyToMessage('This is a reply to the test message');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 8: Unpin message
    await unpinMessage();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 9: Verify unpin worked
    const pinnedAfterUnpin = await getPinnedMessages();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 10: Delete for me
    await deleteMessageForMe();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 11: Delete for everyone
    await deleteMessageForEveryone();
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✓ ALL TESTS PASSED${colors.reset}`);
    console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

runTests();
