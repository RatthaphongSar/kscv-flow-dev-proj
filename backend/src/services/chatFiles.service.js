// backend/src/services/chatFiles.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatFilesService {
  constructor(prisma) {
    this.prisma = prisma || defaultPrisma
  }

  async getFilesByRoom(roomId) {
    return this.prisma.chatFile.findMany({
      where: { roomId },
      include: {
        uploader: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getFileById(fileId, roomId) {
    return this.prisma.chatFile.findFirst({
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

    return this.prisma.chatFile.create({
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

    const file = await this.prisma.chatFile.findFirst({
      where: { id: fileId, roomId },
    })

    if (!file) {
      throw new Error('File not found')
    }

    if (file.uploaderId !== uploaderId) {
      throw new Error('Can only delete your own files')
    }

    await this.prisma.chatFile.delete({ where: { id: fileId } })
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

// Lazy singleton instance
let _instance = null

export function getChatFilesService() {
  if (!_instance) {
    _instance = new ChatFilesService(defaultPrisma)
  }
  return _instance
}

// Default export for backward compatibility
export const chatFilesService = {
  getFilesByRoom(...args) { return getChatFilesService().getFilesByRoom(...args) },
  getFileById(...args) { return getChatFilesService().getFileById(...args) },
  saveFileMetadata(...args) { return getChatFilesService().saveFileMetadata(...args) },
  deleteFile(...args) { return getChatFilesService().deleteFile(...args) },
  formatFileSize(...args) { return getChatFilesService().formatFileSize(...args) },
}
