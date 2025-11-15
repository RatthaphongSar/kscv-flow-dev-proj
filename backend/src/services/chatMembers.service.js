// backend/src/services/chatMembers.service.js
import { prisma } from '../db.js'

export class ChatMembersService {
  async getRoomMembers(roomId) {
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, username: true, role: true, email: true } },
      },
      orderBy: { user: { role: 'asc' } },
    })

    return members.map((m) => m.user)
  }

  async getAvailableMembers(roomId) {
    const existingMembers = await prisma.roomMember.findMany({
      where: { roomId },
      select: { userId: true },
    })

    const existingIds = existingMembers.map((m) => m.userId)

    return prisma.user.findMany({
      where: {
        id: { notIn: existingIds },
      },
      select: { id: true, username: true, role: true, email: true },
      orderBy: { role: 'asc' },
    })
  }

  async addMember(roomId, userId, requesterRole) {
    if (requesterRole !== 'TEACHER') {
      throw new Error('Only teachers can add members')
    }

    const existing = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (existing) {
      throw new Error('User is already a member')
    }

    const member = await prisma.roomMember.create({
      data: { roomId, userId },
      include: {
        user: { select: { id: true, username: true, role: true, email: true } },
      },
    })

    return member.user
  }

  async removeMember(roomId, userId, requesterRole, requesterId) {
    if (requesterRole !== 'TEACHER') {
      throw new Error('Only teachers can remove members')
    }

    if (userId === requesterId) {
      throw new Error('Cannot remove yourself')
    }

    const existing = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (!existing) {
      throw new Error('Member not found in this room')
    }

    await prisma.roomMember.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    return { success: true }
  }
}

export const chatMembersService = new ChatMembersService()
