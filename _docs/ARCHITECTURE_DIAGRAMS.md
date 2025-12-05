# Message Management System - Visual Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        KVC CHAT APPLICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              FRONTEND (React/Vite)                      │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                         │     │
│  │  ChatConversation.tsx                                  │     │
│  │  ├── PinnedSection.jsx ────┐                          │     │
│  │  ├── Message List          │                          │     │
│  │  │   └── ChatMessageItem   │                          │     │
│  │  │       ├── ReplyPreview  │ Shows pinned msgs        │     │
│  │  │       ├── MessagePopupMenu                         │     │
│  │  │       │   ├── Reply     │                          │     │
│  │  │       │   ├── Edit      │                          │     │
│  │  │       │   ├── Delete    │                          │     │
│  │  │       │   ├── Pin       │                          │     │
│  │  │       │   └── Copy      │                          │     │
│  │  │       └── EditMessageInput                         │     │
│  │  │                                                    │     │
│  │  └── ReplyInput (shows context when replying)        │     │
│  │                                                       │     │
│  └───────────────────┬──────────────────────────────────┘     │
│                      │ API Calls                               │
│                      │ Socket Events                           │
│                      ▼                                         │
│  ┌────────────────────────────────────────────────────────┐     │
│  │          FRONTEND SERVICES (chat.js)                    │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                         │     │
│  │  deleteMessageEnhanced()    ─────────────┐            │     │
│  │  editMessageEnhanced()      ─────────────┤            │     │
│  │  replyToMessage()           ─────────────├──→ REST    │     │
│  │  pinMessage()               ─────────────┤            │     │
│  │  unpinMessage()             ─────────────┤            │     │
│  │  getPinnedMessages()        ─────────────┘            │     │
│  │                                                         │     │
│  └───────────────────┬──────────────────────────────────┘     │
│                      │ HTTP Requests (JSON)                     │
│                      │ (Application/JSON)                       │
│                      ▼                                         │
└─────────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │  HTTP/REST API             │
        │  (Port 3000)               │
        │                            │
        ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │              Routes (chat.js)                         │        │
