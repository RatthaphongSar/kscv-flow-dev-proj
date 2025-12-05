# ระบบ Pin ห้องแชท (Room Pin System)

## 📋 ภาพรวม
ระบบที่อนุญาตให้ผู้ใช้ทุกคนสามารถ **Pin (บันทึก/เก็บ)** ห้องแชทที่สำคัญเพื่อให้เข้าถึงได้ง่าย

## 🎯 คุณสมบัติ

### Frontend
- ✅ ปุ่ม Pin/Unpin แสดงเมื่อ hover บนรายการห้อง
- ✅ แสดง 📌 emoji ถัดจากชื่อห้องสำหรับห้องที่ pinned
- ✅ แสดงหน่วยงาน `Pinned` เพื่อกรองแสดงเฉพาะห้อง pinned
- ✅ Auto-reload pinned rooms เมื่อ login
- ✅ Toggle pin/unpin โดยไม่ต้องรีเฟรช page

### Backend
- ✅ Model RoomPin ใน Prisma (unique constraint: roomId + userId)
- ✅ Service 6 methods:
  - `pinRoom(roomId, userId)` - Pin ห้อง
  - `unpinRoom(roomId, userId)` - Unpin ห้อง
  - `getPinnedRooms(userId)` - ดึงห้องที่ pinned
  - `isRoomPinned(roomId, userId)` - ตรวจสอบสถานะ
  - `getRoomPinCount(roomId)` - นับจำนวน pin
  - `getRoomPinners(roomId)` - ดึงผู้ที่ pin ห้องนี้

- ✅ API Endpoints:
  - `POST /api/chat/rooms/:roomId/pin` - Pin ห้อง
  - `DELETE /api/chat/rooms/:roomId/pin` - Unpin ห้อง
  - `GET /api/chat/me/pinned` - ดึงห้องที่ pinned
  - `GET /api/chat/rooms/:roomId/pin/status` - ตรวจสอบสถานะ

## 🛠️ โครงสร้างไฟล์

### Backend
```
backend/
├── prisma/
│   └── schema.prisma                    # ✅ เพิ่ม RoomPin model + relations
├── src/
│   ├── controllers/
│   │   └── chatExtended.js             # ✅ เพิ่ม 4 pin handlers
│   ├── services/
│   │   └── chatRoomPin.service.js      # ✅ ใหม่ - service 6 methods
│   └── routes/
│       └── chat.js                      # ✅ ลงทะเบียน 4 routes
```

### Frontend
```
frontend/
├── src/
│   ├── hooks/
│   │   └── useRoomPin.ts               # ✅ ใหม่ - hook for pin operations
│   ├── pages/
│   │   └── Chat.jsx                    # ✅ เพิ่ม pin state + handlers
│   └── components/chat/
│       ├── ChatLayout.tsx              # ✅ Pass pinnedRooms + onTogglePin
│       ├── ChatSidebar.tsx             # ✅ Pass to ConversationList
│       └── ConversationList.tsx        # ✅ แสดง pin icon + button
```

## 📊 ฐานข้อมูล

### RoomPin Table
```sql
CREATE TABLE "RoomPin" (
  id String PRIMARY KEY,
  pinnedAt DateTime DEFAULT now(),
  roomId String FOREIGN KEY,
  userId String FOREIGN KEY,
  UNIQUE(roomId, userId),
  INDEX(userId, pinnedAt),
  INDEX(roomId)
)
```

## 🔄 Flow ของการใช้งาน

### 1️⃣ ดู Pin Status
```javascript
// Frontend
GET /api/chat/me/pinned
Response: [
  { id, roomId, pinnedAt, room: { id, name, type, _count: { messages, members } } }
]
```

### 2️⃣ Pin ห้อง
```javascript
// Frontend
POST /api/chat/rooms/{roomId}/pin
Response: { id, roomId, pinnedAt, room: {...} }

// Service
await chatRoomPinService.pinRoom(roomId, userId)
→ Prisma upsert RoomPin record
```

### 3️⃣ Unpin ห้อง
```javascript
// Frontend
DELETE /api/chat/rooms/{roomId}/pin

// Service
await chatRoomPinService.unpinRoom(roomId, userId)
→ Prisma delete RoomPin record
```

### 4️⃣ ตรวจสอบ Pin Status
```javascript
// Frontend
GET /api/chat/rooms/{roomId}/pin/status
Response: { roomId, isPinned: true|false }
```

## 🎨 UI/UX Details

