import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import { useChatStore } from '../../stores/chat';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '../../utils';

type ConversationListProps = React.HTMLAttributes<HTMLDivElement>;

interface Room {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  lastMessage?: {
    text: string;
    timestamp: number;
  };
  unreadCount: number;
  typing?: boolean;
}

interface ConversationItemProps {
  room: Room;
}

function ConversationItem({ room }: ConversationItemProps) {
  const { currentRoomId, setCurrentRoom } = useChatStore();
  const isActive = room.id === currentRoomId;

  return (
    <button
      onClick={() => setCurrentRoom(room.id)}
      className={cn(
        'w-full p-2 flex items-center gap-3 rounded-lg transition-colors duration-150',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
        isActive && 'bg-blue-50 hover:bg-blue-100'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar>
          <AvatarImage src={room.avatar} alt={room.name} />
          <AvatarFallback>{room.name[0]}</AvatarFallback>
        </Avatar>
        {room.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{room.name}</span>
          {room.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(room.lastMessage.timestamp, {
                addSuffix: true,
                locale: th
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 truncate">
            {room.typing ? (
              <span className="text-blue-500">กำลังพิมพ์...</span>
            ) : (
              room.lastMessage?.text
            )}
          </span>
          {room.unreadCount > 0 && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ConversationList({ className, ...props }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const { rooms, currentRoomId, favorites, setCurrentRoom } = useChatStore();

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  // Split into favorites and other rooms
  const favoriteRooms = filteredRooms.filter(room => favorites.includes(room.id));
  const otherRooms = filteredRooms.filter(room => !favorites.includes(room.id));

  return (
    <div className={cn('flex flex-col h-full', className)} {...props}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">แชทส่วนตัว</h2>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาข้อความ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea.Root className="flex-1">
        <ScrollArea.Viewport className="h-full">
          <div className="p-2 space-y-1">
            {/* Favorites Section */}
            {favoriteRooms.length > 0 && (
              <>
                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                  รายการโปรด
                </h3>
                {favoriteRooms.map((room) => (
                  <ConversationItem key={room.id} room={room} />
                ))}
                <div className="my-2 border-t border-gray-200" />
              </>
            )}

            {/* Other Conversations */}
            <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
              การสนทนาทั้งหมด
            </h3>
            {otherRooms.map((room) => (
              <ConversationItem key={room.id} room={room} />
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
    </div>
  );
}