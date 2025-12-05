import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, X, Bot, User } from 'lucide-react'
import { useAssistantChat } from '../hooks/useAssistantChat'

export default function AssistantWidget({ userId = 'student-123', roomId, roomName }) {
  const [open, setOpen] = useState(true)
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const listRef = useRef(null)

  const {
    items,
    send,
    loading,
    error,
    onTyping,
    seenMessage,
    connected,
  } = useAssistantChat({ userId, roomId, roomName })

  // auto scroll ลงข้อความล่าสุด
  useEffect(() => {
    if (!open) return
    listRef.current?.lastElementChild?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    })
  }, [items, open])

  useEffect(() => {
    setConnectionError(!connected)
  }, [connected])

  const handleChange = (e) => {
    const value = e.target.value
    setText(value)
    const typing = value.trim().length > 0
    setIsTyping(typing)
    onTyping?.(typing)
  }

  const handleBlur = () => {
    setIsTyping(false)
    onTyping?.(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) return
    send(msg)
    setText('')
    setIsTyping(false)
    onTyping?.(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* ปุ่มลอยเมื่อปิด widget */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="text-white px-4 py-2 flex items-center gap-2 text-sm"
        >
          <Bot size={18} className="drop-shadow" />
          <span>KVC Assistant</span>
        </button>
      )}

      {/* กล่อง Assistant */}
      {open && (
        <div className="w-[360px] max-h-[70vh] bg-[#020617] border border-[#1f2937] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-violet-700/95 via-violet-600/95 to-indigo-600/95 border-b border-violet-400/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-black/30 border border-violet-300/50 flex items-center justify-center">
                <Bot size={16} className="text-violet-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-violet-50">
                  KVC Assistant
                </span>
                <span className="text-[10px] text-violet-100/80 flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      connected ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  {connected ? 'ออนไลน์พร้อมช่วยเหลือ' : 'ออฟไลน์: รอการเชื่อมต่อใหม่'}
                </span>
              </div>
            </div>
            <button
              className="p-1 rounded hover:bg-black/20 text-violet-50"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          </div>

          {/* แถบแจ้งเตือน connection */}
          {connectionError && (
            <div className="px-3 py-1.5 bg-red-900/40 border-b border-red-700/60 text-[11px] text-red-100">
              ไม่สามารถเชื่อมต่อกับ Assistant ได้ชั่วคราว ระบบจะลองเชื่อมต่อใหม่อัตโนมัติ
            </div>
          )}

          {/* ส่วนแชท */}
          <div
            ref={listRef}
            className="p-3 space-y-2 overflow-y-auto bg-[#020617]"
            style={{ minHeight: 220 }}
          >
            {items.length === 0 && (
              <div className="text-[11px] text-gray-400 bg-slate-900/60 border border-slate-700/70 rounded-xl px-3 py-2">
                พิมพ์ถามได้เลย เช่น
                <span className="block mt-1 text-gray-300">
                  • ตารางเรียนวันนี้ <br />
                  • ยื่นลาเรียนยังไง <br />
                  • ข่าวประกาศล่าสุด
                </span>
              </div>
            )}

            {items.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed border
                    ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                        : 'bg-slate-900/70 text-slate-100 border-slate-700'
                    }`}
                  onMouseEnter={() => m.role === 'assistant' && !m.seen && seenMessage(m.id)}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px]
                        ${
                          m.role === 'user'
                            ? 'bg-violet-700/90'
                            : 'bg-slate-800/90 text-violet-100'
                        }`}
                    >
                      {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  </div>

                  {m.failed && (
                    <div className="text-[10px] text-red-200 mt-1">ส่งไม่สำเร็จ</div>
                  )}

                  <div
                    className={`text-[10px] mt-1 flex items-center justify-between ${
                      m.role === 'user' ? 'text-white/60' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(m.ts).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {m.role === 'user' && m.seen && <span>อ่านแล้ว</span>}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Loader2 className="animate-spin" size={14} />
                กำลังส่ง…
              </div>
            )}

            {error && (
              <div className="text-[11px] text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-3 py-1.5">
                {error}
              </div>
            )}
          </div>

          {/* แถบพิมพ์ข้อความ */}
          <form
            onSubmit={handleSubmit}
            className="p-2 border-t border-[#1f2937] bg-slate-950/90 flex items-center gap-2"
          >
            <input
              value={text}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="พิมพ์ข้อความ…"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-100
                         placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs
                         disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 border border-violet-400/70"
            >
              <Send size={14} />
              ส่ง
            </button>
          </form>

          {/* แถบสถานะ typing ข้างล่าง (ตัวเล็ก ๆ) */}
          {isTyping && (
            <div className="px-3 pb-2 text-[10px] text-slate-400 bg-slate-950/90">
              Assistant กำลังพิมพ์…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
