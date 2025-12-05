# Message Status System - Architecture & Flow Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KVC CHAT APPLICATION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      FRONTEND (React)                            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  Chat.jsx                                                         │   │
│  │  ├─ useChatStatus() ◄─────────┐                                 │   │
│  │  │  ├─ messageStatuses[]       │                                │   │
│  │  │  ├─ unreadCounts[]          │ Socket.io listeners           │   │
│  │  │  └─ markMessagesAsSeen()    │                                │   │
│  │  │                             │                                │   │
│  │  ├─ MessageBubbleWithStatus ◄──┘                               │   │
│  │  │  ├─ Shows ⏳ (pending)                                       │   │
│  │  │  ├─ Shows ✓ (sent/delivered)                                │   │
│  │  │  ├─ Shows ✓✓ (seen) + "Seen by X"                          │   │
│  │  │  └─ Action menu (Reply, Edit, Delete, Copy)                │   │
│  │  │                                                              │   │
│  │  ├─ RoomListItemWithUnread                                      │   │
│  │  │  ├─ Red badge with unread count                             │   │
│  │  │  ├─ Bold name if unread > 0                                 │   │
│  │  │  ├─ Left border indicator                                   │   │
│  │  │  └─ Last message + timestamp                                │   │
│  │  │                                                              │   │
│  │  └─ ChatConversationWithStatus                                  │   │
│  │     ├─ Intersection Observer (detect visible messages)         │   │
│  │     ├─ Auto-scroll to bottom on new message                   │   │
│  │     ├─ Jump button (⬇️) when scrolled away                     │   │
│  │     └─ Debounced markMessagesAsSeen(500ms)                    │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         ▲                           ▼                                     │
│         │                    Socket.io                                    │
│         │                   WebSocket                                     │
│         │                   Connection                                    │
│         │                           │                                     │
│  ┌──────┴───────────────────────────┴──────────────────────────────┐    │
│  │                                                                   │    │
│  │  Events (Frontend emits):                 Events (Backend sends): │    │
│  │  ├─ message:send                          ├─ message:delivered   │    │
│  │  ├─ message:markSeen                      ├─ message:new         │    │
│  │  ├─ room:join                             ├─ message:seen        │    │
│  │  └─ room:leave                            ├─ room:unreadCountUpdated│    │
│  │                                           └─ error                │    │
│  │                                                                   │    │
│  └───────────────────────────┬──────────────────────────────────────┘    │
│                              │                                             │
└──────────────────────────────┼─────────────────────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  Backend    │
                        │ Express.js  │
                        │ Socket.io   │
                        └──────┬──────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
         ┌───────▼────────┐        ┌────────▼─────────┐
         │  PostgreSQL    │        │  Message Queue   │
         │  Database      │        │  (Optional)      │
         │                │        │                  │
         │ ├─ Message     │        │  Real-time       │
         │ │  (status,    │        │  broadcast       │
         │ │   seenBy)    │        └──────────────────┘
         │ │              │
         │ ├─ UnreadCount │
         │ │  (userId,    │
         │ │   roomId)    │
         │ │              │
         │ ├─ Room        │
         │ │  (members)   │
         │ │              │
         │ └─ User        │
         │    (auth)      │
         └────────────────┘
