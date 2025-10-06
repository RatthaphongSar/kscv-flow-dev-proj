// src/components/chat/ChatWindow.jsx
import { useEffect, useRef, useState } from 'react'
import MessageItem from './MessageItem'
import Composer from './Composer'
import { ChatAPI } from '../../services/chat'
import { useAuth } from '../../context/AuthContext'
import { useChatSocket } from '../../context/ChatSocketContext'

export default function ChatWindow({ room }) {
  const { user } = useAuth()
  const { joinRoom, leaveRoom, on, emitTyping } = useChatSocket()
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const scRef = useRef(null)

  // load history + join socket room
  useEffect(() => {
    if (!room?.id || !user) return
    let offNew, offTyping
    ChatAPI.listMessages(room.id, 60).then(setMessages).catch(()=>{})

    joinRoom(room.id)
    offNew = on('chat:new', (m) => {
      if (m.roomId === room.id) setMessages(prev => [...prev, m])
    })
    offTyping = on('chat:typing', (p) => {
      if (p.roomId === room.id) setTyping(!!p.isTyping)
    })
    return () => {
      leaveRoom(room.id)
      offNew && offNew()
      offTyping && offTyping()
    }
  }, [room?.id, user])

  useEffect(() => {
    scRef.current?.scrollTo({ top: scRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  async function send(text) {
    // optimistic append
    const optimistic = {
      id: `tmp_${Date.now()}`,
      roomId: room.id,
      userId: user.id,
      user: { id: user.id, username: user.username },
      content: text,
      createdAt: new Date().toISOString(),
      _status: 'sending'
    }
    setMessages(prev => [...prev, optimistic])
    try {
      const saved = await ChatAPI.sendMessage(room.id, user.id, text)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, _status:'sent' } : m))
    } catch {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, _status:'error' } : m))
    }
  }

  return (
    <div className="bg-white border rounded-lg flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-medium">{room?.name || 'Room'}</span>
        {typing && <span className="text-xs text-slate-500">กำลังพิมพ์…</span>}
      </div>
      <div ref={scRef} className="flex-1 p-3 overflow-auto bg-white">
        {messages.map(m => (
          <MessageItem key={m.id} me={m.userId === user?.id} msg={m} />
        ))}
      </div>
      <Composer onSend={send} onTyping={(b)=>emitTyping(room.id, b)} />
    </div>
  )
}
