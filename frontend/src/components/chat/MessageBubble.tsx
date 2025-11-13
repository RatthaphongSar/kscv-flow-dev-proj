import React from 'react';
import { Message } from '@/lib/chatDummyData';
import UserAvatar from './UserAvatar';

export function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}> 
      <div className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''} max-w-[70%]`}>
        {!isMe && <UserAvatar user={{id: msg.senderId, name: msg.senderId, role: 'Student', avatar: null}} size={8} />}
        <div>
          <div className={`px-3 py-2 rounded-2xl ${isMe ? 'bg-[#0A4DAD] text-white' : 'bg-[#F5F9FF] text-gray-900'}`}>
            <div className="whitespace-pre-wrap break-words text-sm">{msg.text}</div>
          </div>
          <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