```

---

## 2. Message Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MESSAGE LIFECYCLE - USER A SENDS                     │
└─────────────────────────────────────────────────────────────────────────┘

TIME │ USER A (SENDER)        │ NETWORK                │ USER B (RECEIVER)
─────┼────────────────────────┼────────────────────────┼──────────────────
  0  │ Types message text     │                        │
     │                        │                        │
  1  │ Clicks SEND button     │                        │ (Not affected yet)
     │                        │                        │
  2  │ ✅ Message shows as    │ Emit:                 │
     │    ⏳ PENDING          │ message:send          │
     │ (Local optimistic)     │ {roomId, content}     │
     │                        │                        │
  3  │ Waiting for server...  │ ───────────────────→  │
     │                        │                        │ (Receiving...)
     │                        │    BACKEND PROCESS:    │
     │                        │    ├─ Save to DB      │
     │                        │    ├─ status='sent'   │
     │                        │    ├─ Add to messages │
     │                        │    └─ Generate ID     │
     │                        │                        │
  4  │ ✅ Message shows as    │ Emit:                 │
     │    ✓ SENT              │ message:delivered    │ 
     │ (From server response) │ {messageId}          │
     │ messageStatuses[id]='sent' │ ─────────────→  │
     │ (useChatStatus hook)   │                        │
     │                        │ Emit:                 │
     │                        │ message:new          │ ✅ Message appears!
     │                        │ {full message}       │    status='delivered'
     │                        │ ───────────────────→ │
     │                        │                        │ unreadCount++
     │                        │                        │ Red badge! 🔴
     │                        │                        │
  5  │ (Ready to send again)  │                        │ Scrolls into view
     │                        │                        │ (Intersection Observer)
     │                        │                        │
  6  │                        │                        │ ✅ Message VISIBLE
     │                        │                        │    (in viewport)
     │                        │                        │
  7  │                        │                        │ 500ms delay (debounce)
     │                        │                        │ then:
     │                        │ Emit:                 │
     │                        │ message:markSeen     │ Emit:
     │                        │ {messageId}          │ message:markSeen
     │                        │ ←─────────────────   │ (Debounced)
     │                        │                        │
  8  │                        │    BACKEND PROCESS:    │
     │                        │    ├─ Add userId to  │
     │                        │    │  seenBy[]      │
     │                        │    ├─ Reset unread  │
     │                        │    └─ Get seenBy    │
     │                        │       count         │
     │                        │                        │
  9  │ ✅ Message shows:      │ Emit:                 │
     │    ✓✓ SEEN             │ message:seen        │ ✅ Badge disappears! 🟢
     │ (Blue double tick)     │ {seenByUserId}      │    unreadCount=0
     │ "Seen by User B"       │ ─────────────────→  │    Unread badge gone
     │                        │                        │
     │                        │ Emit:                 │
     │                        │ room:unreadCountUpdated │
     │                        │ {roomId, count:0}      │
     │                        │ ─────────────────────→ │
```

---