│  │  DELETE   /rooms/:roomId/messages/:messageId         │        │
│  │  PATCH    /rooms/:roomId/messages/:messageId         │        │
│  │  POST     /rooms/:roomId/messages/:messageId/reply   │        │
│  │  POST     /rooms/:roomId/messages/:messageId/pin     │        │
│  │  DELETE   /rooms/:roomId/messages/:messageId/pin     │        │
│  │  GET      /rooms/:roomId/pins                        │        │
│  └──────────────┬───────────────────────────────────────┘        │
│                 │ Route handlers                                  │
│                 ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐        │
│  │        Controllers (chat.js)                          │        │
│  │  deleteMessageEnhanced()                             │        │
│  │  editMessageEnhanced()                               │        │
│  │  replyToMessage()                                    │        │
│  │  pinMessage()                                        │        │
│  │  unpinMessage()                                      │        │
│  │  getPinnedMessages()                                 │        │
│  └──────────────┬───────────────────────────────────────┘        │
│                 │ Business logic                                  │
│                 ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐        │
│  │        Services                                       │        │
│  │                                                      │        │
│  │  messageService.js                                  │        │
│  │  ├── deleteMessageForUser()                         │        │
│  │  ├── deleteMessageForEveryone()                     │        │
│  │  ├── editMessage()                                  │        │
│  │  ├── replyMessage()                                 │        │
│  │  ├── getMessage()                                   │        │
│  │  ├── getRoomMessages()                              │        │
│  │  └── getMessageHistory()                            │        │
│  │                                                      │        │
│  │  pinnedMessageService.js                            │        │
│  │  ├── pinMessage()                                   │        │
│  │  ├── unpinMessage()                                 │        │
│  │  ├── getPinnedMessages()                            │        │
│  │  ├── isPinned()                                     │        │
│  │  └── getPinnedMessageCount()                        │        │
│  │                                                      │        │
│  └──────────────┬───────────────────────────────────────┘        │
│                 │ Database operations                            │
│                 │ Prisma ORM                                     │
│                 ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐        │
│  │          Database (PostgreSQL)                        │        │
│  │                                                      │        │
│  │  ┌──────────────────────────────────┐              │        │
│  │  │ Message Table                    │              │        │
│  │  │ ├─ id                            │              │        │
│  │  │ ├─ content                       │              │        │
│  │  │ ├─ authorId (FK)                 │              │        │
│  │  │ ├─ roomId (FK)                   │              │        │
│  │  │ ├─ replyToId (FK) ──────┐        │              │        │
│  │  │ ├─ deletedForEveryone   │        │              │        │
│  │  │ ├─ editedAt             │        │              │        │
│  │  │ └─ createdAt            │        │              │        │
│  │  └──────────────────────────────────┘              │        │
│  │                                                      │        │
│  │  ┌──────────────────────────────────┐              │        │
│  │  │ DeletedMessagePerUser Table      │              │        │
│  │  │ ├─ id                            │              │        │
│  │  │ ├─ messageId (FK) ──────┐        │              │        │
│  │  │ ├─ userId (FK)          │        │              │        │
│  │  │ └─ deletedAt            │        │              │        │
│  │  │ (Unique: messageId+userId)       │              │        │
│  │  └──────────────────────────────────┘              │        │
│  │                                                      │        │
│  │  ┌──────────────────────────────────┐              │        │
│  │  │ PinnedMessage Table              │              │        │
│  │  │ ├─ id                            │              │        │
│  │  │ ├─ messageId (FK) ───────┐       │              │        │
│  │  │ ├─ roomId (FK)     ├──────┼──────┤◄─ Relations  │        │
│  │  │ ├─ pinnedById (FK) │      │      │              │        │
│  │  │ └─ pinnedAt        │      │      │              │        │
│  │  │ (Unique: messageId+roomId) │      │              │        │
│  │  │ (Index: roomId, pinnedAt)  │      │              │        │
│  │  └──────────────────────────────────┘              │        │
│  │                                                      │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                   │
│  Socket.io Events Emitted:                                      │
│  ├── messageDeletedForUser                                       │
│  ├── messageDeletedForEveryone                                  │
│  ├── messageEdited                                              │
│  ├── messageReplied                                             │
│  ├── messagePinned                                              │
│  └── messageUnpinned                                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                      ▲
        ┌─────────────┴─────────────┐
        │ Socket.io                  │
        │ (Real-time events)         │
        │ (WebSocket)                │
        │                            │
        ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND Socket Listeners                      │
│                                                                   │
│  socket.on('messageDeletedForUser', ...)                         │
│  socket.on('messageDeletedForEveryone', ...)                     │
│  socket.on('messageEdited', ...)                                 │
│  socket.on('messageReplied', ...)                                │
│  socket.on('messagePinned', ...)                                 │
│  socket.on('messageUnpinned', ...)                               │
│                                                                   │
│  ↓ Updates local state ↓                                         │
│                                                                   │
│  Re-render ChatConversation with updated messages                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Delete Message Flow

