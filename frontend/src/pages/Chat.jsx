// frontend/src/pages/Chat.jsx (ChatPage)
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatSocket } from '../context/ChatSocketContext'
import { ChatAPI } from '../services/chat'
import { useRoomPin } from '../hooks/useRoomPin'
import ChatLayout from '../components/chat/ChatLayout'

export default function ChatPage() {
  const { user } = useAuth()
  const socket = useChatSocket()
  const { pinnedRooms, loadPinnedRooms, togglePin } = useRoomPin()

  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState('')

  const [activeRoom, setActiveRoom] = useState(null)

  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [text, setText] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])

  // typing indicator
  const [typingMap, setTypingMap] = useState({}) // { userId: { username, last } }

  // reply system
  const [replyingTo, setReplyingTo] = useState(null) // { id, username, content }

  const canCreateRoom =
    user?.role === 'teacher' ||
    user?.role === 'TEACHER' ||
    user?.isTeacher === true

  // -------- helper สำหรับถอด listener ให้ปลอดภัย ----------
  const safeOff = (event, handler) => {
    if (!socket) return
    if (typeof socket.off === 'function') {
      socket.off(event, handler)
    } else if (typeof socket.removeListener === 'function') {
      socket.removeListener(event, handler)
    } else if (typeof socket.removeEventListener === 'function') {
      socket.removeEventListener(event, handler)
    }
  }

  // -----------------------------
  // โหลดห้องของ user
  // -----------------------------
  useEffect(() => {
    if (!user) {
      setRooms([])
      setActiveRoom(null)
      return
    }

    setRoomsLoading(true)
    setRoomsError('')

    // backend ใช้ JWT ใน cookie แล้ว ไม่จำเป็นต้องส่ง userId
    ChatAPI.listRooms()
      .then((data) => {
        setRooms(data || [])
        if (!activeRoom && data && data.length > 0) {
          setActiveRoom(data[0])
        }
      })
      .catch((err) => {
        console.error('Error loading rooms:', err)
        setRoomsError('โหลดห้องสนทนาไม่สำเร็จ')
      })
      .finally(() => setRoomsLoading(false))

    // โหลด pinned rooms
    loadPinnedRooms().catch(err => console.error('Error loading pinned rooms:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // -----------------------------
  // ติดตามสถานะ socket connect/disconnect
  // -----------------------------
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false)
      return
    }

    const handleConnect = () => setSocketConnected(true)
    const handleDisconnect = () => setSocketConnected(false)

    if (socket.connected) setSocketConnected(true)

    if (typeof socket.on === 'function') {
      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
    }

    return () => {
      safeOff('connect', handleConnect)
      safeOff('disconnect', handleDisconnect)
    }
  }, [socket])

  // -----------------------------
  // โหลดข้อความเก่าของห้อง + join/leave room
  // -----------------------------
  useEffect(() => {
    if (!socket || !activeRoom) return

    let cancelled = false

    async function loadMessages() {
      setLoadingMessages(true)
      try {
        const oldMessages = await ChatAPI.listMessages(activeRoom.id)
        if (!cancelled) {
          // Backend ส่งเรียง ASC (เก่า → ใหม่) - เก็บไว้ตรงนี้ก่อน
          // ChatConversation จะจัดเรียง ASC เอง ไม่ต้อง reverse ที่นี่
          setMessages(oldMessages || [])
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }
    }

    loadMessages()

    // join room
    socket.emit?.('joinRoom', { roomId: activeRoom.id })

    const handleNewMessage = (msg) => {
      if (msg.roomId && msg.roomId !== activeRoom.id) return
      setMessages((prev) => [...prev, msg])
    }

    const handleTyping = (payload) => {
      if (!activeRoom) return
      if (payload.roomId !== activeRoom.id) return
      if (payload.userId === user?.id) return

      setTypingMap((prev) => ({
        ...prev,
        [payload.userId]: {
          username: payload.username || 'User',
          last: Date.now(),
        },
      }))
    }

    if (typeof socket.on === 'function') {
      socket.on('chatMessage', handleNewMessage)
      socket.on('typing', handleTyping)
    }

    return () => {
      socket.emit?.('leaveRoom', { roomId: activeRoom.id })
      safeOff('chatMessage', handleNewMessage)
      safeOff('typing', handleTyping)
    }
  }, [socket, activeRoom, user])

  // Clear typing ที่หมดเวลา
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingMap((prev) => {
        const now = Date.now()
        const next = {}
        Object.entries(prev).forEach(([uid, info]) => {
          if (now - info.last < 4000) {
            next[uid] = info
          }
        })
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const typingUsers = Object.values(typingMap).map((t) => t.username)

  // ส่งข้อความ
  async function sendMessage(e) {
    if (e?.preventDefault) e.preventDefault()
    
    setSendError('')
    
    const trimmed = text.trim()
    const hasFiles = selectedFiles.length > 0
    
    if (!trimmed && !hasFiles) {
      setSendError('ข้อความว่างเปล่า')
      return
    }
    
    if (!socket) {
      setSendError('ยังไม่เชื่อมต่อ Socket')
      console.warn('Socket not connected')
      return
    }
    
    if (!activeRoom) {
      setSendError('ยังไม่เลือกห้อง')
      return
    }
    
    if (!user) {
      setSendError('ยังไม่เข้าสู่ระบบ')
      return
    }

    setSendLoading(true)
    const replyToId = replyingTo?.id || null

    try {
      console.log('📤 Sending message:', { roomId: activeRoom.id, userId: user.id, content: trimmed, hasFiles, fileCount: selectedFiles.length })
      
      let formData = null
      let newMessage = null

      // ถ้ามีไฟล์ ส่งเป็น multipart/form-data
      if (hasFiles) {
        formData = new FormData()
        if (trimmed) formData.append('content', trimmed)
        if (replyToId) formData.append('replyToId', replyToId)
        selectedFiles.forEach((f, idx) => {
          formData.append('files', f.file)
        })
        newMessage = await ChatAPI.sendMessage(activeRoom.id, user.id, trimmed, replyToId, formData)
      } else {
        // ส่งข้อความธรรมดา (ไม่มีไฟล์)
        newMessage = await ChatAPI.sendMessage(
          activeRoom.id,
          user.id,
          trimmed,
          replyToId,
        )
      }

      console.log('✅ Message sent:', newMessage)

      // Determine message type
      let messageType = 'text'
      if (newMessage.file?.mimeType?.startsWith('image/')) {
        messageType = 'image'
      } else if (newMessage.file) {
        messageType = 'file'
      }

      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          roomId: activeRoom.id,
          userId: user.id,
          user: { username: user.username },
          content: trimmed || '',
          createdAt: new Date().toISOString(),
          replyToId,
          file: newMessage.file || null,
          type: messageType,
        },
      ])

      socket.emit?.('chatMessage', {
        roomId: activeRoom.id,
        userId: user.id,
        text: trimmed || '[File uploaded]',
      })

      setText('')
      setSelectedFiles([])
      setReplyingTo(null)
      setTypingMap((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
    } catch (error) {
      console.error('❌ Error sending message:', error)
      setSendError(error?.message || 'ไม่สามารถส่งข้อความได้')
    } finally {
      setSendLoading(false)
    }
  }

  // --------------------------------------------------
  // พิมพ์ข้อความ + ยิง event typing
  // -----------------------------
  const handleChangeText = useCallback(
    (value) => {
      setText(value)
      if (!socket || !activeRoom || !user) return
      if (!value.trim()) return

      socket.emit?.('typing', {
        roomId: activeRoom.id,
        userId: user.id,
        username: user.username || 'Student',
      })
    },
    [socket, activeRoom, user],
  )

  // -----------------------------
  // จัดการไฟล์ที่แนบมา
  // -----------------------------
  const handleAttachFiles = useCallback((files) => {
    if (!files || files.length === 0) return
    
    const maxFileSize = 10 * 1024 * 1024 // 10 MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    
    const newFiles = []
    let hasError = false

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // ตรวจสอบขนาดไฟล์
      if (file.size > maxFileSize) {
        setSendError(`ไฟล์ ${file.name} ใหญ่เกิน 10 MB`)
        hasError = true
        break
      }

      // ตรวจสอบประเภทไฟล์
      if (!allowedTypes.includes(file.type)) {
        setSendError(`ไฟล์ ${file.name} ไม่ได้รับการสนับสนุน`)
        hasError = true
        break
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      })
    }

    if (hasError) return

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }, [])

  // ลบไฟล์ที่เลือก
  const handleRemoveFile = useCallback((fileId) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId)
      // Clear preview URL
      const removed = prev.find((f) => f.id === fileId)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  // ลบไฟล์ทั้งหมด
  const handleClearFiles = useCallback(() => {
    selectedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
    setSelectedFiles([])
  }, [selectedFiles])

  // ลบข้อความ
  // -----------------------------
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!activeRoom) return
      try {
        await ChatAPI.deleteMessage(activeRoom.id, messageId)
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        
        // ออกอากาศการลบข้อความ
        socket?.emit?.('messageDeleted', {
          roomId: activeRoom.id,
          messageId,
        })
      } catch (error) {
        console.error('Error deleting message:', error)
        window.alert('ไม่สามารถลบข้อความได้')
      }
    },
    [activeRoom, socket],
  )
  // แก้ไขข้อความ
  // -----------------------------
  const handleEditMessage = useCallback(
    async (messageId, newContent) => {
      if (!activeRoom) return
      try {
        const updatedMessage = await ChatAPI.editMessage(
          activeRoom.id,
          messageId,
          newContent,
        )
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: newContent, edited: true, ...updatedMessage }
              : m,
          ),
        )

        // ออกอากาศการแก้ไขข้อความ
        socket?.emit?.('messageEdited', {
          roomId: activeRoom.id,
          messageId,
          content: newContent,
        })
      } catch (error) {
        console.error('Error editing message:', error)
        window.alert('ไม่สามารถแก้ไขข้อความได้')
      }
    },
    [activeRoom, socket],
  )

  // ตอบกลับข้อความ
  // -----------------------------
  const handleReplyMessage = useCallback(
    (messageId) => {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        setReplyingTo({
          id: messageId,
          username: message.user?.username || 'Unknown',
          content: message.content,
        })
      }
    },
    [messages],
  )

  // ยกเลิกการตอบกลับ
  // -----------------------------
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  // ครูสร้างห้องแชท
  // -----------------------------
  const handleCreateRoom = useCallback(
    async (roomData) => {
      if (!user) return
      const roomName = roomData?.name?.trim()
      if (!roomName) return

      try {
        // memberIds = [] → backend จะดึงนักเรียนทั้งหมด (role=STUDENT) + teacher เข้า room ให้อัตโนมัติ
        const createdRoom = await ChatAPI.createRoom(roomName, [])

        console.log('[Chat] created room from API:', createdRoom)

        setRooms((prev) => {
          const filtered = prev.filter((r) => r.id !== createdRoom.id)
          return [createdRoom, ...filtered]
        })

        setActiveRoom(createdRoom)
        setMessages([])

        // join room ใหม่ทาง socket
        socket?.emit?.('joinRoom', { roomId: createdRoom.id })
      } catch (err) {
        console.error('Failed to create room:', err)
        window.alert('สร้างห้องแชทไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      }
    },
    [user, socket],
  )

  // Pin/Unpin room
  // -----------------------------
  const handleTogglePin = useCallback(
    async (roomId) => {
      try {
        const isPinned = pinnedRooms.some(p => p.roomId === roomId)
        await togglePin(roomId, isPinned)
      } catch (err) {
        console.error('Error toggling pin:', err)
        window.alert('ไม่สามารถบันทึกการ pin ห้องได้')
      }
    },
    [pinnedRooms, togglePin],
  )

  // -----------------------------
  // Render
  return (
    <ChatLayout
      rooms={rooms}
      roomsLoading={roomsLoading}
      roomsError={roomsError}
      activeRoom={activeRoom}
      onSelectRoom={setActiveRoom}
      messages={messages}
      loadingMessages={loadingMessages}
      text={text}
      setText={handleChangeText}
      onSendMessage={sendMessage}
      currentUser={user}
      canCreateRoom={canCreateRoom}
      onCreateRoom={handleCreateRoom}
      socketConnected={socketConnected}
      typingUsers={typingUsers}
      sendLoading={sendLoading}
      sendError={sendError}
      onDeleteMessage={handleDeleteMessage}
      onEditMessage={handleEditMessage}
      onReplyMessage={handleReplyMessage}
      replyingTo={replyingTo}
      onCancelReply={() => setReplyingTo(null)}
      pinnedRooms={pinnedRooms}
      onTogglePin={handleTogglePin}
      selectedFiles={selectedFiles}
      onAttachFiles={handleAttachFiles}
      onRemoveFile={handleRemoveFile}
      onClearFiles={handleClearFiles}
    />
  )
}
