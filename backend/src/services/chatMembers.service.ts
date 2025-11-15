import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatMembersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all members of a room with their info
   */
  async getRoomMembers(roomId: string) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    const members = await this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, username: true, role: true, email: true }
        }
      },
      orderBy: {
        user: { username: 'asc' }
      }
    })

    return members.map((m) => ({
      id: m.user.id,
      username: m.user.username,
      role: m.user.role,
      email: m.user.email,
      memberId: m.id
    }))
  }

  /**
   * Add a member to a room (teacher only)
   */
  async addMember(roomId: string, userId: string, requesterRole: string) {
    // Only teachers can add members
    if (requesterRole !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can add members')
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check if already a member
    const existing = await this.prisma.roomMember.findFirst({
      where: { roomId, userId }
    })

    if (existing) {
      throw new BadRequestException('User is already a member of this room')
    }

    // Add member
    const member = await this.prisma.roomMember.create({
      data: {
        roomId,
        userId
      },
      include: {
        user: {
          select: { id: true, username: true, role: true }
        }
      }
    })

    return {
      id: member.user.id,
      username: member.user.username,
      role: member.user.role
    }
  }

  /**
   * Remove a member from a room (teacher only)
   */
  async removeMember(roomId: string, memberUserId: string, requesterRole: string) {
    // Only teachers can remove members
    if (requesterRole !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can remove members')
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    // Verify member exists and is in this room
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId: memberUserId }
    })

    if (!membership) {
      throw new NotFoundException('User is not a member of this room')
    }

    await this.prisma.roomMember.delete({
      where: { id: membership.id }
    })

    return { success: true }
  }

  /**
   * Check if user is a teacher in a room
   */
  async isTeacherInRoom(roomId: string, userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.role !== 'TEACHER') {
      return false
    }

    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId }
    })

    return !!membership
  }

  /**
   * Get member count for a room
   */
  async getRoomMemberCount(roomId: string): Promise<number> {
    return this.prisma.roomMember.count({
      where: { roomId }
    })
  }

  /**
   * Check if user is a member of a room
   */
  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId }
    })

    return !!membership
  }

  /**
   * Get all users not yet in the room (available to add)
   */
  async getAvailableMembers(roomId: string) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    // Get current members
    const currentMembers = await this.prisma.roomMember.findMany({
      where: { roomId },
      select: { userId: true }
    })

    const currentMemberIds = currentMembers.map((m) => m.userId)

    // Get all users not in this room
    const availableUsers = await this.prisma.user.findMany({
      where: {
        id: { notIn: currentMemberIds }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      },
      orderBy: { username: 'asc' }
    })

    return availableUsers
  }
}
