import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface CreateNoteDto {
  title: string
  content: string
}

interface UpdateNoteDto {
  title?: string
  content?: string
}

@Injectable()
export class ChatNotesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all notes for a room
   */
  async getNotesByRoom(roomId: string) {
    const notes = await this.prisma.chatNote.findMany({
      where: { roomId },
      include: {
        author: {
          select: { id: true, username: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return notes
  }

  /**
   * Get a single note
   */
  async getNoteById(noteId: string) {
    const note = await this.prisma.chatNote.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: { id: true, username: true }
        },
        room: {
          select: { id: true, name: true }
        }
      }
    })

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    return note
  }

  /**
   * Create a note (teacher only)
   */
  async createNote(
    roomId: string,
    authorId: string,
    authorRole: string,
    dto: CreateNoteDto
  ) {
    // Only teachers can create notes
    if (authorRole !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can create notes')
    }

    // Verify user is member of room
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId, userId: authorId }
    })

    if (!membership) {
      throw new ForbiddenException('You are not a member of this room')
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new NotFoundException('Room not found')
    }

    const note = await this.prisma.chatNote.create({
      data: {
        title: dto.title,
        content: dto.content,
        roomId,
        authorId
      },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    })

    return note
  }

  /**
   * Update a note (teacher only, must be author or any teacher in room)
   */
  async updateNote(
    noteId: string,
    userId: string,
    userRole: string,
    dto: UpdateNoteDto
  ) {
    // Only teachers can edit notes
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can edit notes')
    }

    const note = await this.prisma.chatNote.findUnique({
      where: { id: noteId },
      include: { room: true }
    })

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    // Verify user is in the room
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId: note.roomId, userId }
    })

    if (!membership) {
      throw new ForbiddenException('You are not a member of this room')
    }

    const updated = await this.prisma.chatNote.update({
      where: { id: noteId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content })
      },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    })

    return updated
  }

  /**
   * Delete a note (teacher only)
   */
  async deleteNote(noteId: string, userId: string, userRole: string) {
    // Only teachers can delete notes
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can delete notes')
    }

    const note = await this.prisma.chatNote.findUnique({
      where: { id: noteId }
    })

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    // Verify user is in the room
    const membership = await this.prisma.roomMember.findFirst({
      where: { roomId: note.roomId, userId }
    })

    if (!membership) {
      throw new ForbiddenException('You are not a member of this room')
    }

    await this.prisma.chatNote.delete({
      where: { id: noteId }
    })

    return { success: true }
  }
}
