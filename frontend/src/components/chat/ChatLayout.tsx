import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';
import ChatDetailsPanel from './ChatDetailsPanel';
import { conversations as convData, messages as msgData, users, attachments, notes, tasks } from '@/lib/chatDummyData';
import { Conversation, Message } from '@/lib/chatDummyData';

export default function ChatLayoutPage(){
  const [conversations] = useState<Conversation[]>(convData);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [allMessages, setAllMessages] = useState<Message[]>(msgData);

  const activeConv = conversations.find(c=>c.id===activeId)!;
  const convMessages = allMessages.filter(m=>m.conversationId===activeId);

  function handleSend(text:string){
    const m: Message = { id: 'm_'+Date.now(), conversationId: activeId, senderId: 'me', text, createdAt: new Date().toISOString(), type: 'text' };
    setAllMessages(prev=>[...prev, m]);
  }

  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex bg-white rounded-xl overflow-hidden shadow">
          <ChatSidebar conversations={conversations} users={users} activeId={activeId} onSelect={setActiveId} />
          <div className="flex-1">
            <ChatConversation messages={convMessages} meId={'me'} onSend={handleSend} title={activeConv.title} status={users.find(u=>u.id===activeConv.participants[1])?.status} />
          </div>
          <ChatDetailsPanel user={users.find(u=>u.id===activeConv.participants[1])||null} attachments={attachments} notes={notes} tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
