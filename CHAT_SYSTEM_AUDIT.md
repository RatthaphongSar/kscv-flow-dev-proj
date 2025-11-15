# 🔍 Chat System Comprehensive Audit

**Date:** Nov 15, 2025
**Status:** Testing in Progress

---

## 📋 Audit Checklist

### 1. **UI Components** ✅/❌

#### ChatWindow Header
- [ ] **Add Students Button** (Teachers only)
  - Visibility: Only for teachers/admins
  - Click: Opens modal
  - Modal loads: Students list
  - Search works: Filter students
  - Checkbox select: Multiple selection
  - Submit: Adds students to room
  - Close modal: Cancel button, X button
  - Success message: Confirm addition

#### ChatSidebar
- [ ] **Create Room Button**
  - Visibility: Only for teachers
  - Click: Opens modal
  - Form fields:
    - Room name (required)
    - Room type (dropdown)
    - Room description (optional)
  - Submit: Creates room
  - Close: Cancel button, X button

- [ ] **Search Rooms**
  - Filter: Real-time search
  - Clear: Works when cleared
  - Case insensitive: Both upper/lower

- [ ] **Room List**
  - Display: All rooms
  - Select: Highlight active
  - Scroll: Works if many rooms

#### MessageBubble Action Menu
- [ ] **Three Dots Menu (own messages)**
  - Edit button: Opens edit mode
  - Delete button: Confirms then deletes
  - Reply button: Highlights message, sets context
  - Copy button: Copies to clipboard

- [ ] **Three Dots Menu (other messages)**
  - Reply button: Highlights message, sets context
  - Copy button: Copies to clipboard
  - Edit/Delete: Hidden (not owner)

#### MessageInput
- [ ] **Send Button**
  - Disabled when empty
  - Enabled when has text
  - Click: Sends message
  - Loading state: Shows ⏳
  - Success: Clears input

- [ ] **Enter to Send**
  - Enter (no shift): Sends
  - Shift+Enter: Newline
  - When disabled: No send

- [ ] **Reply Context**
  - Display: "ตอบกลับ username"
  - Content preview: Shows last message
  - Cancel button: Closes reply context
  - Auto-clear: After sending

---

### 2. **API Integration** ✅/❌

#### Chat API Endpoints
- [ ] `listRooms()` - GET /api/chat/rooms
  - Returns: Array of rooms
  - Includes: name, id, members count
  - Error handling: Shows message

- [ ] `listMessages(roomId)` - GET /api/chat/rooms/{id}/messages
  - Returns: Array of messages (ASC order)
  - Includes: content, sender, timestamp, reply info
  - Error handling: Shows message

- [ ] `sendMessage(roomId, content)` - POST /api/chat/messages
  - Payload: { content, roomId, replyToId? }
  - Response: New message object
  - Error handling: Shows error
  - Success: Adds to list

- [ ] `deleteMessage(messageId)` - DELETE /api/chat/messages/{id}
  - Success: Removes from UI
  - Confirmation: User confirms
  - Error: Shows message

- [ ] `editMessage(messageId, content)` - PUT /api/chat/messages/{id}
  - Payload: { content }
  - Response: Updated message
  - UI Update: Shows "edited" label
  - Error: Shows message

- [ ] `addMembersToRoom(roomId, userIds)` - POST /api/chat/rooms/{id}/members
  - Payload: { userIds: [id1, id2, ...] }
  - Response: Success message
  - Error: Shows message
  - Validation: At least 1 user

- [ ] `getStudents()` - GET /api/users/students
  - Returns: Array of students
  - Includes: username, email, year, major
  - Error: Shows message

- [ ] `createRoom(name, type, description)` - POST /api/chat/rooms
  - Payload: { name, type, description }
  - Response: New room object
  - Error: Shows message
  - Redirect: Select new room

---

### 3. **Socket Events** ✅/❌

