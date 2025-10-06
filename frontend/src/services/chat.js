// src/services/chat.js
import { api } from '../utils/api'

export const ChatAPI = {
  // ห้องที่ user สังกัด + last message
  listRooms: (userId) =>
    api(`/chat/rooms?userId=${encodeURIComponent(userId)}`, { method: 'GET' }),

  // สร้างห้องแบบ manual
  createRoom: (name, memberIds = []) =>
    api('/chat/rooms', { method: 'POST', body: { name, memberIds } }),

  // ประวัติข้อความ (ต้องมี backend route GET /rooms/:roomId/messages?limit=50)
  listMessages: (roomId, limit = 50) =>
    api(`/chat/rooms/${roomId}/messages?limit=${limit}`, { method: 'GET' }),

  // ส่งข้อความ
  sendMessage: (roomId, userId, content) =>
    api(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: { userId, content }
    }),
}
