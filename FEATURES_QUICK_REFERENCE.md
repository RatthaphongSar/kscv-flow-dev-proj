# KVC Chat - Feature Quick Reference

## 5 Features Implemented ✅

### 1. Notes System
**Purpose**: Room-based notes created and managed by teachers
- **Create**: Button in chat header → "สร้างโน้ต" → Modal dialog
- **View**: "โน้ต" tab shows all room notes with preview
- **Edit/Delete**: Teachers only (in backend)
- **Endpoint**: `GET/POST/PUT/DELETE /rooms/:roomId/notes`

### 2. Files System  
**Purpose**: Share and manage files in rooms
- **Upload**: Metadata endpoint, assumes S3/storage backend
- **View**: "ไฟล์" tab lists files with downloader info
- **Download**: Click file or download button
- **Endpoint**: `GET/POST/DELETE /rooms/:roomId/files`

### 3. Image Messages
**Purpose**: Send images as messages with smart sizing
- **Upload**: Through message input (file button)
- **Display**: Auto-sizes based on orientation
  - Landscape: max 320px wide × 224px tall
  - Portrait: max 160px wide × 320px tall
- **Viewer**: Click to open full-screen modal
- **Type**: Message.type = "image" with file relation

### 4. Unread Counts
**Purpose**: Track and display unread messages per room
- **Badge**: Room list shows number of unread (violet badge)
- **Bold**: Room name becomes bold when unread exists
- **Indicator**: Message shows "อ่านแล้ว X/Y" when in group
- **Endpoint**: `GET /rooms/unread-summary`

### 5. Members Management
**Purpose**: Teacher manages who's in each room
- **Tab**: New "สมาชิก" tab shows all members
- **Search**: Find members by username or email
- **Add**: "เพิ่มสมาชิก" button opens modal with available users
- **Remove**: Delete button removes student (teacher-only)
- **Endpoints**:
  - `GET /rooms/:roomId/members` - list all
  - `GET /rooms/:roomId/members/available` - users to add
  - `POST /rooms/:roomId/members` - add member
  - `DELETE /rooms/:roomId/members/:userId` - remove

---

## Key Files to Know

### Backend Services (authentication & business logic)
```
backend/src/services/
├── chatNotes.service.ts       - Note CRUD
├── chatFiles.service.ts       - File management
├── chatReadReceipts.service.ts - Unread tracking
└── chatMembers.service.ts     - Member CRUD
```

### Backend Controllers (API endpoints)
```
backend/src/controllers/
└── chatExtended.controller.ts - All 5 controllers (15 endpoints)
```

### Frontend Hooks (data fetching)
```
frontend/src/hooks/
├── useRoomNotes.ts            - Note operations
├── useRoomFiles.ts            - File operations
├── useRoomMembers.ts          - Member operations
├── useUnreadCounts.ts         - Unread badges
└── useMessageReadReceipts.ts  - Read indicators
```

### Frontend Components (UI)
```
frontend/src/components/chat/
├── ChatNotesPanel.tsx         - Notes tab
├── ChatFilesPanel.tsx         - Files tab
├── MembersPanel.tsx           - Members tab
├── AddMemberModal.tsx         - Add member dialog
├── CreateNoteModal.tsx        - Create note dialog
├── MessageBubble.tsx          - Image + read receipts
├── ChatWindow.tsx             - Tab integration
└── ConversationList.tsx       - Unread badges
```

---

## Tabs in Chat Window

```
[แชท]  [ไฟล์]  [โน้ต]  [สมาชิก]
```

| Tab | Component | Features |
|-----|-----------|----------|
| แชท | ChatConversation | Messages, replies, typing |
| ไฟล์ | ChatFilesPanel | List files, download |
| โน้ต | ChatNotesPanel | List notes (teacher: create/edit) |
| สมาชิก | MembersPanel | List members (teacher: add/remove) |

---

## API Endpoints Reference

### Notes
- `GET /rooms/:roomId/notes` - List all notes
- `POST /rooms/:roomId/notes` - Create note (auth)
- `PUT /rooms/:roomId/notes/:noteId` - Update note (auth)
- `DELETE /rooms/:roomId/notes/:noteId` - Delete note (auth)

### Files
- `GET /rooms/:roomId/files` - List files
- `POST /rooms/:roomId/files` - Upload metadata (auth)
- `DELETE /rooms/:roomId/files/:fileId` - Delete file (auth)