#### Real-time Messaging
- [ ] `joinRoom` event
  - Sent on room select
  - Parameters: roomId
  - Server confirms: Ready to receive

- [ ] `message` event (receive)
  - New message arrives
  - Updates: Message list
  - Auto-scroll: If at bottom
  - Notification: If not focused?

- [ ] `messageDeleted` event
  - Message removed
  - UI Update: Removes from list
  - Confirmation: User confirms locally

- [ ] `messageEdited` event
  - Message updated
  - UI Update: Updates content
  - Label: Shows "edited"

- [ ] `typing` event
  - User typing indicator (optional)
  - Display: "User is typing..."
  - Hide: After 3 seconds

---

### 4. **Error Handling** ✅/❌

- [ ] Network errors: Shows message
- [ ] 401 Unauthorized: Redirect to login
- [ ] 403 Forbidden: Show error message
- [ ] 500 Server errors: Show friendly message
- [ ] Timeout: Show retry button
- [ ] Empty states: "No messages", "No rooms"

---

### 5. **Edge Cases** ✅/❌

- [ ] Long messages: Wrap correctly
- [ ] Multiple replies: Chain visible
- [ ] Deleted messages: Still show in reply chain?
- [ ] Very long room names: Truncate + tooltip?
- [ ] Many messages: Scroll performance?
- [ ] Rapid message sends: Queue correctly?
- [ ] Leave then rejoin room: Data fresh?
- [ ] Two tabs open: Sync state?

---

## 🧪 Manual Test Plan

### Test 1: Basic Message Flow
**Steps:**
1. Select a room
2. Type message
3. Press Enter
4. Message appears at bottom
5. Auto-scroll to latest
6. Refresh page
7. Message still there

**Expected:** ✅ All pass

---

### Test 2: Reply System
**Steps:**
1. Hover over message
2. Click three dots
3. Click "ตอบกลับ"
4. Reply context shows
5. Type reply
6. Send
7. Verify reply chain visible

**Expected:** ✅ All pass

---

### Test 3: Edit Message
**Steps:**
1. Own message → three dots
2. Click "แก้ไข"
3. Edit text
4. Click save or Enter
5. Message updates
6. "edited" label shows

**Expected:** ✅ All pass

---

### Test 4: Delete Message
**Steps:**
1. Own message → three dots
2. Click "ลบ"
3. Confirm dialog
4. Message disappears
5. Verify removed from DB

**Expected:** ✅ All pass

---

### Test 5: Add Students Modal
**Steps:**
1. (Teacher) Click "➕ เพิ่มสมาชิก"
2. Modal opens
3. Search student name
4. Select 2-3 students
5. Click "เพิ่ม"
6. Verify count updates

**Expected:** ✅ All pass

---

### Test 6: Create Room
**Steps:**
1. (Teacher) Click "+" in sidebar
2. Enter room name
3. Select type
4. Add description
5. Click create
6. New room appears in list
7. Auto-select

**Expected:** ✅ All pass

---

### Test 7: Scroll System
**Steps:**
1. Send 20+ messages
2. Scroll up
3. Button "⬇️" appears
4. Click button
5. Auto-scroll to bottom
6. Scroll down naturally
7. No button

**Expected:** ✅ All pass

---

### Test 8: Search Rooms
**Steps:**
1. Type room name in search
2. List filters
3. Clear search
4. All rooms show

**Expected:** ✅ All pass

---

## 📊 Summary

| Component | Status | Issues | Notes |
|-----------|--------|--------|-------|
| ChatWindow | TBD | - | Testing |
| ChatSidebar | TBD | - | Testing |
| MessageBubble | TBD | - | Testing |
| MessageInput | TBD | - | Testing |
| AddStudentsModal | TBD | - | Testing |
| API Integration | TBD | - | Testing |
| Socket Events | TBD | - | Testing |

---

## ✅ Sign-off

- [ ] All manual tests passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for deployment