## 3. Component Hierarchy & Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Chat.jsx (Main Page)                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  const { messageStatuses, unreadCounts, markMessagesAsSeen } =      │
│    useChatStatus(selectedRoomId)  ◄── CUSTOM HOOK SETUP           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ useChatStatus Hook (src/hooks/useChatStatus.ts)            │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │ 🔌 Socket Listeners:                                        │    │
│  │    ├─ on('message:delivered')                              │    │
│  │    │  └─ messageStatuses[id] = 'sent'                     │    │
│  │    │                                                         │    │
│  │    ├─ on('message:seen')                                    │    │
│  │    │  └─ messageStatuses[id] = 'seen'                     │    │
│  │    │     Update seenBy count                                │    │
│  │    │                                                         │    │
│  │    └─ on('room:unreadCountUpdated')                         │    │
│  │       └─ unreadCounts[roomId] = count                      │    │
│  │                                                              │    │
│  │ 👁️ Intersection Observer:                                  │    │
│  │    Detects visible messages → Calls markMessagesAsSeen()  │    │
│  │    ├─ Debounced 500ms                                      │    │
│  │    ├─ Emits message:markSeen                              │    │
│  │    └─ Sends read receipt to server                         │    │
│  │                                                              │    │
│  │ Returns:                                                     │    │
│  │ ├─ messageStatuses: Map<messageId, status>                │    │
│  │ ├─ unreadCounts: Map<roomId, number>                      │    │
│  │ ├─ markMessagesAsSeen: (messageId) => void                │    │
│  │ └─ isLoading: boolean                                      │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                         ▼ (Data passed down)                         │
│                                                                       │
│  ┌───────────────────────────┬──────────────────────────────────┐   │
│  │                           │                                  │   │
│  ▼                           ▼                                  ▼   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────┐│
│  │ ChatSidebar.jsx      │  │ ChatWindow.jsx       │  │ Additional  ││
│  ├──────────────────────┤  ├──────────────────────┤  │ Components  ││
│  │                      │  │                      │  └─────────────┘│
│  │ Maps rooms array:    │  │ Contains:            │                  │
│  │ {                    │  │ ├─ Header (room     │                  │
│  │   rooms.map(room =>  │  │ │   info)           │                  │
│  │     <RoomListItem... │  │ ├─ ChatConversation │                  │
│  │       unreadCount={  │  │ │   (messages)      │                  │
│  │   unreadCounts[      │  │ └─ MessageInput     │                  │
│  │   room.id] || 0}     │  │                      │                  │
│  │   />                 │  │                      │                  │
│  │ })                   │  │                      │                  │
│  │                      │  │                      │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│           ▼                           ▼                               │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐     │
│  │ RoomListItemWithUnread│  │ ChatConversationWithStatus.tsx   │     │
│  ├──────────────────────┤  ├──────────────────────────────────┤     │
│  │                      │  │                                  │     │
│  │ • Room name (bold    │  │ • Scroll container               │     │
│  │   if unread)         │  │ • Intersection Observer          │     │
│  │ • Red badge: {count}│  │ • Auto-scroll to bottom         │     │
│  │ • Left border        │  │ • Jump button (⬇️)              │     │
│  │ • Last message       │  │ • Maps messages:                │     │
│  │ • Timestamp          │  │   {messages.map(msg =>          │     │
│  │                      │  │     <MessageBubbleWithStatus    │     │
│  │ Props:               │  │       status={messageStatuses   │     │
│  │ ├─ room              │  │       [msg.id]}                │     │
│  │ ├─ unreadCount       │  │       onMarkSeen={...}         │     │
│  │ ├─ isSelected        │  │     />                          │     │
│  │ └─ onClick           │  │   )}                            │     │
│  │                      │  │                                  │     │
│  └──────────────────────┘  └──────────────────────────────────┘     │
│                                       ▼                               │
│                            ┌──────────────────────┐                  │
│                            │MessageBubbleWithStatus│                 │
│                            ├──────────────────────┤                  │
│                            │                      │                  │
│                            │ Shows:               │                  │
│                            │ ├─ Message content   │                  │
│                            │ ├─ Status icon:      │                  │
│                            │ │  ⏳ pending        │                  │
│                            │ │  ✓ sent/delivered │                  │
│                            │ │  ✓✓ seen (blue)   │                  │
│                            │ ├─ Timestamp        │                  │
│                            │ ├─ "Seen by X users"│                  │
│                            │ └─ Actions menu:    │                  │
│                            │    ├─ Reply         │                  │
│                            │    ├─ Edit          │                  │
│                            │    ├─ Delete        │                  │
│                            │    └─ Copy          │                  │
│                            │                      │                  │
│                            │ Props:               │                  │
│                            │ ├─ message           │                  │
│                            │ ├─ status            │                  │
│                            │ └─ onMarkSeen        │                  │
│                            │                      │                  │
│                            └──────────────────────┘                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Socket.io Event Flow Diagram

```
FRONTEND                        WEBSOCKET                       BACKEND
──────────────────────────────────────────────────────────────────────────

User Action: Type & Send Message
│
├─ Optimistic Update:
│  messageStatuses[newId] = 'pending' ⏳
│  Show message immediately (local)
│
└─ Emit: message:send
   {roomId, content, replyToId}
   ─────────────────────────────→  Receive: message:send
                                    │
                                    ├─ Validate
                                    ├─ Save to DB (Message model)
                                    │  └─ status = 'sent'
                                    │  └─ id = generated
                                    ├─ Get seenBy count
                                    └─ Emit: message:delivered
                                       {messageId, timestamp}

   Receive: message:delivered  ←─────────────────────────────
   │
   ├─ Update messageStatuses[id] = 'sent' ✓
   ├─ Update useChatStatus hook state
   └─ Re-render with new status
                                    AND/SIMULTANEOUSLY:
                                    Emit: message:new (to room)
                                    {id, roomId, senderId,
                                     content, status, seenBy}
                                    ───────────────────────→

   Receive: message:new (other users only)
   │
   ├─ Add to messages array
   ├─ Update unreadCounts[roomId]++
   ├─ Show red badge 🔴 if away from room
   ├─ (Don't emit unreadCountUpdated, just local state)
   └─ Re-render message list

User Action: Scroll & View Message (Intersection Observer)
│
├─ detectVisible messages in viewport
├─ Wait 500ms (debounce)
└─ Emit: message:markSeen
   {roomId, messageId}
   ─────────────────────────────→  Receive: message:markSeen
                                    │
                                    ├─ Get all messages ≤ this ID
                                    ├─ Add userId to seenBy[]
                                    ├─ Update all in DB
                                    ├─ Reset unreadCount = 0
                                    │
                                    ├─ Emit: message:seen (to room)
                                    │ {messageId, seenByUserId}
                                    │
                                    └─ Emit: room:unreadCountUpdated
                                       {roomId, unreadCount: 0}

   Receive: message:seen  ←────────────────────────────────
   │
   ├─ Update messageStatuses[id] = 'seen'
   ├─ Update seenBy count
   ├─ Show ✓✓ (blue double tick)
   ├─ Show "Seen by [User A]"
   └─ Re-render

   Receive: room:unreadCountUpdated  ←──────────────────────
   │
   ├─ Update unreadCounts[roomId] = 0
   ├─ Remove red badge 🔴
   └─ Re-render room list
```

