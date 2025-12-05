# Message Status & Unread Tracking Implementation Guide

## Overview
This guide explains how to integrate the message status (pending→sent→delivered→seen) and unread count system into your KVC Chat application.

**System Architecture:**
```
Frontend                          Socket.io                    Backend
────────────────────────────────────────────────────────────────────────

User sends message
  ↓
1. Show message as "pending" ⏳
2. Emit message:send
                    ───────────────→ Receive message:send
                                     Save to DB
                                     Emit message:delivered
                    ←───────────────
3. Show as "sent" ✓
4. Update messageStatuses[id] = 'sent'

Message received by others
                                     Mark as "sent"
                                     Emit message:new
                    ←───────────────
5. Show in chat
6. Unread count++

User views messages
(Intersection Observer detects visible)
  ↓
7. Emit message:markSeen
                    ───────────────→ Add userId to seenBy[]
                                     Emit message:seen
                    ←───────────────
8. Show "Seen by X users" ✓✓
9. Reset unread count = 0
```

---

## Files Already Created

### 1. **frontend/src/types/chat-status.ts** ✅
Core TypeScript types for the entire system.

**Key exports:**
- `MessageStatus = 'pending' | 'sent' | 'delivered' | 'seen'`
- `Message` interface with status & seenBy fields
- `Room` interface with unreadCount field
- `SocketEvents` typed events

**Usage:**
```typescript
import type { Message, Room, MessageStatus } from '@/types/chat-status'
```

---

### 2. **frontend/src/hooks/useChatStatus.ts** ✅
Custom React hook managing all status + unread logic.

**Key functions:**
```typescript
const {
  messageStatuses,      // Map<messageId, status>
  unreadCounts,        // Map<roomId, count>
  markMessagesAsSeen,  // Function to send "seen" event (debounced 500ms)
  isLoading,           // Socket connection status
} = useChatStatus(roomId)
```

**Socket listeners setup inside hook:**
- `message:delivered` → Updates message status
- `message:seen` → Updates message status + counts seenBy
- `room:unreadCountUpdated` → Updates unread count

**Usage:**
```typescript
function ChatPage() {
  const { messageStatuses, unreadCounts, markMessagesAsSeen } = useChatStatus(roomId)
  
  // Pass to children
  return <MessageBubble status={messageStatuses[message.id]} />
}
```

---

### 3. **frontend/src/components/chat/MessageBubbleWithStatus.tsx** ✅
Enhanced message display with status indicators.

**Status indicators:**
- ⏳ pending
- ✓ sent/delivered
- ✓✓ seen (blue)

**Read receipts:**
- "Seen by 2 users" (small chat)
- "Seen by Alice, Bob" (shows names if < 3 users)

**Usage:**
```typescript
<MessageBubbleWithStatus
  message={message}
  status={messageStatuses[message.id] || 'sent'}
  onMarkSeen={() => markMessagesAsSeen(message.id)}
/>
```

---

### 4. **frontend/src/components/chat/RoomListItemWithUnread.tsx** ✅
Room list item with unread badge.

**Features:**
- Red badge showing unread count
- Bold room name if unread > 0
- Left border indicator
- Last message preview + formatted timestamp

**Usage:**
```typescript
<RoomListItemWithUnread
  room={room}
  unreadCount={unreadCounts[room.id] || 0}
  isSelected={selectedRoomId === room.id}
  onClick={() => selectRoom(room.id)}
/>
```

---

### 5. **frontend/src/components/chat/ChatConversationWithStatus.tsx** ✅
Chat window with Intersection Observer for read receipts.

**Automatically:**
- Detects which messages are visible on screen
- Debounce sends "seen" event (500ms delay)
- Prevents excessive socket emissions

**Usage:**
```typescript
<ChatConversationWithStatus
  roomId={roomId}
  messages={messages}
  messageStatuses={messageStatuses}
  unreadCounts={unreadCounts}
/>
```

---

### 6. **frontend/src/pages/ChatWithStatusExample.jsx** ✅
Complete working example showing full integration.

**Demonstrates:**
- Hook setup
- Socket event handling
- Optimistic message rendering
- Error recovery
- Proper cleanup

**Reference this when integrating!**

---

## Integration Steps

### Step 1: Update Chat.jsx (Main Integration)

Replace your existing `Chat.jsx` with integration of new components:

```typescript
// frontend/src/pages/Chat.jsx

import { useChatStatus } from '@/hooks/useChatStatus'
import MessageBubbleWithStatus from '@/components/chat/MessageBubbleWithStatus'
import RoomListItemWithUnread from '@/components/chat/RoomListItemWithUnread'
import ChatConversationWithStatus from '@/components/chat/ChatConversationWithStatus'

export default function Chat() {
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  
  // ✅ Add this hook
  const { messageStatuses, unreadCounts, markMessagesAsSeen } = useChatStatus(selectedRoomId)
  
  const currentRoom = rooms.find(r => r.id === selectedRoomId)
  const messages = currentRoom?.messages || []
  
  return (
    <div className="h-screen flex">
      {/* Sidebar: Use RoomListItemWithUnread */}
      <aside className="w-80 bg-gray-900">
        {rooms.map(room => (
          <RoomListItemWithUnread
            key={room.id}
            room={room}
            unreadCount={unreadCounts[room.id] || 0}
            isSelected={selectedRoomId === room.id}
            onClick={() => setSelectedRoomId(room.id)}
          />
        ))}
      </aside>
      
      {/* Main chat: Use ChatConversationWithStatus */}
      {currentRoom && (
        <ChatConversationWithStatus
          roomId={currentRoom.id}
          messages={messages}
          messageStatuses={messageStatuses}
          unreadCounts={unreadCounts}
        />
      )}
    </div>
  )
}
```

