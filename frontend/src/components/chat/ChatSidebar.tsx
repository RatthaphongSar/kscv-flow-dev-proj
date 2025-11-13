import React, { useMemo, useState } from 'react';
import { Conversation, User } from '@/lib/chatDummyData';
import UserAvatar from './UserAvatar';

export function ChatSidebar({ conversations, users, activeId, onSelect }:{ conversations: Conversation[]; users:any[]; activeId?:string; onSelect:(id:string)=>void }){
  const [q, setQ] = useState('');
  const filtered = useMemo(()=> conversations.filter(c=> c.title.toLowerCase().includes(q.toLowerCase()) || (c.lastMessage||'').toLowerCase().includes(q.toLowerCase())),[conversations,q]);

  return (
    <aside className="w-72 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inbox</h3>
          <div className="text-xs text-gray-400">Online</div>
        </div>
        <div className="mt-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search user or messages" className="w-full px-3 py-2 rounded-lg bg-gray-50 border" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map(c=> (
          <button key={c.id} onClick={()=>onSelect(c.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${activeId===c.id? 'bg-[#F0F7FF]':'hover:bg-gray-50'}`}>
            <UserAvatar user={{id:c.participants[1], name:c.title, role:'Student', avatar:null}} size={10} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-gray-400">{c.lastAt}</div>
              </div>
              <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
            </div>
            {c.unread ? <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{c.unread}</div>:null}
          </button>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <UserAvatar user={{id:'me', name:'You', role:'Student'}} size={10} />
          <div>
            <div className="text-sm font-medium">You</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ChatSidebar;
