// backend/src/services/chatFileService.js
import { prisma } from '../db.js'
import fs from 'fs'
import path from 'path'

class ChatFileService {
  /**
   * Create file record in database
   */
  async createFileRecord(roomId, uploaderId, file) {
    try {
      const { filename, mimetype, size } = file
      
      // Store file with relative URL path
      const fileUrl = `/uploads/${filename}`
      
      const chatFile = await prisma.chatFile.create({
        data: {
          fileName: filename,
          mimeType: mimetype,
          sizeBytes: size,
          url: fileUrl,
          room: { connect: { id: roomId } },
          uploader: { connect: { id: uploaderId } }
        }
      })
      
      return chatFile
    } catch (err) {
      console.error('[ChatFileService] createFileRecord error:', err)
      throw err
    }
  }

  /**
   * Get all files for a room
   */
  async getFilesByRoom(roomId, limit = 50, offset = 0) {
    try {
      const files = await prisma.chatFile.findMany({
        where: { roomId },
        include: {
          uploader: { select: { id: true, username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })
      
      const total = await prisma.chatFile.count({ where: { roomId } })
      
      return { files, total }
    } catch (err) {
      console.error('[ChatFileService] getFilesByRoom error:', err)
      throw err
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId) {
    try {
      const file = await prisma.chatFile.findUnique({
        where: { id: fileId },
        include: {
          uploader: { select: { id: true, username: true } }
        }
      })
      return file
    } catch (err) {
      console.error('[ChatFileService] getFileById error:', err)
      throw err
    }
  }

  /**
   * Delete file (remove from DB and disk)
   */
  async deleteFile(fileId) {
    try {
      const file = await prisma.chatFile.findUnique({ where: { id: fileId } })
      
      if (!file) {
        throw new Error('File not found')
      }
      
      // Remove from disk
      const filePath = path.join(process.cwd(), 'backend', file.url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      
      // Remove from DB
      await prisma.chatFile.delete({ where: { id: fileId } })
      
      return { success: true }
    } catch (err) {
      console.error('[ChatFileService] deleteFile error:', err)
      throw err
    }
  }

  /**
   * Create message with file attachments
   */
  async createMessageWithFiles(roomId, userId, text, files = []) {
    try {
      const messageData = {
        content: text || '📎 File attachment',
        type: files.length > 0 ? 'file' : 'text',
        user: { connect: { id: userId } },
        room: { connect: { id: roomId } }
      }
      
      // Create message first
      const message = await prisma.message.create({
        data: messageData,
        include: {
          user: { select: { id: true, username: true } },
          files: true,
          readReceipts: { select: { userId: true } }
        }
      })
      
      if (files && files.length > 0) {
        await Promise.all(
          files.map((file) =>
            prisma.chatFile.create({
              data: {
                fileName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                url: `/uploads/${file.filename}`,
                room: { connect: { id: roomId } },
                uploader: { connect: { id: userId } },
                message: { connect: { id: message.id } },
              },
            }),
          ),
        )
      }
      
      return {
        ...message,
        files: message.files
      }
    } catch (err) {
      console.error('[ChatFileService] createMessageWithFiles error:', err)
      throw err
    }
  }

  /**
   * Get file type category
   */
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
    if (mimeType === 'text/plain') return 'text'
    return 'document'
  }
}

export default new ChatFileService()
