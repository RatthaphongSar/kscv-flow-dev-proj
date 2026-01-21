/**
 * Backend Socket.io Typing Indicator Handlers
 * 
 * Place this in your backend socket handlers (e.g., src/socket.js or socket/typing.js)
 * 
 * This handles:
 * - Receiving typing:start events from clients
 * - Broadcasting to other users in the same room
 * - Receiving typing:stop events from clients
 * - Auto-cleanup if connection drops
 * - Timeout cleanup (auto-stop after 30 seconds without refresh)
 */

/**
 * Track active typers per room
 * Structure: { roomId: { userId: { timestamp, timeout } } }
 */
const activeTypers = {};

/**
 * Constants
 */
const TYPING_TIMEOUT = 30000; // 30 seconds - auto-stop if no refresh
const TYPING_CLEANUP_INTERVAL = 5000; // Check for stale typing every 5 seconds

/**
 * Initialize typing indicator system
 * Call this once when server starts
 */
export function initializeTypingIndicatorSystem(io) {
  console.log('[Typing] Initializing typing indicator system');

  // Cleanup stale typers periodically
  setInterval(() => {
    cleanupStaleTypers(io);
  }, TYPING_CLEANUP_INTERVAL);
}

/**
 * Register socket listeners for a client connection
 * Call this in your socket connection handler
 * 
 * @param socket - Socket.io socket instance
 * @param userId - User ID of connected client
 */
export function registerTypingIndicatorListeners(socket, userId) {
  const io = socket?.nsp?.server;
  /**
   * Handle typing:start event
   * Client emits when user starts typing
   * 
   * Expected payload: { roomId, userId, timestamp? }
   */
  socket.on('typing:start', (data) => {
    const { roomId, userId: emittedUserId, timestamp } = data;

    // Validate
    if (!roomId || !emittedUserId) {
      console.warn('[Typing] Invalid typing:start payload', data);
      return;
    }

    // Security: Verify user is allowed to send typing events for their own ID
    if (emittedUserId !== userId) {
      console.warn(
        `[Typing] User ${userId} tried to emit typing:start for user ${emittedUserId}`
      );
      return;
    }

    // Verify user is in room (optional, depends on your auth)
    // if (!isUserInRoom(userId, roomId)) return;

    console.log(
      `[Typing] User ${userId} started typing in room ${roomId}`
    );

    // Initialize room if needed
    if (!activeTypers[roomId]) {
      activeTypers[roomId] = {};
    }

    // Clear any existing timeout for this user
    if (activeTypers[roomId][userId]?.timeout) {
      clearTimeout(activeTypers[roomId][userId].timeout);
    }

    // Mark user as typing
    const now = Date.now();
    activeTypers[roomId][userId] = {
      timestamp: timestamp || now,
      timeout: setTimeout(() => {
        console.log(
          `[Typing] Auto-stopping typing indicator for ${userId} in ${roomId} (timeout)`
        );
        removeTyper(io, roomId, userId);
      }, TYPING_TIMEOUT),
    };

    // Broadcast typing:start to all other users in room
    socket.to(roomId).emit('typing:start', {
      roomId,
      userId,
      timestamp: timestamp || now,
    });
  });

  /**
   * Handle typing:stop event
   * Client emits when user stops typing
   * 
   * Expected payload: { roomId, userId, timestamp? }
   */
  socket.on('typing:stop', (data) => {
    const { roomId, userId: emittedUserId } = data;

    // Validate
    if (!roomId || !emittedUserId) {
      console.warn('[Typing] Invalid typing:stop payload', data);
      return;
    }

    // Security: Verify user is allowed to send typing events for their own ID
    if (emittedUserId !== userId) {
      console.warn(
        `[Typing] User ${userId} tried to emit typing:stop for user ${emittedUserId}`
      );
      return;
    }

    console.log(`[Typing] User ${userId} stopped typing in room ${roomId}`);

    removeTyper(io, roomId, userId);
  });

  /**
   * Handle disconnect
   * Auto-stop typing indicator when client disconnects
   */
  socket.on('disconnect', () => {
    console.log(`[Typing] User ${userId} disconnected, clearing typing status`);

    // Remove this user from all rooms
    for (const roomId in activeTypers) {
      if (activeTypers[roomId][userId]) {
        removeTyper(io, roomId, userId);
      }
    }
  });
}

/**
 * Remove typer and broadcast typing:stop to room
 * 
 * @param io - Socket.io instance
 * @param roomId - Room ID
 * @param userId - User ID to remove
 */