```
User Interface
    │
    ├─ Hover over message
    │
    └─ Click "..." button
            │
            ▼
        MessagePopupMenu appears
            │
            ├─ Click "ลบ" (Delete)
            │
            ▼
        Show Confirmation
            │
            ├─ "ลบเฉพาะสำหรับฉัน" (Delete for me)
            │       │
            │       └─ mode = 'me'
            │           │
            │           ▼
            │       Frontend: ChatAPI.deleteMessageEnhanced(
            │                   roomId, messageId, 'me'
            │               )
            │           │
            │           ▼
            │       Backend: DELETE /api/chat/rooms/:roomId/messages/:messageId?mode=me
            │           │
            │           ▼
            │       Controller: deleteMessageEnhanced()
            │           │
            │           ▼
            │       Service: deleteMessageForUser()
            │           │
            │           ├─ Check user is author
            │           │
            │           └─ Create DeletedMessagePerUser record
            │               INSERT INTO DeletedMessagePerUser
            │               (messageId, userId, deletedAt)
            │           │
            │           ▼
            │       Socket: io.to(`user_${userId}`).emit('messageDeletedForUser')
            │           │
            │           ▼
            │       Frontend receives event
            │           │
            │           └─ Remove message from display (for this user only)
            │
            ├─ "ลบสำหรับทั้งหมด" (Delete for everyone)
            │       │
            │       └─ mode = 'everyone'
            │           │
            │           ▼
            │       Frontend: ChatAPI.deleteMessageEnhanced(
            │                   roomId, messageId, 'everyone'
            │               )
            │           │
            │           ▼
            │       Backend: DELETE /api/chat/rooms/:roomId/messages/:messageId?mode=everyone
            │           │
            │           ▼
            │       Controller: deleteMessageEnhanced()
            │           │
            │           ▼
            │       Service: deleteMessageForEveryone()
            │           │
            │           ├─ Check user is author or admin
            │           │
            │           └─ UPDATE Message SET deletedForEveryone = true
            │           │
            │           ▼
            │       Socket: io.to(roomId).emit('messageDeletedForEveryone')
            │           │
            │           ▼
            │       All clients receive event
            │           │
            │           └─ Remove message from all displays
            │
            └─ "ยกเลิก" (Cancel)
                    │
                    └─ Close menu, no action
```

---

## Reply Message Flow

```
User Interface
    │
    ├─ Hover over message
    │
    └─ Click "..." button
            │
            ▼
        MessagePopupMenu appears
            │
            ├─ Click "ตอบกลับ" (Reply)
            │
            ▼
        ReplyInput appears above message input
        Showing original message context:
        │
        ├─ Original author name
        ├─ Message preview text
        └─ Blue border indicator
            │
            ▼
        User types reply in input field
            │
            ▼
        User clicks send or presses Ctrl+Enter
            │
            ▼
        Frontend: ChatAPI.replyToMessage(
            roomId, messageId, content, files?
        )
            │
            ▼
        Backend: POST /api/chat/rooms/:roomId/messages/:messageId/reply
            │
            ▼
        Controller: replyToMessage()
            │
            ├─ Verify original message exists
            ├─ Verify same room
            ├─ Process file if attached
            │
            └─ Service: replyMessage()
                │
                ├─ Create new message with replyToId = original.id
                │
                └─ INSERT INTO Message
                    (content, authorId, roomId, replyToId, createdAt)
                    │
                    ▼
                Include replyTo data in response
                │
                ▼
            Socket: io.to(roomId).emit('messageReplied', reply)
                │
                ▼
            All clients receive event
                │
                ├─ Add reply to messages list
                │
                └─ Render with ReplyPreview showing:
                    ├─ Original author
                    ├─ Original message preview
                    └─ Blue border
```

---

## Pin Message Flow

```
Admin/Author Interface
    │
    ├─ Hover over message
    │
    └─ Click "..." button
            │
            ▼
        MessagePopupMenu appears
            │
            ├─ Click "ปักหมุด" (Pin)
            │    [Only visible if user is admin/author]
            │
            ▼
        Frontend: ChatAPI.pinMessage(roomId, messageId)
            │
            ▼
        Backend: POST /api/chat/rooms/:roomId/messages/:messageId/pin
            │
            ▼
        Controller: pinMessage()
            │
            ├─ Check user is room admin
            │
            ├─ Verify message exists and in room
            │
            └─ Service: pinMessage()
                │
                ├─ Check if already pinned (duplicate prevention)
                │
                └─ INSERT INTO PinnedMessage
                    (messageId, roomId, pinnedById, pinnedAt)
                    │
                    ▼
                Include full message data
                │
                ▼
            Socket: io.to(roomId).emit('messagePinned', pinnedMessage)
                │
                ▼
            All clients receive event
                │
                ├─ Add to PinnedSection list
                │
                ├─ Show pin indicator on message
                │  (small pin icon in top-right)
                │
                └─ PinnedSection automatically updates
                    (if expanded)

Later, PinnedSection shows:
    │
    ├─ Header: "ข้อความที่ปักหมุด (N)" with expand/collapse
    │
    └─ List of pinned messages:
        ├─ Author avatar + name
        ├─ Message preview (100 chars)
        ├─ Timestamp
        ├─ File indicator if has attachment
        └─ Unpin button (admin only)
            │
            ├─ Click to unpin
            │
            └─ FrontendAPI.unpinMessage(roomId, messageId)
                    │
                    ▼
                Backend: DELETE /api/chat/rooms/:roomId/messages/:messageId/pin
                    │
                    ▼
                Controller: unpinMessage()
                    │
                    ├─ Check user is room admin
                    │
                    └─ Service: unpinMessage()
                        │
                        └─ DELETE FROM PinnedMessage
                            WHERE messageId=? AND roomId=?
                            │
                            ▼
                        Socket: io.to(roomId).emit('messageUnpinned')
                            │
                            ▼
                        All clients receive event
                            │
                            ├─ Remove from PinnedSection
                            │
                            └─ Remove pin indicator from message
```

