// backend/src/services/chatMembers.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatMembersService {
  constructor(prisma) {
    this.prisma = prisma || defaultPrisma
  }

  async getRoomMembers(roomId) {
    const members = await this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, username: true, role: true, email: true } },
      },
      orderBy: { user: { role: 'asc' } },
    })

    return members.map((m) => m.user)
  }

  async getAvailableMembers(roomId) {
    const existingMembers = await this.prisma.roomMember.findMany({
      where: { roomId },
      select: { userId: true },
    })

    const existingIds = existingMembers.map((m) => m.userId)

    return this.prisma.user.findMany({
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

    const existing = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (existing) {
      throw new Error('User is already a member')
    }

    const member = await this.prisma.roomMember.create({
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

    const existing = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    if (!existing) {
      throw new Error('Member not found in this room')
    }

    await this.prisma.roomMember.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    })

    return { success: true }
  }
}

// Lazy singleton instance
let _instance = null

export function getChatMembersService() {
  if (!_instance) {
    _instance = new ChatMembersService(defaultPrisma)
  }
  return _instance
}

// Default export for backward compatibility
export const chatMembersService = {
  getRoomMembers(...args) { return getChatMembersService().getRoomMembers.call(getChatMembersService(), ...args) },
  getAvailableMembers(...args) { return getChatMembersService().getAvailableMembers.call(getChatMembersService(), ...args) },
  addMember(...args) { return getChatMembersService().addMember.call(getChatMembersService(), ...args) },
  removeMember(...args) { return getChatMembersService().removeMember.call(getChatMembersService(), ...args) },
}
