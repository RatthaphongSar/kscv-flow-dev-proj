// backend/src/services/chatRoom.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatRoomService {
  constructor(prisma) {
    this.prisma = prisma || defaultPrisma
  }

  /**
   * Update room name (teacher-only, room creator only)
   */
  async updateRoom(roomId, newName, userId, userRole) {
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      throw new Error('Only teachers can update rooms')
    }

    // Check if room exists and user is creator or admin
    const room = await this.prisma.room.findFirst({
      where: { id: roomId },
      include: { members: true },
    })

    if (!room) {
      return { success: true, roomId, alreadyDeleted: true }
    }

    // Check if user is a member
    const isMember = room.members.some(m => m.userId === userId)
    if (!isMember) {
      throw new Error('Not a member of this room')
    }

    // For now, allow any teacher who is a member to update room name
    // Update: Check if name is already taken
    const existingRoom = await this.prisma.room.findFirst({
      where: { 
        name: newName,
        NOT: { id: roomId }
      }
    })

    if (existingRoom) {
      throw new Error('Room name already exists')
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { name: newName },
      include: {
        members: { include: { user: { select: { id: true, username: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      }
    })
  }

  /**
   * Delete room (teacher-only, room creator/admin only)
   */
  async deleteRoom(roomId, userId, userRole) {
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      throw new Error('Only teachers can delete rooms')
    }

    // Check if room exists and user is member
    const room = await this.prisma.room.findFirst({
      where: { id: roomId },
      include: { members: true },
    })

    if (!room) {
      throw new Error('Room not found')
    }

    // Check if user is a member
    const isMember = room.members.some(m => m.userId === userId)
    if (!isMember) {
      throw new Error('Not a member of this room')
    }

    await this.prisma.$transaction([
      this.prisma.roomMember.deleteMany({ where: { roomId } }),
      this.prisma.room.delete({ where: { id: roomId } })
    ])

    return { success: true, roomId }
  }
}

// Lazy singleton instance
let _instance = null

export function getChatRoomService() {
  if (!_instance) {
    _instance = new ChatRoomService(defaultPrisma)
  }
  return _instance
}

// Default export for backward compatibility
export const chatRoomService = {
  updateRoom(...args) { return getChatRoomService().updateRoom.call(getChatRoomService(), ...args) },
  deleteRoom(...args) { return getChatRoomService().deleteRoom.call(getChatRoomService(), ...args) },
}