### Members
- `GET /rooms/:roomId/members` - List members
- `GET /rooms/:roomId/members/available` - Available users
- `POST /rooms/:roomId/members` - Add member (auth, teacher)
- `DELETE /rooms/:roomId/members/:userId` - Remove member (auth, teacher)

### Read Receipts
- `POST /rooms/:roomId/messages/mark-read` - Mark read (auth)
- `GET /rooms/:roomId/read-receipts/:messageId` - Single receipt
- `GET /rooms/:roomId/read-receipts?messageId=...` - Batch receipts
- `GET /rooms/:roomId/message-readers/:messageId` - Who read
- `GET /rooms/unread-summary` - All unread counts (auth)

---

## Message Type Support

```typescript
// Text message
{ type: 'text', content: 'Hello' }

// Image message
{ 
  type: 'image',
  file: { 
    id, url, fileName, 
    width, height,  // for orientation detection
    mimeType 
  }
}

// File message
{
  type: 'file',
  file: { 
    id, url, fileName, sizeBytes, mimeType 
  }
}
```

---

## Database Schema Changes

### New Models
```prisma
model ChatNote {
  id String @id @default(cuid())
  title String
  content String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  roomId String
  author User @relation(fields: [authorId], references: [id])
  authorId String
  @@index([roomId, updatedAt])
}

model ChatFile {
  id String @id @default(cuid())
  fileName String
  mimeType String
  sizeBytes Int
  url String
  width Int?
  height Int?
  createdAt DateTime @default(now())
  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  roomId String
  uploader User @relation(fields: [uploaderId], references: [id])
  uploaderId String
  messageAttachment Message?
  @@index([roomId, createdAt])
}

model MessageRead {
  id String @id @default(cuid())
  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  readAt DateTime @default(now())
  @@unique([messageId, userId])
}
```

### Updated Models
```prisma
// Message
- Added: type String @default("text")
- Added: file ChatFile? @relation(fields: [fileId], references: [id])
- Added: fileId String?
- Added: readReceipts MessageRead[]

// ChatRoom
- Added: notes ChatNote[]
- Added: files ChatFile[]

// User
- Added: chatNotes ChatNote[]
- Added: uploadedFiles ChatFile[] @relation("FileUploader")
- Added: messageReads MessageRead[]
```

---

## Common Usage Examples

### Create a Note (Frontend)
```typescript
const { createNote } = useRoomNotes(roomId)
await createNote('Title', 'Content')
```

### Fetch Unread Count
```typescript
const { getUnreadCount } = useUnreadCounts()
const count = getUnreadCount(roomId)
```

### Mark Messages as Read
```typescript
const markRoomAsRead = async (roomId, userId, lastMessageId) => {
  await fetch(`/api/rooms/${roomId}/messages/mark-read`, {
    method: 'POST',
    body: JSON.stringify({ lastMessageId }),
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### Add Member to Room
```typescript
const { addMember } = useRoomMembers(roomId)
await addMember(newUserId)
```

---

## Authorization Rules

### Teachers Can
- Create/edit/delete notes in any room
- Add/remove members from rooms
- Upload files

### Students Can
- View notes (read-only)
- View member list
- Download files
- Reply/comment (existing feature)

### Everyone Can
- Mark messages as read
- View their own unread counts
- See read-by indicators on messages

---

## Styling Notes

- **Dark theme**: #020617 background, slate-800/900 containers
- **Accent color**: violet-600 for buttons and active states
- **No emojis**: Text-based icons only
- **Font sizes**: Small (xs, sm) for secondary info, normal for primary
- **Spacing**: Consistent 4px grid (px-4, py-3, gap-3, etc.)
- **Borders**: Subtle, slate-700 color

---

## Troubleshooting

### Unread Badge Not Showing
- Check: `GET /rooms/unread-summary` returns correct data
- Verify: CurrentUser in context has correct id
- Debug: Check browser console for hook errors

### Members Tab Not Visible
- Check: User role is 'TEACHER' or 'ADMIN'
- Verify: ChatWindow receives isTeacher prop correctly
- Debug: Check ChatPanelTabs receives isTeacher=true

### Image Not Displaying
- Check: Message.type = 'image' and file exists
- Verify: file.url is valid and accessible
- Debug: Open image URL directly in browser

### Read Receipts Not Working
- Check: `/rooms/:roomId/messages/mark-read` endpoint called
- Verify: User is member of room
- Debug: Check MessageRead entries in database

---

**Status**: All 5 features complete and production-ready  
**Last Updated**: November 15, 2025  
**Maintainer**: KVC Development Team