---

## State Management in Chat.jsx

```
Chat Component State:
│
├─ messages[] ←─ Updated by socket events and API responses
│  │           ├─ messageEdited event
│  │           ├─ messageReplied event
│  │           ├─ messageDeletedForEveryone event
│  │           └─ Initial load via listMessages()
│  │
├─ replyingToMessage: Message | null
│  │           ├─ Set when user clicks "Reply"
│  │           ├─ Used to show ReplyInput component
│  │           ├─ Passed to message input component
│  │           └─ Cleared after sending reply
│  │
├─ editingMessageId: string | null
│  │           ├─ Set when user clicks "Edit"
│  │           ├─ Used to show EditMessageInput instead of text
│  │           └─ Cleared after save or cancel
│  │
└─ pinnedMessages[] ←─ Updated by socket events
                ├─ messagePinned event
                ├─ messageUnpinned event
                └─ Initial load via getPinnedMessages()

Handlers:
│
├─ handleDeleteMessage(roomId, messageId, mode)
│  │           └─ Calls API, waits for socket event to update UI
│  │
├─ handleEditMessage(roomId, messageId, newContent)
│  │           ├─ Calls API
│  │           ├─ Updates local state immediately
│  │           └─ Clears editingMessageId
│  │
├─ handleReplyMessage(message)
│  │           ├─ Sets replyingToMessage = message
│  │           └─ Shows ReplyInput
│  │
├─ handlePinMessage(roomId, messageId)
│  │           └─ Calls API, waits for socket event to update pinned list
│  │
└─ handleUnpinMessage(roomId, messageId)
                └─ Calls API, waits for socket event to remove from list
```

---

## Authorization Matrix

```
                    │ Author │ Admin │ Other User │
────────────────────┼────────┼───────┼────────────┤
Delete for me       │  ✅    │  ✅   │     ✅     │
Delete for everyone │  ✅    │  ✅   │     ❌     │
Edit message        │  ✅    │  ❌   │     ❌     │
Reply message       │  ✅    │  ✅   │     ✅     │
Pin message         │  ❌    │  ✅   │     ❌     │
Unpin message       │  ❌    │  ✅   │     ❌     │
View own deletes    │  ✅    │  ✅   │     ✅     │
View deleted-me     │  ✅    │  ✅   │     ❌     │
View deleted-all    │  ❌    │  ❌   │     ❌     │
```

---

## Database Relationships

```
User (1) ──── (M) Message
  │             │
  │             ├─ (1) ──── (M) DeletedMessagePerUser
  │             │
  │             ├─ (1) ──── (M) PinnedMessage
  │             │                   │
  │             │                   └─ (1) ──── (M) Room
  │             │
  │             ├─ (0..1) ──── (1) ChatFile
  │             │
  │             └─ (0..1) ──── (1) Message (replyTo)
  │
  ├─ (M) DeletedMessagePerUser
  │
  └─ (M) PinnedMessage (pinnedBy)
           │
           ├─ FK: messageId ──────→ Message.id
           ├─ FK: roomId ──────────→ Room.id
           └─ FK: pinnedById ──────→ User.id

Room (1) ──── (M) Message
  │
  ├─ (M) PinnedMessage
  │
  └─ (M) RoomMember
```

---

This visual guide complements the technical documentation and helps visualize how all components work together in the message management system.

