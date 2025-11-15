// backend/src/controllers/chatExtended.js
import { prisma } from '../db.js'
import { chatNotesService } from '../services/chatNotes.service.js'
import { chatFilesService } from '../services/chatFiles.service.js'
import { chatReadReceiptsService } from '../services/chatReadReceipts.service.js'
import { chatMembersService } from '../services/chatMembers.service.js'

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

    const isMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const notes = await chatNotesService.getNotesByRoom(roomId)
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
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const note = await chatNotesService.getNoteById(noteId, roomId)
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

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const note = await chatNotesService.createNote(roomId, currentUser.id, currentUser.role, { title, content })
    return res.status(201).json(note)
  } catch (err) {
    if (err.message.includes('Only teachers')) {
      return res.status(403).json({ error: err.message })
    }
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

    try {
      const updated = await chatNotesService.updateNote(noteId, roomId, currentUser.id, currentUser.role, { title, content })
      return res.json(updated)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message })
      }
      if (err.message.includes('Can only update')) {
        return res.status(403).json({ error: err.message })
      }
      throw err
    }
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

    try {
      const result = await chatNotesService.deleteNote(noteId, roomId, currentUser.id, currentUser.role)
      return res.json(result)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message })
      }
      if (err.message.includes('Can only delete')) {
        return res.status(403).json({ error: err.message })
      }
      throw err
    }
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
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const files = await chatFilesService.getFilesByRoom(roomId)
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
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const file = await chatFilesService.getFileById(fileId, roomId)
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

    if (!fileName || !mimeType || !sizeBytes || !url) {
      return res.status(400).json({ error: 'fileName, mimeType, sizeBytes, url are required' })
    }

    const isMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    try {
      const file = await chatFilesService.saveFileMetadata(roomId, currentUser.id, currentUser.role, {
        fileName,
        mimeType,
        sizeBytes,
        url,
        width,
        height,
      })
      return res.status(201).json(file)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      throw err
    }
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

    try {
      const result = await chatFilesService.deleteFile(fileId, roomId, currentUser.id, currentUser.role)
      return res.json(result)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message })
      }
      if (err.message.includes('Can only delete')) {
        return res.status(403).json({ error: err.message })
      }
      throw err
    }
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
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const members = await chatMembersService.getRoomMembers(roomId)
    return res.json(members)
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

    const available = await chatMembersService.getAvailableMembers(roomId)
    return res.json(available)
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

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    try {
      const member = await chatMembersService.addMember(roomId, userId, currentUser.role)
      return res.status(201).json(member)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message.includes('already a member')) {
        return res.status(409).json({ error: err.message })
      }
      throw err
    }
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

    try {
      const result = await chatMembersService.removeMember(roomId, userId, currentUser.role, currentUser.id)
      return res.json(result)
    } catch (err) {
      if (err.message.includes('Only teachers')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message.includes('Cannot remove')) {
        return res.status(400).json({ error: err.message })
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message })
      }
      throw err
    }
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

    const isMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: currentUser.id } },
    })

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this room' })
    }

    const result = await chatReadReceiptsService.markRoomAsRead(roomId, currentUser.id)
    return res.json(result)
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

    const readers = await chatReadReceiptsService.getMessageReaders(messageId)
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

    const unreadCounts = await chatReadReceiptsService.getUnreadCounts(currentUser.id)
    return res.json(unreadCounts)
  } catch (err) {
    console.error('getUnreadSummary error:', err)
    return next(err)
  }
}