---

## 5. Status Indicator Progression

```
┌────────────────────────────────────────────────────────────────────┐
│                   MESSAGE STATUS PROGRESSION                        │
└────────────────────────────────────────────────────────────────────┘

Step 1: Pending (User just sent)
┌─────────────────────────────┐
│ Hi there! ⏳ Pending       │ ← Grey icon, small timestamp
│                             │   (Waiting for server ack)
└─────────────────────────────┘

Step 2: Sent (Server received & saved)
┌─────────────────────────────┐
│ Hi there! ✓ Sent           │ ← Grey checkmark, timestamp
│                             │   (Saved to DB)
└─────────────────────────────┘

Step 3: Delivered (Other users can see)
┌─────────────────────────────┐
│ Hi there! ✓ Delivered      │ ← Grey checkmark
│                             │   (In other users' chats)
└─────────────────────────────┘

Step 4: Seen (Other user scrolled into view)
┌─────────────────────────────────────────┐
│ Hi there! ✓✓ Seen                     │ ← Blue double checkmark ✓✓
│ Seen by User B, User C                │   (Read by 2 people)
│ 2:45 PM                               │   Show names/count
└─────────────────────────────────────────┘


COMPARISON: Own vs Others' Messages
─────────────────────────────────────────────

OWN MESSAGE (Right side, blue):
┌─────────────────────────────────┐
│ I just sent this! ✓✓ 2:45 PM  │ ← Show status & "Seen by X"
│ Seen by Teacher A               │   (Want to know who read it)
└─────────────────────────────────┘

OTHER'S MESSAGE (Left side, grey):
┌─────────────────────────────────┐
│ 2:44 PM Teacher A              │ ← Show sender name & time only
│ This is what they sent          │   (Don't show status for others'
│                                 │    messages in most chat apps)
└─────────────────────────────────┘


UNREAD BADGE (Room List):
─────────────────────────────

If Unread:
┌─────────────────────────────────┐
│ 🔴 │ Class Room              │ ← Red dot/badge on left
│    │ "Last message from..." │    Bold room name
│    │ 5 min ago              │    Shows unread indicator
└─────────────────────────────────┘

If Read:
┌─────────────────────────────────┐
│    │ Class Room              │ ← No badge or dot
│    │ "Last message from..." │    Normal text weight
│    │ 5 min ago              │    Grey/muted color
└─────────────────────────────────┘
```

---

## 6. Data Model Relationships

```
┌──────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                        │
└──────────────────────────────────────────────────────────┘

User Model
├─ id (PK)
├─ email
├─ username
└─ ... other fields

    ↓ (one-to-many)

Message Model (✅ UPDATED)
├─ id (PK)
├─ roomId (FK) ─→ Room
├─ senderId (FK) ─→ User
├─ content (String)
├─ status (String) ✅ NEW: 'pending'|'sent'|'delivered'|'seen'
├─ seenBy (String[]) ✅ NEW: ['userId1', 'userId2']
├─ replyToId (FK) ✅ NEW: Reference to another Message
├─ createdAt
└─ updatedAt

    ↓ (one-to-many)

Room Model
├─ id (PK)
├─ name (String)
├─ members (String[])
├─ messages (relation to Message) ✅ UPDATED
├─ unreadCounts (relation) ✅ NEW
└─ ... other fields

    ↑ (belongs-to)
    │
    
UnreadCount Model ✅ NEW
├─ id (PK)
├─ userId (FK) ─→ User
├─ roomId (FK) ─→ Room
├─ count (Int)
├─ lastReadMessageId (String) (Optional)
└─ @@unique([userId, roomId])
   └─ Ensures one unread record per user per room


Relationships:
───────────────
User ──(1:n)──→ Message (as sender)
User ──(1:n)──→ UnreadCount
Room ──(1:n)──→ Message
Room ──(1:n)──→ UnreadCount
Message ──(1:n)──→ Message (self-relation for replies)
```

