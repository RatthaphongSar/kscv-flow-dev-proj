// backend/src/services/chatRoomPin.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatRoomPinService {
  constructor(prisma) {
    this.prisma = prisma || defaultPrisma
  }

  /**
   * Pin a room for a user
   */
  async pinRoom(roomId, userId) {
    if (!roomId || !userId) throw new Error('roomId and userId are required')

    return await this.prisma.roomPin.upsert({
      where: { roomId_userId: { roomId, userId } },
      update: { pinnedAt: new Date() },
      create: { roomId, userId, pinnedAt: new Date() },
      include: {
        room: { select: { id: true, name: true } },
        user: { select: { id: true, username: true } }
      }
    })
  }

  /**
   * Unpin a room for a user
   */
  async unpinRoom(roomId, userId) {
    if (!roomId || !userId) throw new Error('roomId and userId are required')

    return await this.prisma.roomPin.delete({
      where: { roomId_userId: { roomId, userId } },
      include: {
        room: { select: { id: true, name: true } }
      }
    })
  }

  /**
   * Get all pinned rooms for a user (sorted by most recent pin)
   */
  async getPinnedRooms(userId) {
    if (!userId) throw new Error('userId is required')

    return await this.prisma.roomPin.findMany({
      where: { userId },
      orderBy: { pinnedAt: 'desc' },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            _count: { select: { messages: true, members: true } }
          }
        }
      }
    })
  }

  /**
   * Check if a room is pinned by a user
   */
  async isRoomPinned(roomId, userId) {
    if (!roomId || !userId) throw new Error('roomId and userId are required')

    const pin = await this.prisma.roomPin.findUnique({
      where: { roomId_userId: { roomId, userId } }
    })
    return !!pin
  }

  /**
   * Get pin count for a room
   */
  async getRoomPinCount(roomId) {
    if (!roomId) throw new Error('roomId is required')

    return await this.prisma.roomPin.count({
      where: { roomId }
    })
  }

  /**
   * Get users who pinned a room
   */
  async getRoomPinners(roomId) {
    if (!roomId) throw new Error('roomId is required')

    return await this.prisma.roomPin.findMany({
      where: { roomId },
      orderBy: { pinnedAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, role: true } }
      }
    })
  }
}

// Lazy initialization
let _instance = null

function getInstance() {
  if (!_instance) {
    _instance = new ChatRoomPinService(prisma)
  }
  return _instance
}

// Export service wrapper functions with proper 'this' binding
export const chatRoomPinService = {
  pinRoom(...args) {
    return getInstance().pinRoom.call(getInstance(), ...args)
  },
  unpinRoom(...args) {
    return getInstance().unpinRoom.call(getInstance(), ...args)
  },
  getPinnedRooms(...args) {
    return getInstance().getPinnedRooms.call(getInstance(), ...args)
  },
  isRoomPinned(...args) {
    return getInstance().isRoomPinned.call(getInstance(), ...args)
  },
  getRoomPinCount(...args) {
    return getInstance().getRoomPinCount.call(getInstance(), ...args)
  },
  getRoomPinners(...args) {
    return getInstance().getRoomPinners.call(getInstance(), ...args)
  }
}
