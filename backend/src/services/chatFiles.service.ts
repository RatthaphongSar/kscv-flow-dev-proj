import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface FileMetadata {
  fileName: string
  mimeType: string
  sizeBytes: number
  url: string
  width?: number
  height?: number
}

@Injectable()
export class ChatFilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all files for a room
   */
  async getFilesByRoom(roomId: string) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    const files = await this.prisma.chatFile.findMany({
      where: { roomId },
      include: {
        uploader: {
          select: { id: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return files
  }

  /**
   * Get a single file
   */
  async getFileById(fileId: string) {
    const file = await this.prisma.chatFile.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: { id: true, username: true }
        }
      }
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    return file
  }

  /**
   * Save file metadata (called after successful file upload to storage)
   * 
   * @param roomId - The room ID
   * @param uploaderId - The user uploading
   * @param metadata - File metadata including storage URL
   * @returns Created ChatFile record
   */
  async saveFileMetadata(
    roomId: string,
    uploaderId: string,
    metadata: FileMetadata,
    createMessageAttachment: boolean = false
  ) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    // Verify user is member of room
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId: uploaderId }
    })

    if (!membership) {
      throw new BadRequestException('User is not a member of this room')
    }

    const file = await this.prisma.chatFile.create({
      data: {
        fileName: metadata.fileName,
        mimeType: metadata.mimeType,
        sizeBytes: metadata.sizeBytes,
        url: metadata.url,
        width: metadata.width,
        height: metadata.height,
        roomId,
        uploaderId
      },
      include: {
        uploader: {
          select: { id: true, username: true }
        }
      }
    })

    return file
  }

  /**
   * Create a file message in the chat
   * This links a ChatFile to a Message record
   */
  async createFileMessage(
    roomId: string,
    fileId: string,
    senderId: string,
    messageType: 'file' | 'image'
  ) {
    // Verify file exists
    const file = await this.prisma.chatFile.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    if (file.roomId !== roomId) {
      throw new BadRequestException('File does not belong to this room')
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        type: messageType,
        content: file.fileName,
        roomId,
        userId: senderId,
        fileId
      },
      include: {
        user: { select: { id: true, username: true } },
        file: { select: { id: true, fileName: true, mimeType: true, url: true, width: true, height: true } }
      }
    })

    return message
  }

  /**
   * Delete a file (teacher or uploader only)
   */
  async deleteFile(fileId: string, userId: string, userRole: string) {
    const file = await this.prisma.chatFile.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    // Only uploader or teacher can delete
    if (file.uploaderId !== userId && userRole !== 'TEACHER') {
      throw new BadRequestException('You cannot delete this file')
    }

    await this.prisma.chatFile.delete({
      where: { id: fileId }
    })

    return { success: true }
  }

  /**
   * Helper: Human-readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}
