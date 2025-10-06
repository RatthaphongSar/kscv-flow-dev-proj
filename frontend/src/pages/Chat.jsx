import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatSocket } from '../context/ChatSocketContext'
import { ChatAPI } from '../services/chat'

export default function ChatPage() {
  const { user } = useAuth()
  const socket = useChatSocket()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  // โหลดห้องของ user
  useEffect(() => {
    if (!user) return
    ChatAPI.listRooms(user.id).then(setRooms)
  }, [user])

  // join room
  useEffect(() => {
    if (!socket || !activeRoom) return
    socket.emit('joinRoom', activeRoom.id)

    socket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => socket.off('chatMessage')
  }, [socket, activeRoom])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    await ChatAPI.sendMessage(activeRoom.id, user.id, text)
    setText('')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex h-[85vh] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Sidebar Rooms */}
        <aside className="w-80 bg-[#F5F9FF] border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#0A4DAD]">Group Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-1">
              {rooms.map(r => (
                <button key={r.id}
                  onClick={() => { setActiveRoom(r); setMessages([]) }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                    ${activeRoom?.id === r.id 
                      ? 'bg-[#0A4DAD] text-white shadow-md' 
                      : 'text-gray-700 hover:bg-white'}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="font-medium">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-[#0A4DAD] flex items-center justify-center text-white font-medium">
                {user?.username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{user?.username}</div>
                <div className="text-sm text-gray-500">ออนไลน์</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeRoom ? activeRoom.name : 'เลือกห้องสนทนา'}
              </h1>
              {activeRoom && <span className="text-sm text-gray-500">สมาชิก 3 คน</span>}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 px-8 py-6 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.userId === user.id ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex max-w-2xl ${m.userId === user.id ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="flex flex-col items-center mx-4">
                    <div className="w-8 h-8 rounded-full bg-[#0A4DAD] flex items-center justify-center text-white text-sm">
                      {m.user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className={`px-6 py-4 rounded-2xl shadow-sm
                    ${m.userId === user.id 
                      ? 'bg-[#0A4DAD] text-white' 
                      : 'bg-[#F5F9FF] text-gray-900'}`}>
                    <div className={`text-sm mb-1 font-medium
                      ${m.userId === user.id ? 'text-blue-100' : 'text-[#0A4DAD]'}`}>
                      {m.user?.username}
                    </div>
                    <div className="text-[15px] leading-relaxed">{m.content}</div>
                    <div className={`text-xs mt-2 
                      ${m.userId === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {activeRoom && (
            <div className="border-t border-gray-200 bg-white px-8 py-6">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input 
                  className="flex-1 bg-[#F5F9FF] border-0 rounded-xl px-6 py-4
                            focus:outline-none focus:ring-2 focus:ring-[#0A4DAD]"
                  placeholder="พิมพ์ข้อความของคุณ..."
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                />
                <button 
                  type="submit"
                  className="bg-[#0A4DAD] text-white px-8 py-4 rounded-xl font-medium
                           hover:bg-[#083b87] transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
                  disabled={!text.trim()}>
                  <span>ส่งข้อความ</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
