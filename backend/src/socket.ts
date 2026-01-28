import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { ChatEvent, ChatEventMap } from './types/chat';

const prisma = new PrismaClient();

export function initializeSocketIO(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Store online users
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', async (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // Store user connection
    onlineUsers.set(userId, socket.id);

    // Update user online status
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    });

    // Join user's rooms
    const userRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
    });
    userRooms.forEach((room) => {
      socket.join(room.id);
    });

    // Handle message sending
    socket.on('message:send', async (message: ChatEventMap['message:send']) => {
      try {
        // Save message to database
        const savedMessage = await prisma.message.create({
          data: {
            id: message.id,
            text: message.text,
            senderId: userId,
            roomId: message.roomId,
            status: 'sent',
            ...(message.file && {
              files: {
                create: {
                  fileName: message.file.name,
                  url: message.file.url,
                  mimeType: message.file.type,
                  sizeBytes: message.file.size,
                  room: { connect: { id: message.roomId } },
                  uploader: { connect: { id: userId } },
                },
              }
            }),
          },
          include: {
            files: true,
          },
        });

        // Broadcast message to room
        socket.to(message.roomId).emit('message:received', {
          ...savedMessage,
          senderId: userId,
        });

        // Send acknowledgment to sender
        socket.emit('message:status', message.id, 'sent');
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('message:status', message.id, 'error');
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (roomId: string) => {
      socket.to(roomId).emit('typing:start', roomId, userId);
    });

    socket.on('typing:stop', (roomId: string) => {
      socket.to(roomId).emit('typing:stop', roomId, userId);
    });

    // Handle message status updates
    socket.on('message:status', async (messageId: string, status: string) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: { status },
        });
        socket.to(socket.rooms).emit('message:status', messageId, status);
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      });
    });
  });

  return io;
}
