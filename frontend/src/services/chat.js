// frontend/src/services/chat.js
import { api } from '../utils/api'

export const ChatAPI = {
  // ห้องที่ user สังกัด + last message
  // ไม่จำเป็นต้องส่ง userId แล้ว แต่ยังรับ argument ไว้เพื่อไม่ให้โค้ดเดิมพัง
  listRooms: (_userId) =>
    api('/chat/rooms', { method: 'GET' }),

  // สร้างห้องแบบ manual (ครูเท่านั้น)
  // ถ้าส่ง memberIds ว่าง → backend จะดึงนักเรียนทุกคนให้เอง
  createRoom: (name, memberIds = []) =>
    api('/chat/rooms', { method: 'POST', body: { name, memberIds } }),

  // ประวัติข้อความ - โหลด latest messages
  listMessages: (roomId, limit = 50) =>
    api(`/chat/rooms/${roomId}/messages?limit=${limit}`, { method: 'GET' }),

  // โหลด older messages ก่อนข้อความ beforeMessageId (สำหรับ infinite scroll)
  // Backend ควรรับ beforeMessageId และ limit, return array of messages ที่เก่ากว่า
  listMessagesBefore: (roomId, beforeMessageId, limit = 30) =>
    api(`/chat/rooms/${roomId}/messages?before=${beforeMessageId}&limit=${limit}`, { 
      method: 'GET' 
    }),

  // ส่งข้อความ — ตอนนี้ backend จะใช้ user จาก JWT เป็นหลัก
  // รองรับ FormData ที่มี files (multipart/form-data)
  sendMessage: (roomId, _userId, content, replyToId = null, files = null) => {
    if (files && files instanceof FormData) {
      return api(`/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        body: files,
        headers: {}, // ให้ browser ตั้ง Content-Type: multipart/form-data เอง
      })
    }
    return api(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: { content, replyToId },
    })
  },

  // แก้ไขข้อความ
  editMessage: (roomId, messageId, content) =>
    api(`/chat/rooms/${roomId}/messages/${messageId}`, {
      method: 'PATCH',
      body: { content },
    }),

  // ลบข้อความ
  deleteMessage: (roomId, messageId) =>
    api(`/chat/rooms/${roomId}/messages/${messageId}`, {
      method: 'DELETE',
    }),

  // ดึงรายชื่อนักเรียนทั้งหมด (สำหรับครูที่จะเพิ่มเข้าห้อง)
  getStudents: () =>
    api('/chat/students', { method: 'GET' }),

  // เพิ่มนักเรียนเข้าห้องแชท
  addMembersToRoom: (roomId, memberIds = []) =>
    api(`/chat/rooms/${roomId}/add-members`, { 
      method: 'POST', 
      body: { memberIds } 
    }),

  // ========== NOTES ==========
  // ดึงโน้ตทั้งหมดของห้อง
  getNotes: (roomId) =>
    api(`/chat/rooms/${roomId}/notes`, { method: 'GET' }),

  // สร้างโน้ต
  createNote: (roomId, title, content) =>
    api(`/chat/rooms/${roomId}/notes`, {
      method: 'POST',
      body: { title, content },
    }),

  // แก้ไขโน้ต
  updateNote: (roomId, noteId, title, content) =>
    api(`/chat/rooms/${roomId}/notes/${noteId}`, {
      method: 'PUT',
      body: { title, content },
    }),

  // ลบโน้ต
  deleteNote: (roomId, noteId) =>
    api(`/chat/rooms/${roomId}/notes/${noteId}`, {
      method: 'DELETE',
    }),

  // ========== ROOM MANAGEMENT ==========
  // แก้ไขชื่อห้อง
  updateRoom: (roomId, name) =>
    api(`/chat/rooms/${roomId}`, {
      method: 'PUT',
      body: { name },
    }),

  // ลบห้อง
  deleteRoom: (roomId) =>
    api(`/chat/rooms/${roomId}`, {
      method: 'DELETE',
    }),

  // ========== MESSAGE MANAGEMENT ==========
  // ลบข้อความสำหรับตัวเอง หรือลบสำหรับทุกคน
  deleteMessageEnhanced: (roomId, messageId, mode = 'me') =>
    api(`/chat/rooms/${roomId}/messages/${messageId}?mode=${mode}`, {
      method: 'DELETE',
    }),

  // แก้ไขข้อความ (เพิ่มเติมด้วยการติดตาม editedAt)
  editMessageEnhanced: (roomId, messageId, content) =>
    api(`/chat/rooms/${roomId}/messages/${messageId}`, {
      method: 'PATCH',
      body: { content },
    }),

  // ตอบกลับข้อความ (reply)
  replyToMessage: (roomId, messageId, content, files = null) => {
    if (files && files instanceof FormData) {
      return api(`/chat/rooms/${roomId}/messages/${messageId}/reply`, {
        method: 'POST',
        body: files,
        headers: {}, // ให้ browser ตั้ง Content-Type
      })
    }
    return api(`/chat/rooms/${roomId}/messages/${messageId}/reply`, {
      method: 'POST',
      body: { content },
    })
  },

  // ปักหมุด (pin) ข้อความ
  pinMessage: (roomId, messageId) =>
    api(`/chat/rooms/${roomId}/messages/${messageId}/pin`, {
      method: 'POST',
    }),

  // ถอนปักหมุด (unpin) ข้อความ
  unpinMessage: (roomId, messageId) =>
    api(`/chat/rooms/${roomId}/messages/${messageId}/pin`, {
      method: 'DELETE',
    }),

  // ดึงข้อความที่ปักหมุดทั้งหมดในห้อง
  getPinnedMessages: (roomId) =>
    api(`/chat/rooms/${roomId}/pins`, {
      method: 'GET',
    }),
}
