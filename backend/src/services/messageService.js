import { prisma } from '../db.js';

/**
 * Delete a message for the current user only (ลบเฉพาะสำหรับตัวเอง)
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID performing the deletion
 * @returns {Promise<Object>} Updated message or null if already deleted
 */
export const deleteMessageForUser = async (messageId, userId) => {
  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { author: true },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check authorization - only author or admin can delete
  if (message.authorId !== userId) {
    throw new Error('Unauthorized: Only message author can delete');
  }

  // Record the deletion for this user
  await prisma.deletedMessagePerUser.upsert({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
    create: {
      messageId,
      userId,
      deletedAt: new Date(),
    },
    update: {
      deletedAt: new Date(),
    },
  });

  return { success: true, deletedForUser: true };
};

/**
 * Delete a message for everyone (hard delete)
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID performing the deletion
 * @returns {Promise<Object>} Success status
 */
export const deleteMessageForEveryone = async (messageId, userId) => {
  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { author: true, room: true },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check authorization - only author or room admin can delete for everyone
  const room = await prisma.room.findUnique({
    where: { id: message.roomId },
    include: { createdBy: true },
  });

  const isAuthor = message.authorId === userId;
  const isRoomAdmin = room.createdBy.id === userId;

  if (!isAuthor && !isRoomAdmin) {
    throw new Error('Unauthorized: Only author or room admin can delete for everyone');
  }

  // Mark as deleted for everyone
  await prisma.message.update({
    where: { id: messageId },
    data: {
      deletedForEveryone: true,
    },
  });

  return { success: true, deletedForEveryone: true };
};

/**
 * Edit a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID performing the edit
 * @param {string} newContent - New message content
 * @returns {Promise<Object>} Updated message
 */
export const editMessage = async (messageId, userId, newContent) => {
  if (!newContent || newContent.trim() === '') {
    throw new Error('Message content cannot be empty');
  }

  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check authorization - only author can edit
  if (message.authorId !== userId) {
    throw new Error('Unauthorized: Only message author can edit');
  }

  // Check if message was already deleted for everyone
  if (message.deletedForEveryone) {
    throw new Error('Cannot edit a message that was deleted for everyone');
  }

  // Update the message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent.trim(),
      editedAt: new Date(),
    },
    include: {
      author: true,
      file: true,
      replyTo: {
        include: { author: true },
      },
    },
  });

  return updatedMessage;
};

/**
 * Reply to a message
 * @param {string} roomId - Room ID
 * @param {string} userId - User ID (author of reply)
 * @param {string} content - Reply content
 * @param {string} replyToId - ID of message being replied to
 * @param {string} fileId - Optional file ID
 * @returns {Promise<Object>} Created reply message
 */
export const replyMessage = async (roomId, userId, content, replyToId, fileId = null) => {
  if (!content || content.trim() === '') {
    throw new Error('Message content cannot be empty');
  }

  // Verify the original message exists and is in the same room
  const originalMessage = await prisma.message.findUnique({
    where: { id: replyToId },
    include: { author: true },
  });

  if (!originalMessage) {
    throw new Error('Message to reply to not found');
  }

  if (originalMessage.roomId !== roomId) {
    throw new Error('Cannot reply to message from different room');
  }

  // Create the reply message
  const replyMessage = await prisma.message.create({
    data: {
      content: content.trim(),
      authorId: userId,
      roomId,
      replyToId,
      fileId: fileId || null,
    },
    include: {
      author: true,
      file: true,
      replyTo: {
        include: { author: true },
      },
    },
  });

  return replyMessage;
};

/**
 * Get a message with all details
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (for checking deletions)
 * @returns {Promise<Object>} Message with metadata
 */
export const getMessage = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      author: true,
      file: true,
      replyTo: {
        include: { author: true },
      },
      deletedForUsers: true,
      pinnedIn: true,
      readReceipts: true,
    },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check if deleted for current user
  const deletedForCurrentUser = message.deletedForUsers.some((d) => d.userId === userId);

  return {
    ...message,
    deletedForCurrentUser,
    isDeletedForEveryone: message.deletedForEveryone,
  };
};

/**
 * Get all messages in a room (filtered for current user)
 * @param {string} roomId - Room ID
 * @param {string} userId - Current user ID
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} Messages visible to the user
 */
export const getRoomMessages = async (roomId, userId, limit = 50, offset = 0) => {
  // Get user's deleted messages
  const deletedForUser = await prisma.deletedMessagePerUser.findMany({
    where: { userId },
    select: { messageId: true },
  });

  const deletedMessageIds = deletedForUser.map((d) => d.messageId);

  // Fetch messages, excluding deleted ones
  const messages = await prisma.message.findMany({
    where: {
      roomId,
      AND: [
        { id: { notIn: deletedMessageIds } }, // Not deleted for this user
        { deletedForEveryone: false }, // Not deleted for everyone
      ],
    },
    include: {
      author: true,
      file: true,
      replyTo: {
        include: { author: true },
      },
      pinnedIn: true,
      readReceipts: true,
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
  });

  return messages;
};

/**
 * Get message edit history
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Message with edit timestamps
 */
export const getMessageHistory = async (messageId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      author: true,
    },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    edited: message.editedAt !== null,
    author: message.author,
  };
};
