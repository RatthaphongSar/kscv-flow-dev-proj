// backend/src/controllers/chatExtended.js
import { prisma } from '../db.js'

// ==================== CHAT NOTES ====================

/**
 * GET /rooms/:roomId/notes
 * Fetch all notes for a room
 */
export const getNotes = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Verify user is member of room
    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const notes = await prisma.chatNote.findMany({
      where: { roomId },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return res.json(notes)
  } catch (err) {
    console.error('getNotes error:', err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/notes/:noteId
 * Fetch single note
 */
export const getNote = async (req, res, next) => {
  try {
    const { roomId, noteId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const note = await prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    return res.json(note)
  } catch (err) {
    console.error('getNote error:', err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/notes
 * Create note (teacher-only)
 */
export const createNote = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { title, content } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create notes' })
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const note = await prisma.chatNote.create({
      data: {
        roomId,
        authorId: currentUser.id,
        title,
        content,
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })

    return res.status(201).json(note)
  } catch (err) {
    console.error('createNote error:', err)
    return next(err)
  }
}

/**
 * PUT /rooms/:roomId/notes/:noteId
 * Update note (teacher-only, author only)
 */
export const updateNote = async (req, res, next) => {
  try {
    const { roomId, noteId } = req.params
    const { title, content } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can update notes' })
    }

    const note = await prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    if (note.authorId !== currentUser.id) {
      return res.status(403).json({ error: 'Can only update your own notes' })
    }

    const updated = await prisma.chatNote.update({
      where: { id: noteId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })

    return res.json(updated)
  } catch (err) {
    console.error('updateNote error:', err)
    return next(err)
  }
}

/**
 * DELETE /rooms/:roomId/notes/:noteId
 * Delete note (teacher-only, author only)
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { roomId, noteId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can delete notes' })
    }

    const note = await prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    if (note.authorId !== currentUser.id) {
      return res.status(403).json({ error: 'Can only delete your own notes' })
    }

    await prisma.chatNote.delete({ where: { id: noteId } })

    return res.json({ success: true })
  } catch (err) {
    console.error('deleteNote error:', err)
    return next(err)
  }
}

// ==================== CHAT FILES ====================

/**
 * GET /rooms/:roomId/files
 * Fetch all files for a room
 */
export const getFiles = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const files = await prisma.chatFile.findMany({
      where: { roomId },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(files)
  } catch (err) {
    console.error('getFiles error:', err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/files/:fileId
 * Fetch single file
 */
export const getFile = async (req, res, next) => {
  try {
    const { roomId, fileId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const file = await prisma.chatFile.findFirst({
      where: { id: fileId, roomId },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    return res.json(file)
  } catch (err) {
    console.error('getFile error:', err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/files
 * Upload file metadata (teacher-only)
 */
export const uploadFile = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { fileName, mimeType, sizeBytes, url, width, height } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can upload files' })
    }

    if (!fileName || !mimeType || !sizeBytes || !url) {
      return res.status(400).json({ error: 'fileName, mimeType, sizeBytes, url are required' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const file = await prisma.chatFile.create({
      data: {
        roomId,
        uploaderId: currentUser.id,
        fileName,
        mimeType,
        sizeBytes: parseInt(sizeBytes),
        url,
        ...(width && { width: parseInt(width) }),
        ...(height && { height: parseInt(height) }),
      },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
    })

    return res.status(201).json(file)
  } catch (err) {
    console.error('uploadFile error:', err)
    return next(err)
  }
}

/**
 * DELETE /rooms/:roomId/files/:fileId
 * Delete file (teacher-only, uploader only)
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { roomId, fileId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can delete files' })
    }

    const file = await prisma.chatFile.findFirst({
      where: { id: fileId, roomId },
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    if (file.uploaderId !== currentUser.id) {
      return res.status(403).json({ error: 'Can only delete your own files' })
    }

    await prisma.chatFile.delete({ where: { id: fileId } })

    return res.json({ success: true })
  } catch (err) {
    console.error('deleteFile error:', err)
    return next(err)
  }
}

// ==================== CHAT MEMBERS ====================

/**
 * GET /rooms/:roomId/members
 * Fetch room members
 */
export const getRoomMembers = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, username: true, role: true, email: true } },
      },
      orderBy: { user: { role: 'asc' } },
    })

    return res.json(members.map((m) => m.user))
  } catch (err) {
    console.error('getRoomMembers error:', err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/members/available
 * Fetch available users to add (not yet in room)
 */
export const getAvailableMembers = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can add members' })
    }

    // Get existing members
    const existingMembers = await prisma.roomMember.findMany({
      where: { roomId },
      select: { userId: true },
    })

    const existingIds = existingMembers.map((m) => m.userId)

    // Get all users not in this room
    const availableUsers = await prisma.user.findMany({
      where: {
        id: { notIn: existingIds },
      },
      select: { id: true, username: true, role: true, email: true },
      orderBy: { role: 'asc' },
    })

    return res.json(availableUsers)
  } catch (err) {
    console.error('getAvailableMembers error:', err)
    return next(err)
  }
}

/**
 * POST /rooms/:roomId/members
 * Add member to room (teacher-only)
 */
export const addMember = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const { userId } = req.body
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can add members' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    // Check if already a member
    const existing = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' })
    }

    // Add member
    const member = await prisma.roomMember.create({
      data: { roomId, userId },
      include: {
        user: { select: { id: true, username: true, role: true, email: true } },
      },
    })

    return res.status(201).json(member.user)
  } catch (err) {
    console.error('addMember error:', err)
    return next(err)
  }
}

/**
 * DELETE /rooms/:roomId/members/:userId
 * Remove member from room (teacher-only)
 */
export const removeMember = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can remove members' })
    }

    if (userId === currentUser.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' })
    }

    const existing = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Member not found in this room' })
    }

    await prisma.roomMember.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    return res.json({ success: true })
  } catch (err) {
    console.error('removeMember error:', err)
    return next(err)
  }
}

// ==================== CHAT READ RECEIPTS ====================

/**
 * POST /rooms/:roomId/messages/mark-read
 * Mark room as read
 */
export const markRoomAsRead = async (req, res, next) => {
  try {
    const { roomId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Verify user is member of room
    const isMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId: currentUser.id },
      },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    // Get all messages in room
    const messages = await prisma.message.findMany({
      where: { roomId },
      select: { id: true },
    })

    const messageIds = messages.map((m) => m.id)

    if (messageIds.length === 0) {
      return res.json({ markedCount: 0 })
    }

    // Create MessageRead entries (skip duplicates)
    const result = await prisma.messageRead.createMany({
      data: messageIds.map((messageId) => ({
        messageId,
        userId: currentUser.id,
      })),
      skipDuplicates: true,
    })

    return res.json({ markedCount: result.count })
  } catch (err) {
    console.error('markRoomAsRead error:', err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/messages/read-receipts
 * Batch fetch read receipts for messages
 * query: ?messageIds=id1,id2,id3
 */
export const getReadReceipts = async (req, res, next) => {
  try {
    const { roomId } = req.query
    const messageIds = req.query.messageIds ? req.query.messageIds.split(',') : []
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!messageIds || messageIds.length === 0) {
      return res.json({})
    }

    const readReceipts = await prisma.messageRead.findMany({
      where: { messageId: { in: messageIds } },
      select: { messageId: true, userId: true },
    })

    const result = {}
    messageIds.forEach((msgId) => {
      const reads = readReceipts.filter((r) => r.messageId === msgId)
      result[msgId] = reads.map((r) => r.userId)
    })

    return res.json(result)
  } catch (err) {
    console.error('getReadReceipts error:', err)
    return next(err)
  }
}

/**
 * GET /rooms/:roomId/messages/:messageId/readers
 * Get who read a specific message
 */
export const getMessageReaders = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const message = await prisma.message.findFirst({
      where: { id: messageId, roomId },
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    const readers = await prisma.messageRead.findMany({
      where: { messageId },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    })

    return res.json(readers.map((r) => r.user))
  } catch (err) {
    console.error('getMessageReaders error:', err)
    return next(err)
  }
}

// ==================== UNREAD SUMMARY ====================

/**
 * GET /unread-summary
 * Fetch unread count for all rooms of current user
 */
export const getUnreadSummary = async (req, res, next) => {
  try {
    const currentUser = req.user

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get all rooms for user
    const rooms = await prisma.roomMember.findMany({
      where: { userId: currentUser.id },
      select: { roomId: true },
    })

    const roomIds = rooms.map((r) => r.roomId)

    if (roomIds.length === 0) {
      return res.json({})
    }

    // For each room, count unread messages (messages without MessageRead entry for this user)
    const unreadCounts = {}

    for (const roomId of roomIds) {
      const messages = await prisma.message.findMany({
        where: { roomId },
        select: { id: true },
      })

      const messageIds = messages.map((m) => m.id)

      if (messageIds.length === 0) {
        unreadCounts[roomId] = 0
        continue
      }

      const readMessages = await prisma.messageRead.findMany({
        where: {
          messageId: { in: messageIds },
          userId: currentUser.id,
        },
        select: { messageId: true },
      })

      const readIds = new Set(readMessages.map((r) => r.messageId))
      const unreadCount = messageIds.filter((id) => !readIds.has(id)).length

      unreadCounts[roomId] = unreadCount
    }

    return res.json(unreadCounts)
  } catch (err) {
    console.error('getUnreadSummary error:', err)
    return next(err)
  }
}
