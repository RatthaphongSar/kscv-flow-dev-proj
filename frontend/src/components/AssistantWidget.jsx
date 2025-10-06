import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, X, Bot, User } from 'lucide-react';
import { useAssistantChat } from '../hooks/useAssistantChat';

export default function AssistantWidget({ userId = 'student-123', roomId, roomName }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const { items, send, loading, error } = useAssistantChat({ userId, roomId, roomName });

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [items, open]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="rounded-full shadow-lg bg-primary text-white px-4 py-2 flex items-center gap-2"
        >
          <Bot size={18}/> Assistant
        </button>
      )}
      {open && (
        <div className="w-[360px] max-h-[70vh] bg-white border rounded-2xl shadow-xl flex flex-col">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold"><Bot size={18}/> KVC Assistant</div>
            <button className="p-1 hover:bg-slate-100 rounded" onClick={()=>setOpen(false)}><X size={16}/></button>
          </div>

          <div ref={listRef} className="p-3 space-y-2 overflow-y-auto" style={{minHeight: 220}}>
            {items.length === 0 && (
              <div className="text-sm text-slate-500">พิมพ์ถามได้เลย เช่น “ตารางเรียนวันนี้”, “ยื่นลาเรียนยังไง”, “ข่าวประกาศล่าสุด”</div>
            )}
            {items.map(m => (
              <div key={m.id} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed border
                  ${m.role==='user' ? 'bg-primary text-white border-primary' : 'bg-surface text-slate-800'}`}>
                  <div className="flex items-start gap-2">
                    {m.role==='user' ? <User size={14}/> : <Bot size={14}/>}
                    <div>{m.text}</div>
                  </div>
                  {m.failed && <div className="text-xs text-red-200 mt-1">ส่งไม่สำเร็จ</div>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="animate-spin" size={14}/> กำลังส่ง…</div>
            )}
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>

          <form
            onSubmit={(e)=>{e.preventDefault(); if(text.trim()) { send(text.trim()); setText(''); }}}
            className="p-2 border-t flex items-center gap-2"
          >
            <input
              value={text} onChange={e=>setText(e.target.value)} placeholder="พิมพ์ข้อความ…"
              className="flex-1 border rounded-xl px-3 py-2 focus:outline-primary"
            />
            <button disabled={!text.trim() || loading}
              className="px-3 py-2 rounded-xl bg-primary text-white disabled:opacity-50 flex items-center gap-1"
            >
              <Send size={16}/> ส่ง
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
