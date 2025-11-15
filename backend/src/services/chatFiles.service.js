// backend/src/services/chatFiles.service.js
import { prisma } from '../db.js'

export class ChatFilesService {
  async getFilesByRoom(roomId) {
    return prisma.chatFile.findMany({
      where: { roomId },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getFileById(fileId, roomId) {
    return prisma.chatFile.findFirst({
      where: { id: fileId, roomId },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
    })
  }

  async saveFileMetadata(roomId, uploaderId, uploaderRole, data) {
    if (uploaderRole !== 'TEACHER') {
      throw new Error('Only teachers can upload files')
    }

    return prisma.chatFile.create({
      data: {
        roomId,
        uploaderId,
        fileName: data.fileName,
        mimeType: data.mimeType,
        sizeBytes: parseInt(data.sizeBytes),
        url: data.url,
        ...(data.width && { width: parseInt(data.width) }),
        ...(data.height && { height: parseInt(data.height) }),
      },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
    })
  }

  async deleteFile(fileId, roomId, uploaderId, uploaderRole) {
    if (uploaderRole !== 'TEACHER') {
      throw new Error('Only teachers can delete files')
    }

    const file = await prisma.chatFile.findFirst({
      where: { id: fileId, roomId },
    })

    if (!file) {
      throw new Error('File not found')
    }

    if (file.uploaderId !== uploaderId) {
      throw new Error('Can only delete your own files')
    }

    await prisma.chatFile.delete({ where: { id: fileId } })
    return { success: true }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}

export const chatFilesService = new ChatFilesService()