function removeTyper(io, roomId, userId) {
  if (!activeTypers[roomId] || !activeTypers[roomId][userId]) {
    return; // Already removed
  }

  // Clear timeout
  if (activeTypers[roomId][userId].timeout) {
    clearTimeout(activeTypers[roomId][userId].timeout);
  }

  // Remove from tracking
  delete activeTypers[roomId][userId];

  // Clean up empty room entries
  if (Object.keys(activeTypers[roomId]).length === 0) {
    delete activeTypers[roomId];
  }

  // Broadcast typing:stop to room
  io.to(roomId).emit('typing:stop', {
    roomId,
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Check for stale typers and auto-cleanup
 * Periodically called to ensure typing indicators don't hang
 */
function cleanupStaleTypers(io) {
  const now = Date.now();
  let cleaned = 0;

  for (const roomId in activeTypers) {
    for (const userId in activeTypers[roomId]) {
      const typingData = activeTypers[roomId][userId];
      const age = now - typingData.timestamp;

      if (age > TYPING_TIMEOUT) {
        console.log(
          `[Typing] Cleaning up stale typer: ${userId} in ${roomId} (age: ${age}ms)`
        );
        removeTyper(io, roomId, userId);
        cleaned++;
      }
    }
  }

  if (cleaned > 0) {
    console.log(`[Typing] Cleaned up ${cleaned} stale typers`);
  }
}

/**
 * Get current typers for a room
 * Useful for admin/debug endpoints
 */
export function getRoomTypers(roomId) {
  return activeTypers[roomId]
    ? Object.keys(activeTypers[roomId])
    : [];
}

/**
 * Get all active typing across all rooms
 * Useful for stats/monitoring
 */
export function getAllActiveTyping() {
  const stats = {};
  for (const roomId in activeTypers) {
    stats[roomId] = Object.keys(activeTypers[roomId]);
  }
  return stats;
}

/**
 * Clear all typing for a room
 * Useful when room is deleted or cleared
 */
export function clearRoomTyping(io, roomId) {
  if (!activeTypers[roomId]) return;

  const userIds = Object.keys(activeTypers[roomId]);
  for (const userId of userIds) {
    removeTyper(io, roomId, userId);
  }
}

/**
 * Force stop a user's typing in a room
 * Useful for moderation
 */
export function forceStopUserTyping(io, roomId, userId) {
  removeTyper(io, roomId, userId);
}

/**
 * USAGE IN YOUR SOCKET FILE:
 * 
 * =============================
 * Example: src/socket.js
 * =============================
 * 
 * import {
 *   initializeTypingIndicatorSystem,
 *   registerTypingIndicatorListeners,
 * } from './typing-handlers';
 * 
 * export function setupSocket(io) {
 *   // Initialize typing system once
 *   initializeTypingIndicatorSystem(io);
 *   
 *   io.on('connection', (socket) => {
 *     const userId = socket.handshake.auth.userId;
 *     
 *     // Register typing listeners
 *     registerTypingIndicatorListeners(socket, userId);
 *     
 *     // ... other socket handlers
 *   });
 * }
 * 
 * =============================
 * 
 * EXPECTED CLIENT EMISSIONS:
 * =============================
 * 
 * 1. Client starts typing:
 *    socket.emit('typing:start', {
 *      roomId: '123',
 *      userId: 'user-1',
 *      timestamp: Date.now()
 *    });
 * 
 * 2. Client stops typing:
 *    socket.emit('typing:stop', {
 *      roomId: '123',
 *      userId: 'user-1',
 *      timestamp: Date.now()
 *    });
 * 
 * =============================
 * 
 * BROADCAST TO CLIENTS:
 * =============================
 * 
 * 1. Other users in room receive:
 *    socket.on('typing:start', (data) => {
 *      // { roomId, userId, timestamp }
 *    });
 * 
 * 2. Other users in room receive:
 *    socket.on('typing:stop', (data) => {
 *      // { roomId, userId, timestamp }
 *    });
 * 
 * =============================
 * 
 * FEATURES:
 * =============================
 * 
 * - Automatic timeout cleanup (30 seconds)
 * - Disconnection cleanup
 * - Prevents double-typing (overwrites previous)
 * - Room isolation (typers only broadcast to their room)
 * - Security checks (user can only emit for their own ID)
 * - Admin functions (getRoomTypers, getAllActiveTyping, etc.)
 * - Periodic stale typer cleanup
 * - Detailed logging for debugging
 * 
 * =============================
 */
