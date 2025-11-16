// backend/src/services/chatNotes.service.js
import { prisma as defaultPrisma } from '../db.js'

export class ChatNotesService {
  constructor(prisma) {
    // Always use the provided prisma or import fresh
    this.prisma = prisma || defaultPrisma
  }

  async getNotesByRoom(roomId) {
    return this.prisma.chatNote.findMany({
      where: { roomId },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getNoteById(noteId, roomId) {
    return this.prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })
  }

  async createNote(roomId, authorId, authorRole, data) {
    if (authorRole !== 'TEACHER') {
      throw new Error('Only teachers can create notes')
    }

    return this.prisma.chatNote.create({
      data: {
        roomId,
        authorId,
        title: data.title,
        content: data.content,
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })
  }

  async updateNote(noteId, roomId, authorId, authorRole, data) {
    if (authorRole !== 'TEACHER') {
      throw new Error('Only teachers can update notes')
    }

    const note = await this.prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.authorId !== authorId) {
      throw new Error('Can only update your own notes')
    }

    return this.prisma.chatNote.update({
      where: { id: noteId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    })
  }

  async deleteNote(noteId, roomId, authorId, authorRole) {
    if (authorRole !== 'TEACHER') {
      throw new Error('Only teachers can delete notes')
    }

    const note = await this.prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.authorId !== authorId) {
      throw new Error('Can only delete your own notes')
    }

    await this.prisma.chatNote.delete({ where: { id: noteId } })
    return { success: true }
  }
}

// Lazy singleton instance
let _instance = null

export function getChatNotesService() {
  if (!_instance) {
    _instance = new ChatNotesService(defaultPrisma)
  }
  return _instance
}

// Default export for backward compatibility
export const chatNotesService = {
  getNotesByRoom(...args) { return getChatNotesService().getNotesByRoom.call(getChatNotesService(), ...args) },
  getNoteById(...args) { return getChatNotesService().getNoteById.call(getChatNotesService(), ...args) },
  createNote(...args) { return getChatNotesService().createNote.call(getChatNotesService(), ...args) },
  updateNote(...args) { return getChatNotesService().updateNote.call(getChatNotesService(), ...args) },
  deleteNote(...args) { return getChatNotesService().deleteNote.call(getChatNotesService(), ...args) },
}
