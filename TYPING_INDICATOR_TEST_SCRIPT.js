/**
 * Typing Indicator - Quick Testing Script
 * 
 * Paste into browser console to test typing indicator functionality
 * 
 * Usage:
 * 1. Open 2 browser tabs in same room
 * 2. Tab A: Open DevTools Console
 * 3. Paste this entire script
 * 4. Run commands: testTypingStart(), testTypingStop(), testMultipleTypers(), etc.
 */

// ============================================================================
// TEST 1: Emit typing:start event
// ============================================================================
window.testTypingStart = function(userId = 'user-test-1') {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found. Make sure chatSocket is available.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  console.log(`📤 Emitting typing:start for ${userId} in ${roomId}`);
  
  socket.emit('typing:start', {
    roomId,
    userId,
    timestamp: Date.now()
  });
  
  console.log('✅ Event emitted. Check other tab for indicator.');
};

// ============================================================================
// TEST 2: Emit typing:stop event
// ============================================================================
window.testTypingStop = function(userId = 'user-test-1') {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  console.log(`📤 Emitting typing:stop for ${userId} in ${roomId}`);
  
  socket.emit('typing:stop', {
    roomId,
    userId,
    timestamp: Date.now()
  });
  
  console.log('✅ Event emitted. Indicator should disappear.');
};

// ============================================================================
// TEST 3: Simulate typing sequence (start → continue → stop)
// ============================================================================
window.testTypingSequence = function(userId = 'user-test-1', durationMs = 5000) {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  
  console.log(`📝 Starting typing sequence for ${userId}...`);
  
  // Emit start
  socket.emit('typing:start', { roomId, userId, timestamp: Date.now() });
  console.log(`  ✓ Emitted typing:start`);
  
  // Simulate continued typing (send periodic typing:start to refresh)
  const interval = setInterval(() => {
    socket.emit('typing:start', { roomId, userId, timestamp: Date.now() });
    console.log(`  ✓ Emitted typing:start (refresh)`);
  }, 1000);
  
  // Stop after duration
  setTimeout(() => {
    clearInterval(interval);
    socket.emit('typing:stop', { roomId, userId, timestamp: Date.now() });
    console.log(`  ✓ Emitted typing:stop`);
    console.log('✅ Sequence complete.');
  }, durationMs);
  
  console.log(`⏱️  Will stop after ${durationMs}ms`);
};

// ============================================================================
// TEST 4: Simulate multiple users typing
// ============================================================================
window.testMultipleTypers = function(userIds = ['user-test-2', 'user-test-3']) {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  
  console.log(`👥 Starting multiple typers simulation...`);
  
  userIds.forEach((userId) => {
    socket.emit('typing:start', { roomId, userId, timestamp: Date.now() });
    console.log(`  ✓ ${userId} started typing`);
  });
  
  console.log('✅ All users now appear as typing. Should see "X and others are typing…"');
  
  // Auto-stop after 10 seconds
  setTimeout(() => {
    userIds.forEach((userId) => {
      socket.emit('typing:stop', { roomId, userId, timestamp: Date.now() });
    });
    console.log('✅ All users stopped typing.');
  }, 10000);
};

// ============================================================================
// TEST 5: Test debounce behavior
// ============================================================================
window.testDebounce = function(interval = 100, count = 20) {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  const userId = 'user-test-debounce';
  let emitCount = 0;
  
  console.log(`🔄 Testing debounce with ${count} rapid emissions at ${interval}ms intervals...`);
  
  const originalEmit = socket.emit;
  socket.emit = function(event, data) {
    if (event === 'typing:start' || event === 'typing:stop') {
      emitCount++;
      console.log(`  Event #${emitCount}: ${event} (${data.userId})`);
    }
    return originalEmit.call(this, event, data);
  };
  
  // Rapid-fire typing:start events
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      socket.emit('typing:start', { roomId, userId, timestamp: Date.now() });
    }, interval * i);
  }
  
  console.log(`⏱️  Emitting ${count} events at ${interval}ms intervals...`);
  
  // After all events, restore original emit
  setTimeout(() => {
    socket.emit = originalEmit;
    console.log(`📊 Result: ${emitCount} events emitted`);
    console.log(`💡 Expected: ~1-2 (due to debounce)`);
    console.log(`✅ Test complete.`);
  }, interval * count + 1000);
};