---

## 7. State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│              useChatStatus Hook State Management             │
└─────────────────────────────────────────────────────────────┘

Initial State:
{
  messageStatuses: {},  // Map<messageId, MessageStatus>
  unreadCounts: {},     // Map<roomId, number>
}

                    │
                    ▼

Socket Event: message:delivered
├─ Triggered: Server saves message
├─ Data: { messageId, timestamp }
├─ Update: messageStatuses[messageId] = 'sent'
├─ UI: Message shows ✓ (one tick)
└─ State:
   {
     messageStatuses: {
       'msg-123': 'sent',  ← UPDATED
     }
   }

                    │
                    ▼

Socket Event: message:new
├─ Triggered: Broadcast to room
├─ Data: { id, content, status, seenBy }
├─ Update: Add to local messages array (if in room)
├─ Increment: unreadCounts[roomId]++
├─ UI: Red badge on room list
└─ State:
   {
     unreadCounts: {
       'room-456': 1,  ← INCREMENTED
     }
   }

                    │
                    ▼

Intersection Observer: Detects visible message
├─ Triggered: Message scrolls into viewport
├─ Wait: 500ms debounce
├─ Emit: message:markSeen to server
├─ UI: Nothing changes yet (waiting for server)
└─ State: No change yet

                    │
                    ▼

Socket Event: message:seen
├─ Triggered: Server processes markSeen
├─ Data: { messageId, seenByUserId }
├─ Update: messageStatuses[messageId] = 'seen'
├─ Add user to: internal seenBy tracking
├─ UI: Message shows ✓✓ (blue, two ticks)
└─ State:
   {
     messageStatuses: {
       'msg-123': 'seen',  ← UPDATED
     }
   }

                    │
                    ▼

Socket Event: room:unreadCountUpdated
├─ Triggered: Server resets unread after seeing
├─ Data: { roomId, unreadCount: 0 }
├─ Update: unreadCounts[roomId] = 0
├─ UI: Red badge disappears
└─ Final State:
   {
     messageStatuses: {
       'msg-123': 'seen',
     },
     unreadCounts: {
       'room-456': 0,  ← RESET
     }
   }
```

---

## 8. Component Props Cheat Sheet

```typescript
// MessageBubbleWithStatus Props
{
  message: {
    id: string
    content: string
    senderId: string
    createdAt: Date
    seenBy?: string[]
    replyToId?: string
  }
  status?: 'pending' | 'sent' | 'delivered' | 'seen'
  onMarkSeen?: () => void
  currentUserId: string
}

// RoomListItemWithUnread Props
{
  room: {
    id: string
    name: string
    lastMessage?: string
    lastMessageAt?: Date
  }
  unreadCount?: number
  isSelected?: boolean
  onClick?: () => void
}

// ChatConversationWithStatus Props
{
  roomId: string
  messages: Message[]
  messageStatuses: Record<string, MessageStatus>
  unreadCounts: Record<string, number>
  onMarkSeen?: (messageId: string) => void
}

// useChatStatus Hook Return
{
  messageStatuses: Record<string, MessageStatus>
  unreadCounts: Record<string, number>
  markMessagesAsSeen: (messageId: string) => void
  isLoading: boolean
}
```

---

## Quick Reference URLs

```
Frontend Components:
├─ chat-status.ts → TypeScript types
├─ useChatStatus.ts → State management hook
├─ MessageBubbleWithStatus.tsx → Message UI with status
├─ RoomListItemWithUnread.tsx → Room list with badge
├─ ChatConversationWithStatus.tsx → Scroll detection + seen receipts
└─ ChatWithStatusExample.jsx → Complete working example

Backend Example:
├─ socket-handlers-example.js → Socket.io event handlers
└─ schema-updates.example.md → Database schema changes

Documentation:
├─ IMPLEMENTATION_MESSAGE_STATUS.md → Detailed integration guide
└─ MESSAGE_STATUS_QUICK_START.md → 5-step quick start
```

Perfect! Your message status system is now fully documented and ready for integration! 🚀
