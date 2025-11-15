// backend/src/services/chatReadReceipts.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatReadReceiptsService {
  constructor(prisma = defaultPrisma) {
    this.prisma = prisma
  }

  async markRoomAsRead(roomId, userId) {
    const messages = await this.prisma.message.findMany({
      where: { roomId },
      select: { id: true },
    })

    const messageIds = messages.map((m) => m.id)

    if (messageIds.length === 0) {
      return { markedCount: 0 }
    }

    const result = await this.prisma.messageRead.createMany({
      data: messageIds.map((messageId) => ({
        messageId,
        userId,
      })),
      skipDuplicates: true,
    })

    return { markedCount: result.count }
  }

  async getUnreadCounts(userId) {
    const rooms = await this.prisma.roomMember.findMany({
      where: { userId },
      select: { roomId: true },
    })

    const roomIds = rooms.map((r) => r.roomId)
    const unreadCounts = {}

    for (const roomId of roomIds) {
      const messages = await this.prisma.message.findMany({
        where: { roomId },
        select: { id: true },
      })

      const messageIds = messages.map((m) => m.id)

      if (messageIds.length === 0) {
        unreadCounts[roomId] = 0
        continue
      }

      const readMessages = await this.prisma.messageRead.findMany({
        where: {
          messageId: { in: messageIds },
          userId,
        },
        select: { messageId: true },
      })

      const readIds = new Set(readMessages.map((r) => r.messageId))
      const unreadCount = messageIds.filter((id) => !readIds.has(id)).length

      unreadCounts[roomId] = unreadCount
    }

    return unreadCounts
  }

  async getMessageReadCount(messageId) {
    return this.prisma.messageRead.count({
      where: { messageId },
    })
  }

  async getMessageReadCounts(messageIds) {
    const result = {}

    for (const msgId of messageIds) {
      result[msgId] = await this.getMessageReadCount(msgId)
    }

    return result
  }

  async getMessageReaders(messageId) {
    return this.prisma.messageRead.findMany({
      where: { messageId },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    })
  }
}

// Export instance with prisma passed explicitly
export const chatReadReceiptsService = new ChatReadReceiptsService(defaultPrisma)