### Chat Sidebar - Room List
```
┌─────────────────────────────────┐
│ 📌 IT Class (pinned)    [📌]   │  ← Pin icon + hover button
│ พูดคุยเกี่ยวกับ...              │
├─────────────────────────────────┤
│ English Class (not pinned)  [📌] │
│ ไม่มีข้อความ                    │
├─────────────────────────────────┤
│ Filter: All | Pinned | Unread   │
└─────────────────────────────────┘
```

### Pin Indicator
- **Active (Pinned)**: `📌 IT Class` + Button yellow (amber-400)
- **Inactive**: No emoji + Button gray (opacity-0 on hover)
- **Hover**: Button opacity-100 with background

## 🔐 ข้อมูลความปลอดภัย

### Authentication
- ✅ ทุก endpoint ต้อง `authRequired` middleware
- ✅ ทุก action ต้องตรวจสอบ `req.user.id`
- ✅ ทุก pin ต้องตรวจสอบ membership (roomId_userId)

### Authorization
- ✅ User สามารถ pin/unpin ห้องของตนเองเท่านั้น
- ✅ User ต้องเป็น member ของห้องก่อน pin

## 📈 ประสิทธิภาพ

### Database Indexes
```
RoomPin indexes:
1. UNIQUE(roomId, userId) - ตรวจสอบ duplicate + fast lookup
2. INDEX(userId, pinnedAt) - quick fetch pinned rooms
3. INDEX(roomId) - quick fetch pinners of room
```

### Service Optimization
- ✅ Lazy initialization - service create on first call
- ✅ `.call()` binding - proper `this` context
- ✅ No N+1 queries - include relations อย่างเหมาะสม

## 🧪 Test Cases

### Happy Path
1. ✅ Pin room → Record created + isPinned = true
2. ✅ Get pinned rooms → List shows all pinned
3. ✅ Unpin room → Record deleted + isPinned = false
4. ✅ Toggle pin → Switch between pinned/unpinned

### Error Cases
1. ⚠️ Pin without auth → 401 Unauthorized
2. ⚠️ Pin non-member room → 403 Forbidden
3. ⚠️ Unpin non-existent pin → 404 Not Found
4. ⚠️ Pin duplicate → upsert (no error)

## 💾 API Documentation

### POST /api/chat/rooms/:roomId/pin
Pin a room for current user
```
Request:
  Headers: Authorization: Bearer {token}
  
Response (201):
  {
    id: string
    roomId: string
    pinnedAt: ISO8601
    room: { id, name, type, _count: { messages, members } }
    user: { id, username }
  }

Error (403): Not a member
Error (401): Unauthorized
```

### DELETE /api/chat/rooms/:roomId/pin
Unpin a room for current user
```
Request:
  Headers: Authorization: Bearer {token}
  
Response (200):
  { message: "Room unpinned successfully" }

Error (404): Pin not found
Error (401): Unauthorized
```

### GET /api/chat/me/pinned
Get all pinned rooms for current user (sorted by recent)
```
Request:
  Headers: Authorization: Bearer {token}
  
Response (200):
  [
    { id, roomId, pinnedAt, room: {...} },
    { id, roomId, pinnedAt, room: {...} }
  ]

Error (401): Unauthorized
```

### GET /api/chat/rooms/:roomId/pin/status
Check if room is pinned by current user
```
Request:
  Headers: Authorization: Bearer {token}
  
Response (200):
  { roomId: string, isPinned: boolean }

Error (401): Unauthorized
```

## 🚀 Git Commit
```
commit 9de9573
feat: Add room pin system - users can pin/unpin rooms

Backend:
- RoomPin model + relations
- chatRoomPin.service.js (6 methods)
- 4 pin endpoints

Frontend:
- useRoomPin hook
- Chat.jsx pin state
- UI updates with pin icon
```

## 📝 หมายเหตุสำคัญ

1. **Lazy Initialization**: Service ไม่ create จนกว่า first call → ไม่มี timing issues
2. **Upsert Pattern**: Pin duplicate → update timestamp แทนสร้างซ้ำ
3. **Filter in Frontend**: "Pinned" tab กรอง rooms จาก pinnedRooms array
4. **Live Toggle**: Pin/unpin ทำงานทันทีโดยไม่ต้องรีเฟรช page
5. **Backward Compatible**: ไม่ break existing chat functionality

## ⏭️ Future Enhancements
- [ ] Pin order customization (drag-drop reorder)
- [ ] Pin expiration (auto-unpin after X days)
- [ ] Shared pins (team/class level)
- [ ] Pin notifications (alert when pinned room has message)
- [ ] Pin statistics (most pinned rooms in class)
