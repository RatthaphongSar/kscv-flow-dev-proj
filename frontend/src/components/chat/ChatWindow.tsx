import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

import {
  Send,
  Search,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { useChatStore } from '@/stores/chat';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  edited?: boolean;
  file?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
}

interface MessageGroup {
  senderId: string;
  messages: Message[];
}

interface ChatWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  onSendFile?: (file: File) => void;
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {!isMine && (
        <Avatar className="w-6 h-6">
          <AvatarFallback>EB</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-3 py-2 text-sm',
          isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        <p>{message.text}</p>
        <div
          className={cn(
            'flex items-center gap-1 text-[10px] mt-1',
            isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {isMine && (
            <span className="flex items-center gap-0.5">
              {message.edited && '(edited) '}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && (
                <span className="text-primary-foreground">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({ className, onSendFile, ...props }: ChatWindowProps) {
  const { id } = useParams();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const {
    currentRoomId,
    messages: allMessages,
    sendMessage,
    updateMessageStatus,
    setTyping,
  } = useChatStore();

  const messages = currentRoomId ? allMessages[currentRoomId] || [] : [];
  const room = useChatStore((state) => state.rooms.find((r) => r.id === currentRoomId));

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchText, setSearchText] = useState(''); // สำหรับค้นหาข้อความ
  const [showEmoji, setShowEmoji] = useState(false); // สำหรับ emoji picker

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    if (!currentRoomId) return;
    let typingTimeout: NodeJS.Timeout;

    if (isTyping) {
      setTyping(currentRoomId, true);
      typingTimeout = setTimeout(() => {
        setTyping(currentRoomId, false);
        setIsTyping(false);
      }, 3000);
    }

    return () => {
      clearTimeout(typingTimeout);
      if (currentRoomId) setTyping(currentRoomId, false);
    };
  }, [isTyping, currentRoomId, setTyping]);

  // Send message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;

    sendMessage({
      id: crypto.randomUUID(),
      text,
      senderId: 'me',
      timestamp: Date.now(),
      status: 'sending',
    });

    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onSendFile) {
      onSendFile(file);
    }
  };

  // Filter messages by searchText
  const filteredMessages = searchText
    ? messages.filter((msg) => msg.text.toLowerCase().includes(searchText.toLowerCase()))
    : messages;

  // Group messages by sender
  const messageGroups = messages.reduce<MessageGroup[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    const timeDiff = lastGroup
      ? message.timestamp -
        lastGroup.messages[lastGroup.messages.length - 1].timestamp
      : Infinity;

    if (lastGroup && lastGroup.senderId === message.senderId && timeDiff < 300000) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ senderId: message.senderId, messages: [message] });
    }
    return groups;
  }, []);

  // Emoji picker mockup (replace with real emoji picker library if needed)
  const emojiList = ['😀','😂','😍','👍','🙏','🎉','😎','🥳','❤️','🔥'];
  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
  };

  if (!currentRoomId || !room) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)} {...props}>
        <p className="text-gray-500">เลือกบทสนทนาเพื่อเริ่มแชท</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)} {...props}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={room.avatar} alt={room.name} />
            <AvatarFallback>{room.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{room.name}</h2>
            {room.typing ? (
              <p className="text-sm text-blue-500">กำลังพิมพ์...</p>
            ) : room.online ? (
              <p className="text-sm text-green-500">ออนไลน์</p>
            ) : room.lastSeen ? (
              <p className="text-sm text-gray-500">
                ออนไลน์ล่าสุด{' '}
                {formatDistanceToNow(room.lastSeen, { addSuffix: true, locale: th })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea.Root className="flex-1">
        <ScrollArea.Viewport ref={scrollViewportRef} className="h-full p-4">
          <div className="space-y-6">
            {/* ใช้ filteredMessages แทน messages */}
            {filteredMessages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === 'me'} />
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 ease-out"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 p-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowEmoji((v) => !v)}
            type="button"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-16 right-8 bg-white border rounded shadow-lg p-2 flex gap-1 z-50">
              {emojiList.map((emoji) => (
                <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-2xl p-1 hover:bg-gray-100 rounded">{emoji}</button>
              ))}
            </div>
          )}
          <button
            className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSubmit}
            type="button"
          >
            <Send className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}
