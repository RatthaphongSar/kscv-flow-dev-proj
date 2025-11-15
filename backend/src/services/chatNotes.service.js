// backend/src/services/chatNotes.service.js
import { prisma } from '../db.js'

export class ChatNotesService {
  async getNotesByRoom(roomId) {
    return prisma.chatNote.findMany({
      where: { roomId },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getNoteById(noteId, roomId) {
    return prisma.chatNote.findFirst({
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

    return prisma.chatNote.create({
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

    const note = await prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.authorId !== authorId) {
      throw new Error('Can only update your own notes')
    }

    return prisma.chatNote.update({
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

    const note = await prisma.chatNote.findFirst({
      where: { id: noteId, roomId },
    })

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.authorId !== authorId) {
      throw new Error('Can only delete your own notes')
    }

    await prisma.chatNote.delete({ where: { id: noteId } })
    return { success: true }
  }
}

export const chatNotesService = new ChatNotesService()
