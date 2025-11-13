import React, { useState } from 'react';
import { Attachment, Note, Task, User } from '@/lib/chatDummyData';

function Section({title, children}:{title:string; children:React.ReactNode}){
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 bg-white rounded-lg border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        <button onClick={()=>setOpen(v=>!v)} className="text-xs text-gray-500">{open? 'Hide':'Show'}</button>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

export function ChatDetailsPanel({ user, attachments, notes, tasks }:{ user:User | null; attachments:Attachment[]; notes:Note[]; tasks:Task[] }){
  return (
    <aside className="w-80 border-l bg-white p-4 flex flex-col gap-4">
      {user && (
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#0A4DAD] flex items-center justify-center text-white text-xl font-semibold">{user.name.split(' ')[0][0]}</div>
          <div className="mt-2 text-sm font-medium">{user.name}</div>
          <div className="text-xs text-gray-400">{user.role}</div>
        </div>
      )}

      <Section title="Search in conversation">
        <input className="w-full px-3 py-2 rounded-lg border" placeholder="Search in conversation" />
      </Section>

      <Section title="Attachments">
        <div className="space-y-2">
          {attachments.map(a=> (
            <div key={a.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm">{a.filename}</div>
                <div className="text-xs text-gray-400">{a.size}</div>
              </div>
              <button className="text-blue-600 text-sm">Download</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Notes">
        <div className="space-y-2">
          {notes.map(n=> (
            <div key={n.id} className="text-sm text-gray-700">{n.text}</div>
          ))}
          <button className="mt-2 px-3 py-1 bg-gray-100 rounded">Add note</button>
        </div>
      </Section>

      <Section title="Tasks">
        <div className="space-y-2">
          {tasks.map(t=> (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={t.done} /> {t.text}
            </label>
          ))}
        </div>
      </Section>

    </aside>
  );
}

export default ChatDetailsPanel;