// ============================================================================
// TEST 6: Monitor typing events
// ============================================================================
window.startMonitoringTyping = function() {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  console.log('👁️  Monitoring typing events...');
  
  const originalOn = socket.on;
  socket.on = function(event, handler) {
    if (event === 'typing:start' || event === 'typing:stop' || event === 'typing:update') {
      const wrappedHandler = function(data) {
        console.log(`📡 [${event}]`, data);
        return handler.call(this, data);
      };
      return originalOn.call(this, event, wrappedHandler);
    }
    return originalOn.call(this, event, handler);
  };
  
  socket.on('typing:start', (data) => {
    console.log(`  📤 → User ${data.userId} typing in ${data.roomId}`);
  });
  
  socket.on('typing:stop', (data) => {
    console.log(`  📥 ← User ${data.userId} stopped in ${data.roomId}`);
  });
  
  console.log('✅ Monitoring enabled. Watch for typing events below.');
};

window.stopMonitoringTyping = function() {
  console.log('❌ Monitoring stopped.');
};

// ============================================================================
// TEST 7: Check typing state
// ============================================================================
window.checkTypingState = function() {
  const socket = window.chatSocket || window.socket;
  
  console.log('📋 Typing System Status:');
  console.log('-'.repeat(50));
  
  console.log('Socket Status:');
  console.log(`  Connected: ${socket?.connected ? '✅' : '❌'}`);
  console.log(`  Socket ID: ${socket?.id || 'N/A'}`);
  
  console.log('\nAvailable Methods:');
  console.log(`  testTypingStart(userId) - Emit typing:start`);
  console.log(`  testTypingStop(userId) - Emit typing:stop`);
  console.log(`  testTypingSequence(userId, duration) - Full sequence`);
  console.log(`  testMultipleTypers(userIds) - Multiple users`);
  console.log(`  testDebounce(interval, count) - Debounce test`);
  console.log(`  startMonitoringTyping() - Monitor events`);
  console.log(`  checkTypingState() - This command`);
  
  console.log('\nRoom Info:');
  console.log(`  Selected Room: ${window.selectedRoomId || 'N/A'}`);
  console.log(`  Current User: ${window.currentUserId || 'N/A'}`);
  
  console.log('-'.repeat(50));
};

// ============================================================================
// TEST 8: Stress test (many users typing)
// ============================================================================
window.stressTestTyping = function(userCount = 10, durationMs = 30000) {
  const socket = window.chatSocket || window.socket;
  if (!socket) {
    console.error('❌ Socket not found.');
    return;
  }
  
  const roomId = window.selectedRoomId || 'test-room';
  
  console.log(`💥 Starting stress test with ${userCount} users...`);
  
  const users = Array.from({ length: userCount }, (_, i) => `stress-user-${i + 1}`);
  
  // Start all users
  users.forEach((userId) => {
    socket.emit('typing:start', { roomId, userId, timestamp: Date.now() });
  });
  console.log(`✅ ${userCount} users started typing`);
  
  // Random stop/start
  const interval = setInterval(() => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const isStop = Math.random() > 0.5;
    
    socket.emit(isStop ? 'typing:stop' : 'typing:start', {
      roomId,
      userId: randomUser,
      timestamp: Date.now()
    });
  }, 500);
  
  // Stop after duration
  setTimeout(() => {
    clearInterval(interval);
    users.forEach((userId) => {
      socket.emit('typing:stop', { roomId, userId, timestamp: Date.now() });
    });
    console.log(`✅ Stress test complete. All users stopped.`);
  }, durationMs);
  
  console.log(`⏱️  Running for ${durationMs}ms...`);
};

// ============================================================================
// HELPER: Show available tests
// ============================================================================
console.log(`
╔══════════════════════════════════════════════════════════════════╗
║         Typing Indicator - Testing Commands                     ║
╚══════════════════════════════════════════════════════════════════╝

Run these commands in the browser console:

  checkTypingState()
    → Show system status and available commands
    
  testTypingStart()
    → Send typing:start event (appears on other tab)
    
  testTypingStop()
    → Send typing:stop event (disappears on other tab)
    
  testTypingSequence('user-123', 5000)
    → Full typing sequence (5 second duration)
    
  testMultipleTypers(['user-2', 'user-3'])
    → Simulate multiple users typing simultaneously
    
  testDebounce(100, 20)
    → Test debounce with 20 events at 100ms intervals
    
  startMonitoringTyping()
    → Monitor all typing events in real-time
    
  stressTestTyping(10, 30000)
    → Stress test with 10 users for 30 seconds

USAGE:
  1. Open 2 browser tabs in same room
  2. Tab A: Open DevTools (F12)
  3. Paste this entire script
  4. Run a test command above
  5. Watch Tab B for typing indicator
  
EXAMPLES:
  testTypingStart('alice')
  testTypingSequence('bob', 3000)
  testMultipleTypers(['alice', 'bob', 'charlie'])
`);
