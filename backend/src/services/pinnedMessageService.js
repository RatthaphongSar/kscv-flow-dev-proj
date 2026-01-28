import { prisma } from '../db.js';

/**
 * Pin a message in a room
 * @param {string} messageId - Message ID
 * @param {string} roomId - Room ID
 * @param {string} userId - User ID (who is pinning)
 * @returns {Promise<Object>} Pinned message record
 */
export const pinMessage = async (messageId, roomId, userId) => {
  // Verify message exists and belongs to the room
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  if (message.roomId !== roomId) {
    throw new Error('Message does not belong to this room');
  }

  // Check authorization - only room admin can pin
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (room.createdById !== userId) {
    throw new Error('Unauthorized: Only room admin can pin messages');
  }

  // Check if already pinned
  const existing = await prisma.pinnedMessage.findUnique({
    where: {
      messageId_roomId: {
        messageId,
        roomId,
      },
    },
  });

  if (existing) {
    return existing; // Already pinned
  }

  // Pin the message
  const pinnedMessage = await prisma.pinnedMessage.create({
    data: {
      messageId,
      roomId,
      pinnedBy: userId,
    },
    include: {
      message: {
        include: {
          user: true,
          files: true,
          replyTo: {
            include: { user: true },
          },
        },
      },
      user: true,
    },
  });

  return pinnedMessage;
};

/**
 * Unpin a message from a room
 * @param {string} messageId - Message ID
 * @param {string} roomId - Room ID
 * @param {string} userId - User ID (who is unpinning)
 * @returns {Promise<Object>} Success status
 */
export const unpinMessage = async (messageId, roomId, userId) => {
  // Check authorization
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (room.createdById !== userId) {
    throw new Error('Unauthorized: Only room admin can unpin messages');
  }

  // Delete the pin
  await prisma.pinnedMessage.delete({
    where: {
      messageId_roomId: {
        messageId,
        roomId,
      },
    },
  });

  return { success: true, messageId, roomId };
};

/**
 * Get all pinned messages in a room
 * @param {string} roomId - Room ID
 * @returns {Promise<Array>} Array of pinned messages
 */
export const getPinnedMessages = async (roomId) => {
  const pinnedMessages = await prisma.pinnedMessage.findMany({
    where: { roomId },
    include: {
      message: {
        include: {
          user: true,
          files: true,
          replyTo: {
            include: { user: true },
          },
        },
      },
      user: true,
    },
    orderBy: { pinnedAt: 'desc' },
  });

  return pinnedMessages;
};

/**
 * Check if a message is pinned in a room
 * @param {string} messageId - Message ID
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} True if pinned
 */
export const isPinned = async (messageId, roomId) => {
  const pinnedMessage = await prisma.pinnedMessage.findUnique({
    where: {
      messageId_roomId: {
        messageId,
        roomId,
      },
    },
  });

  return !!pinnedMessage;
};

/**
 * Get pinned message count for a room
 * @param {string} roomId - Room ID
 * @returns {Promise<number>} Number of pinned messages
 */
export const getPinnedMessageCount = async (roomId) => {
  const count = await prisma.pinnedMessage.count({
    where: { roomId },
  });

  return count;
};
