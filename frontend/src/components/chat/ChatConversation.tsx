import { useEffect, useRef } from 'react';
import { Message } from '@/lib/chatDummyData';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface Attachment {
  file: File;
  preview: string;
}

export function ChatConversation({ messages, meId, onSend, title, status } : { messages: Message[]; meId: string; onSend: (t:string, a?: Attachment | null)=>void; title:string; status?:string }){
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-400">{status}</div>
        </div>
        <div>
          <button className="text-sm text-blue-600">View profile</button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(m => (
          <MessageBubble key={m.id} msg={m} isMe={m.senderId===meId} />
        ))}
      </div>

      <MessageInput onSend={onSend} />
    </div>
  );
}

export default ChatConversation;
