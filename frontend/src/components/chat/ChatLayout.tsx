import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';
import ChatDetailsPanel from './ChatDetailsPanel';
import { conversations as convData, messages as msgData, users, attachments, notes, tasks, Message } from '@/lib/chatDummyData';
import { Conversation } from '@/lib/chatDummyData';

interface AttachmentData {
  file: File;
  preview: string;
}

export default function ChatLayoutPage(){
  const [conversations] = useState<Conversation[]>(convData);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [allMessages, setAllMessages] = useState<Message[]>(msgData);

  const activeConv = conversations.find(c=>c.id===activeId)!;
  const convMessages = allMessages.filter(m=>m.conversationId===activeId);

  function handleSend(text: string, attachment?: AttachmentData | null){
    const m: Message = { 
      id: 'm_'+Date.now(), 
      conversationId: activeId, 
      senderId: 'me', 
      text, 
      createdAt: new Date().toISOString(), 
      type: attachment ? 'file' : 'text',
      attachment: attachment ? {
        id: 'a_'+Date.now(),
        filename: attachment.file.name,
        size: (attachment.file.size / 1024 / 1024).toFixed(2) + 'MB',
        type: attachment.file.type.split('/')[1] || 'file'
      } : null,
      mentions: [] // Will be parsed from text if needed
    };
    setAllMessages(prev=>[...prev, m]);
  }

  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex bg-white rounded-xl overflow-hidden shadow">
          <ChatSidebar conversations={conversations} activeId={activeId} onSelect={setActiveId} />
          <div className="flex-1">
            <ChatConversation messages={convMessages} meId={'me'} onSend={handleSend} title={activeConv.title} status={users.find(u=>u.id===activeConv.participants[1])?.status} />
          </div>
          <ChatDetailsPanel user={users.find(u=>u.id===activeConv.participants[1])||null} attachments={attachments} notes={notes} tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
