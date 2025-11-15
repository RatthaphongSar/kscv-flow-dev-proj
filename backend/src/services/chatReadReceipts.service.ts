import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatReadReceiptsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mark messages in a room as read for a user
   * Creates MessageRead entries for all messages up to lastMessageId
   */
  async markRoomAsRead(roomId: string, userId: string, lastMessageId: string) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    // Verify user is member
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId }
    })

    if (!membership) {
      throw new BadRequestException('User is not a member of this room')
    }

    // Verify last message exists
    const lastMessage = await this.prisma.message.findUnique({
      where: { id: lastMessageId }
    })

    if (!lastMessage || lastMessage.roomId !== roomId) {
      throw new BadRequestException('Invalid message ID')
    }

    // Find all messages in room that were created before or at lastMessage time
    const messagesToMark = await this.prisma.message.findMany({
      where: {
        roomId,
        createdAt: { lte: lastMessage.createdAt }
      },
      select: { id: true }
    })

    const messageIds = messagesToMark.map((m: any) => m.id)

    if (messageIds.length === 0) {
      return { markedCount: 0 }
    }

    // Create MessageRead entries for messages that aren't already read
    const existingReads = await this.prisma.messageRead.findMany({
      where: {
        messageId: { in: messageIds },
        userId
      },
      select: { messageId: true }
    })

    const alreadyReadMessageIds = new Set(existingReads.map((r: any) => r.messageId))
    const messagesToCreateRead = messageIds.filter((id: any) => !alreadyReadMessageIds.has(id))

    if (messagesToCreateRead.length === 0) {
      return { markedCount: 0 }
    }

    await this.prisma.messageRead.createMany({
      data: messagesToCreateRead.map((messageId: any) => ({
        messageId,
        userId
      })),
      skipDuplicates: true
    })

    return { markedCount: messagesToCreateRead.length }
  }

  /**
   * Get unread message count for a user per room
   */
  async getUnreadCounts(userId: string) {
    // Get all rooms user is a member of
    const memberships = await this.prisma.roomMember.findMany({
      where: { userId },
      select: { roomId: true }
    })

    const roomIds = memberships.map((m) => m.roomId)

    if (roomIds.length === 0) {
      return []
    }

    // For each room, count messages where user has no MessageRead entry
    const unreadSummary = await Promise.all(
      roomIds.map(async (roomId) => {
        // Count all messages in room
        const totalMessages = await this.prisma.message.count({
          where: { roomId }
        })

        // Count messages user has read
        const readMessages = await this.prisma.messageRead.findMany({
          where: { userId },
          select: { messageId: true }
        })

        const readMessageIds = new Set(readMessages.map((r) => r.messageId))

        // Get all message IDs in this room
        const roomMessages = await this.prisma.message.findMany({
          where: { roomId },
          select: { id: true }
        })

        const unreadCount = roomMessages.filter((m) => !readMessageIds.has(m.id)).length

        return {
          roomId,
          unreadCount,
          totalMessages
        }
      })
    )

    return unreadSummary.filter((s: any) => s.unreadCount > 0)
  }

  /**
   * Get read count for a specific message
   * Returns: { messageId, readCount, totalMembers }
   */
  async getMessageReadCount(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw new NotFoundException('Message not found')
    }

    // Get read count
    const readCount = await this.prisma.messageRead.count({
      where: { messageId }
    })

    // Get total members in room
    const totalMembers = await this.prisma.roomMember.count({
      where: { roomId: message.roomId }
    })

    return {
      messageId,
      readCount,
      totalMembers,
      percentage: totalMembers > 0 ? Math.round((readCount / totalMembers) * 100) : 0
    }
  }

  /**
   * Get read receipts for all messages in a room
   * Used when fetching message list
   */
  async getMessageReadCounts(roomId: string, messageIds: string[]) {
    if (messageIds.length === 0) {
      return []
    }

    const readCounts = await this.prisma.messageRead.groupBy({
      by: ['messageId'],
      where: {
        messageId: { in: messageIds }
      },
      _count: { userId: true }
    })

    // Get total members in room
    const totalMembers = await this.prisma.roomMember.count({
      where: { roomId }
    })

    return readCounts.map((rc: any) => ({
      messageId: rc.messageId,
      readCount: rc._count.userId,
      totalMembers
    }))
  }

  /**
   * Get users who have read a specific message
   */
  async getMessageReaders(messageId: string) {
    const readers = await this.prisma.messageRead.findMany({
      where: { messageId },
      include: {
        user: {
          select: { id: true, username: true }
        }
      },
      orderBy: { readAt: 'asc' }
    })

    return readers.map((r: any) => ({
      userId: r.user.id,
      username: r.user.username,
      readAt: r.readAt
    }))
  }
}
