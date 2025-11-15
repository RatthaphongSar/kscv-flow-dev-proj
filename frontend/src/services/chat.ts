// frontend/src/services/chat.ts

import { io, Socket } from 'socket.io-client'
import { Message } from '../stores/chat'

/**
 * Event map สำหรับ type safety เวลา on/emit
 * (ตอนนี้ยังไม่ได้ enforce ผ่าน generics ของ Socket
 *  แต่เก็บไว้เป็น reference ว่า server ควรยิง event อะไรบ้าง)
 * 
 * @internal Reference for future socket.io type-safe event handling
 */
export interface ChatEvents {
  'message:send': (message: Message) => void
  'message:received': (message: Message) => void
  'typing:start': (roomId: string, userId: string) => void
  'typing:stop': (roomId: string, userId: string) => void
  'message:status': (messageId: string, status: Message['status']) => void
}

/**
 * URL ของ Chat Server:
 * - ถ้ามี VITE_BACKEND_URL ให้ใช้เป็น base
 * - ถ้าไม่มีก็ fallback เป็น http://localhost:4001
 */
const CHAT_SERVER_URL =
  (import.meta as any)?.env?.VITE_BACKEND_URL?.replace(/\/$/, '') ||
  'http://localhost:4001'

class ChatService {
  private socket: Socket | null = null
  private userId: string | null = null

  /**
   * เชื่อมต่อ Socket.IO
   * - ถ้าเชื่อมต่อแล้ว จะไม่ connect ซ้ำ
   * - auth จะส่ง userId ไปให้ server เผื่อใช้ map connection ↔ user
   */
  connect(userId: string) {
    // ถ้ามี socket และยัง connect อยู่แล้ว ไม่ต้องทำอะไร
    if (this.socket?.connected) return

    this.userId = userId

    // ถ้ามี socket ตัวเดิมแต่ disconnect ไปแล้ว → เคลียร์ก่อน
    if (this.socket && !this.socket.connected) {
      this.socket.disconnect()
      this.socket = null
    }

    this.socket = io(CHAT_SERVER_URL, {
      auth: { userId },
      transports: ['websocket'],
      withCredentials: true, // เผื่อใช้ cookie/JWT ร่วมกับ backend
    })

    this.setupEventListeners()
  }

  /**
   * ตัดการเชื่อมต่อ socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.userId = null
  }

  /**
   * ตั้ง event listener พื้นฐาน (connect / disconnect / error)
   */
  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('[ChatService] Connected to chat server:', CHAT_SERVER_URL)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[ChatService] Disconnected from chat server:', reason)
    })

    this.socket.on('error', (error) => {
      console.error('[ChatService] Socket error:', error)
    })
  }

  /**
   * ส่งข้อความ (ให้ caller จัด structure ของ Message เอง)
   * server ฝั่งนั้นควร listen ที่ 'message:send'
   */
  sendMessage(message: Message) {
    if (!this.socket) {
      console.warn('[ChatService] sendMessage called but socket not connected')
      return
    }
    this.socket.emit('message:send', message)
  }

  /**
   * subscribe event เมื่อมี message ใหม่เข้ามา
   */
  onMessageReceived(callback: (message: Message) => void) {
    if (!this.socket) {
      console.warn('[ChatService] onMessageReceived called but socket not connected')
    }

    this.socket?.on('message:received', callback)

    // คืน function สำหรับ unsubscribe
    return () => {
      this.socket?.off('message:received', callback)
    }
  }

  /**
   * แจ้ง server ว่า user เริ่มพิมพ์ในห้องไหน
   */
  startTyping(roomId: string) {
    if (!this.userId || !this.socket) return
    this.socket.emit('typing:start', roomId, this.userId)
  }

  /**
   * แจ้ง server ว่า user หยุดพิมพ์แล้ว
   */
  stopTyping(roomId: string) {
    if (!this.userId || !this.socket) return
    this.socket.emit('typing:stop', roomId, this.userId)
  }

  /**
   * subscribe เวลา server แจ้งว่าใครเริ่มพิมพ์
   */
  onTypingStart(callback: (roomId: string, userId: string) => void) {
    if (!this.socket) {
      console.warn('[ChatService] onTypingStart called but socket not connected')
    }

    this.socket?.on('typing:start', callback)

    return () => {
      this.socket?.off('typing:start', callback)
    }
  }

  /**
   * subscribe เวลา server แจ้งว่าใครหยุดพิมพ์
   */
  onTypingStop(callback: (roomId: string, userId: string) => void) {
    if (!this.socket) {
      console.warn('[ChatService] onTypingStop called but socket not connected')
    }

    this.socket?.on('typing:stop', callback)

    return () => {
      this.socket?.off('typing:stop', callback)
    }
  }

  /**
   * แจ้งสถานะของ message เช่น 'sent' | 'delivered' | 'read'
   */
  updateMessageStatus(messageId: string, status: Message['status']) {
    if (!this.socket) {
      console.warn('[ChatService] updateMessageStatus called but socket not connected')
      return
    }
    this.socket.emit('message:status', messageId, status)
  }

  /**
   * subscribe เวลา status ของ message เปลี่ยน
   */
  onMessageStatusUpdate(
    callback: (messageId: string, status: Message['status']) => void
  ) {
    if (!this.socket) {
      console.warn(
        '[ChatService] onMessageStatusUpdate called but socket not connected'
      )
    }

    this.socket?.on('message:status', callback)

    return () => {
      this.socket?.off('message:status', callback)
    }
  }
}

export const chatService = new ChatService()