### Step 2: Update Backend Socket Handlers

Add the socket handlers from `backend/src/socket-handlers-example.js`:

```javascript
// backend/src/socket.js or backend/src/socket-handlers.js

const { setupSocketHandlers } = require('./socket-handlers-example')

function initializeSocket(io) {
  setupSocketHandlers(io)
}

module.exports = { initializeSocket }
```

### Step 3: Update Backend Schema

Apply the Prisma schema changes from `backend/prisma/schema-updates.example.md`:

```bash
cd backend

# 1. Update schema.prisma (add Message.status, Message.seenBy, UnreadCount model, etc.)

# 2. Create migration
npx prisma migrate dev --name "add-message-status-unread-tracking"

# 3. Regenerate client
npx prisma generate
```

### Step 4: Create Backend API Endpoints

Create these REST endpoints in your backend:

```javascript
// backend/src/routes/messages.js

// Mark message as seen
router.post('/:id/seen', async (req, res) => {
  const { id } = req.params
  const { roomId } = req.body
  const userId = req.user.id
  
  try {
    // Get all messages up to this one
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    })
    
    const messageIndex = messages.findIndex(m => m.id === id)
    const messagesToUpdate = messages.slice(0, messageIndex + 1)
    
    // Add userId to seenBy for each message
    for (const msg of messagesToUpdate) {
      if (!msg.seenBy.includes(userId)) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { seenBy: { push: userId } },
        })
      }
    }
    
    // Reset unread count
    await prisma.unreadCount.upsert({
      where: { userId_roomId: { userId, roomId } },
      create: { userId, roomId, count: 0 },
      update: { count: 0 },
    })
    
    res.json({ success: true, seenMessageIds: messagesToUpdate.map(m => m.id) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get unread count for room
router.get('/:roomId/unread', async (req, res) => {
  const { roomId } = req.params
  const userId = req.user.id
  
  try {
    const unread = await prisma.unreadCount.findUnique({
      where: { userId_roomId: { userId, roomId } },
    })
    
    res.json({ unreadCount: unread?.count || 0 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Step 5: Build & Test

```bash
# Frontend
cd frontend
npm run build

# Backend (if schema changed)
cd backend
npm run dev

# Check for TypeScript errors
npm run type-check
```

---

## Socket.io Events Reference

| Event | From | To | Purpose |
|-------|------|----|---------| 
| `message:send` | Client | Server | User sends a message |
| `message:delivered` | Server | Sender | Message saved to DB |
| `message:new` | Server | Room | New message available |
| `message:seen` | Server | Room | User marked message as read |
| `message:markSeen` | Client | Server | Send read receipt |
| `room:join` | Client | Server | User enters room |
| `room:leave` | Client | Server | User leaves room |
| `room:unreadCountUpdated` | Server | User | Unread count changed |

---

## Testing Checklist

- [ ] Send message → shows ⏳ then ✓
- [ ] Another user reads → shows ✓✓ + "Seen by username"
- [ ] Unread badge appears when away
- [ ] Badge disappears when viewing room
- [ ] "Seen by X users" displays correctly
- [ ] Scroll detection sends seen event
- [ ] Jump button works
- [ ] No console errors
- [ ] Build succeeds
- [ ] Socket events fire in Network tab

---

## Troubleshooting

**Messages not showing status:**
- Check: `messageStatuses` map is populated
- Check: `message:delivered` socket event firing
- Check: MessageBubbleWithStatus receiving status prop

**Unread count not updating:**
- Check: `room:unreadCountUpdated` socket event firing
- Check: `unreadCounts` map is populated
- Check: Backend sending event with correct roomId

**Intersection Observer not firing:**
- Check: Scroll container has correct height (`flex-1 min-h-0 overflow-y-auto`)
- Check: Messages have visible content
- Check: No console errors

**Socket connection issues:**
- Check: Socket.io is running on backend
- Check: Frontend .env has correct SOCKET_URL
- Check: Browser Network tab shows WebSocket connection

---

## File Reference

| File | Location | Purpose |
|------|----------|---------|
| Type Definitions | `frontend/src/types/chat-status.ts` | TypeScript interfaces |
| Hook | `frontend/src/hooks/useChatStatus.ts` | State + socket management |
| Message Display | `frontend/src/components/chat/MessageBubbleWithStatus.tsx` | Status indicators |
| Room List | `frontend/src/components/chat/RoomListItemWithUnread.tsx` | Unread badges |
| Conversation | `frontend/src/components/chat/ChatConversationWithStatus.tsx` | Seen receipts |
| Example | `frontend/src/pages/ChatWithStatusExample.jsx` | Complete reference |
| Socket Handlers | `backend/src/socket-handlers-example.js` | Backend logic |
| Schema | `backend/prisma/schema-updates.example.md` | DB schema |

---

## Next Steps

1. ✅ Review all 6 files created
2. 📋 Update Chat.jsx with new imports
3. 🔗 Integrate Socket.io events into backend socket.js
4. 💾 Update Prisma schema
5. 🌐 Create backend API endpoints
6. ✔️ Build and test

**Questions?** Check `ChatWithStatusExample.jsx` for working implementation reference!
