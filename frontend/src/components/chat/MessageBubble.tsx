import { Message } from '@/lib/chatDummyData';
import UserAvatar from './UserAvatar';

// Helper to render text with @mentions highlighted
function renderTextWithMentions(text: string | undefined, mentions: any[] = []) {
  if (!text) return null;

  if (mentions.length === 0) {
    return <span>{text}</span>;
  }

  const parts = [];
  let lastIndex = 0;

  mentions.forEach((mention) => {
    if (mention.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, mention.index)}
        </span>
      );
    }
    parts.push(
      <span key={`mention-${mention.userId}`} className="bg-yellow-100 font-semibold text-blue-700 px-1 rounded">
        @{mention.name}
      </span>
    );
    lastIndex = mention.index + mention.length;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

export function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}> 
      <div className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''} max-w-[70%]`}>
        {!isMe && <UserAvatar user={{id: msg.senderId, name: msg.senderId, role: 'Student', avatar: null}} size={8} />}
        <div>
          <div className={`px-3 py-2 rounded-2xl ${isMe ? 'bg-[#0A4DAD] text-white' : 'bg-[#F5F9FF] text-gray-900'}`}>
            {/* Attachment preview if exists */}
            {msg.attachment && (
              <div className="mb-2 w-40">
                {msg.attachment.type === 'pdf' || msg.attachment.type === 'doc' ? (
                  <div className="bg-gray-200 p-2 rounded flex items-center gap-2 cursor-pointer hover:bg-gray-300">
                    <span className="text-lg">📄</span>
                    <div className="text-xs">
                      <div className="font-semibold">{msg.attachment.filename}</div>
                      <div className="opacity-75">{msg.attachment.size}</div>
                    </div>
                  </div>
                ) : (
                  <img src={msg.attachment.filename} alt="attachment" className="w-full rounded-lg" />
                )}
              </div>
            )}
            
            {/* Message text with mentions */}
            <div className="whitespace-pre-wrap break-words text-sm">
              {renderTextWithMentions(msg.text, msg.mentions)}
            </div>
          </div>
          <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
