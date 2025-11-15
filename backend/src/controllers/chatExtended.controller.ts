import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common'
import { ChatNotesService } from '../services/chatNotes.service'
import { ChatFilesService } from '../services/chatFiles.service'
import { ChatReadReceiptsService } from '../services/chatReadReceipts.service'
import { ChatMembersService } from '../services/chatMembers.service'

interface AuthRequest extends Request {
  user?: { id: string; username: string; role: string }
}

/**
 * Chat Notes Controller
 * Endpoints: GET, POST, PUT, DELETE notes per room
 */
@Controller('rooms/:roomId/notes')
export class ChatNotesController {
  constructor(private notesService: ChatNotesService) {}

  @Get()
  async getNotes(@Param('roomId') roomId: string) {
    return this.notesService.getNotesByRoom(roomId)
  }

  @Post()
  async createNote(
    @Param('roomId') roomId: string,
    @Body() body: { title: string; content: string },
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.notesService.createNote(
      roomId,
      req.user.id,
      req.user.role,
      { title: body.title, content: body.content }
    )
  }

  @Put(':noteId')
  async updateNote(
    @Param('roomId') roomId: string,
    @Param('noteId') noteId: string,
    @Body() body: { title?: string; content?: string },
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.notesService.updateNote(noteId, req.user.id, req.user.role, body)
  }

  @Delete(':noteId')
  async deleteNote(
    @Param('roomId') roomId: string,
    @Param('noteId') noteId: string,
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.notesService.deleteNote(noteId, req.user.id, req.user.role)
  }
}

/**
 * Chat Files Controller
 * Endpoints: GET files, POST upload, DELETE file
 */
@Controller('rooms/:roomId/files')
export class ChatFilesController {
  constructor(private filesService: ChatFilesService) {}

  @Get()
  async getFiles(@Param('roomId') roomId: string) {
    return this.filesService.getFilesByRoom(roomId)
  }

  @Post()
  async uploadFile(
    @Param('roomId') roomId: string,
    @Body()
    body: {
      fileName: string
      mimeType: string
      sizeBytes: number
      url: string
      width?: number
      height?: number
    },
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.filesService.saveFileMetadata(roomId, req.user.id, {
      fileName: body.fileName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      url: body.url,
      width: body.width,
      height: body.height
    })
  }

  @Delete(':fileId')
  async deleteFile(
    @Param('roomId') roomId: string,
    @Param('fileId') fileId: string,
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.filesService.deleteFile(fileId, req.user.id, req.user.role)
  }
}

/**
 * Chat Read Receipts Controller
 */
@Controller('rooms/:roomId/messages')
export class ChatReadReceiptsController {
  constructor(private readService: ChatReadReceiptsService) {}

  @Post('mark-read')
  async markAsRead(
    @Param('roomId') roomId: string,
    @Body() body: { lastMessageId: string },
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.readService.markRoomAsRead(roomId, req.user.id, body.lastMessageId)
  }

  @Get('read-receipts/:messageId')
  async getMessageReadReceipt(@Param('messageId') messageId: string) {
    return this.readService.getMessageReadCount(messageId)
  }

  @Get('read-receipts')
  async getMessageReadReceipts(
    @Param('roomId') roomId: string,
    @Query('messageId') messageIds: string | string[]
  ) {
    // Handle both single and multiple messageIds
    const ids = Array.isArray(messageIds) ? messageIds : [messageIds].filter(Boolean)
    if (!ids.length) throw new BadRequestException('No message IDs provided')

    return this.readService.getMessageReadCounts(roomId, ids)
  }

  @Get('message-readers/:messageId')
  async getMessageReaders(@Param('messageId') messageId: string) {
    return this.readService.getMessageReaders(messageId)
  }
}

/**
 * Chat Members Controller
 */
@Controller('rooms/:roomId/members')
export class ChatMembersController {
  constructor(private membersService: ChatMembersService) {}

  @Get()
  async getMembers(@Param('roomId') roomId: string) {
    return this.membersService.getRoomMembers(roomId)
  }

  @Get('available')
  async getAvailableMembers(@Param('roomId') roomId: string) {
    return this.membersService.getAvailableMembers(roomId)
  }

  @Post()
  async addMember(
    @Param('roomId') roomId: string,
    @Body() body: { userId: string },
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.membersService.addMember(roomId, body.userId, req.user.role)
  }

  @Delete(':userId')
  async removeMember(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
    @Request() req: AuthRequest
  ) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.membersService.removeMember(roomId, userId, req.user.role)
  }
}

/**
 * Unread Summary Controller
 */
@Controller('rooms/unread-summary')
export class UnreadSummaryController {
  constructor(private readService: ChatReadReceiptsService) {}

  @Get()
  async getUnreadSummary(@Request() req: AuthRequest) {
    if (!req.user) throw new BadRequestException('Not authenticated')

    return this.readService.getUnreadCounts(req.user.id)
  }
}
