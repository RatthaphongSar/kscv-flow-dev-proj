# 🔄 Reply System - Quick Test Guide

## Live Testing (Browser)

### Step 1: Login
- URL: http://localhost:5173
- Username: `test-aj-123`
- Password: `123456`
- Role: TEACHER

### Step 2: Navigate to Chat
- Click "แชท" or navigate to `/chat`

### Step 3: Open or Create Room
- Select existing room OR
- Click "+" button to create new room
- Name: "Test Reply Room"
- Members: Auto-select all students

### Step 4: Send Initial Message
- Type: "สวัสดี นี่คือข้อความทดสอบสำหรับตอบกลับ"
- Press Enter
- Message appears at bottom

### Step 5: Test Reply (User Another)
If testing with 2 users:
1. Logout teacher
2. Login as student: (from list of students)
3. Go to chat room
4. Send a test message: "ดีครับ"
5. Logout back to teacher

### Step 6: Test Reply as Teacher
1. Login as teacher again
2. Go to chat room
3. **Hover over student's message** - three-dot button appears
4. **Click three-dot menu** - dropdown shows:
   - ↩ ตอบกลับ
   - ✎ แก้ไข
   - ◫ คัดลอก
   - ⊠ ลบ

5. **Click "↩ ตอบกลับ"** - Reply preview appears:
   ```
   ┌─────────────────────────┐
   │ ตอบกลับ ชื่อนักเรียน    │
   │ "ดีครับ"           [✕] │
   └─────────────────────────┘
   [Message Input Box]
   ```

6. **Type reply**: "ขอบคุณ ยินดีด้วยที่ตอบกลับ"
7. **Press Enter** - Message sent
8. Check console for success logs

### Step 7: Verify Reply Sent
- Message should appear below student's message
- Check backend logs for: `📤 Sending message: { replyToId: "..." }`
- Response should include reply data

### Step 8: Cancel Reply Test
1. Click "↩ ตอบกลับ" on another message
2. Click **"✕"** button in preview box
3. Verify preview disappears

---

## Console Debugging

### Open Browser DevTools
- Press `F12` or Right-click → Inspect

### Check These Logs
1. **Frontend Logs (Console tab)**
   ```
   ✅ Message sent: { replyToId: "msg-123", ... }
   📤 Sending message: { replyToId: "msg-123", ... }
   ```

2. **Network Tab**
   - Look for `POST /chat/rooms/{roomId}/messages`
   - Request body should show: `{ "content": "...", "replyToId": "msg-xxx" }`
   - Response should include `replyTo` object

3. **Application Tab → Storage → LocalStorage**
   - Look for `kvc:lastRead:...` entries (last read message tracking)

---

## Backend Testing (API)

### Test 1: List Messages with Reply Data
```bash
curl -X GET http://localhost:4001/chat/rooms/{roomId}/messages \
  -H "Authorization: Bearer {jwt_token}"
```

**Expected Response:**
```json
[
  {
    "id": "msg-1",
    "content": "สวัสดี",
    "userId": "user-1",
    "replyToId": null,
    "replyTo": null,
    "user": { "username": "อาจารย์" }
  },
  {
    "id": "msg-2",
    "content": "ดีครับ",
    "userId": "user-2",
    "replyToId": null,
    "replyTo": null,
    "user": { "username": "นักเรียน" }
  },
  {
    "id": "msg-3",
    "content": "ขอบคุณ",
    "userId": "user-1",
    "replyToId": "msg-2",
    "replyTo": {
      "id": "msg-2",
      "content": "ดีครับ",
      "user": { "username": "นักเรียน" }
    },
    "user": { "username": "อาจารย์" }
  }
]
```

### Test 2: Send Reply via API
```bash
curl -X POST http://localhost:4001/chat/rooms/{roomId}/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "content": "ตอบกลับข้อความนี้",
    "replyToId": "{messageId}"
  }'
```

**Success Response (201):**
```json
{
  "id": "msg-new",
  "content": "ตอบกลับข้อความนี้",
  "userId": "current-user",
  "roomId": "room-id",
  "replyToId": "messageId",
  "replyTo": {
    "id": "messageId",
    "content": "ข้อความต้นฉบับ",
    "user": { "username": "ผู้ส่ง" }
  },
  "user": { "username": "ผู้ตอบกลับ" },
  "created At": "2025-11-15T12:00:00Z"
}
```

### Test 3: Error Cases
```bash
# Case 1: Reply to non-existent message
curl -X POST http://localhost:4001/chat/rooms/{roomId}/messages \
  -d '{"content":"test","replyToId":"invalid-id"}'
# Expected: 404 Not Found

# Case 2: Reply to message in different room
curl -X POST http://localhost:4001/chat/rooms/{roomId1}/messages \
  -d '{"content":"test","replyToId":"msg-from-roomId2"}'
# Expected: 400 Bad Request
```

---

## Database Verification

### Check Reply Data in PostgreSQL
```sql
-- Show all messages with reply info
SELECT 
  m.id,
  m.content,
  m."replyToId",
  m."userId",
  m."createdAt",
  r.content AS "repliedToContent",
  r."userId" AS "repliedToUserId"
FROM "Message" m
LEFT JOIN "Message" r ON m."replyToId" = r.id
WHERE m."replyToId" IS NOT NULL
ORDER BY m."createdAt" DESC;

-- Show message count with replies
SELECT COUNT(*) as "MessageCount" FROM "Message";
SELECT COUNT(*) as "ReplyCount" FROM "Message" WHERE "replyToId" IS NOT NULL;

-- Show reply chain for specific room
SELECT 
  m.id,
  m.content,
  m."replyToId",
  CASE WHEN m."replyToId" IS NOT NULL THEN '→' ELSE '·' END as type,
  m."createdAt"
FROM "Message" m
WHERE m."roomId" = '{roomId}'
ORDER BY m."createdAt" ASC;
```

---

## Troubleshooting

### Issue: Reply button doesn't work
**Check:**
- [ ] Message is not your own (can't reply to self)
- [ ] Three-dot menu appears when hovering
- [ ] Browser console has no errors
- [ ] Frontend build was successful

### Issue: Reply preview doesn't show
**Check:**
- [ ] Click "↩ ตอบกลับ" in menu (not just hovering)
- [ ] Check browser console for errors
- [ ] Refresh page (Ctrl+Shift+R)
- [ ] Try different message

### Issue: Send fails with error
**Check:**
- [ ] Message input has content
- [ ] Still connected to socket (green indicator)
- [ ] User is member of room
- [ ] Backend logs for error details

### Issue: Reply data not showing in response
**Check:**
- [ ] Backend was restarted after migration
- [ ] Database migration applied successfully
- [ ] Check database has `replyToId` column:
  ```sql
  \d "Message"
  ```

---

## Success Indicators ✅

When reply works correctly, you should see:

1. **UI Level**
   - Three-dot menu has "↩ ตอบกลับ" option
   - Clicking shows reply preview box
   - Preview displays message author + content snippet
   - Cancel button (✕) works

2. **Network Level**
   - POST request includes `replyToId` in body
   - 201 response includes `replyTo` object
   - No 404/400/500 errors

3. **Database Level**
   - New message has `replyToId` filled
   - `replyTo` relation can be queried
   - Cascade delete works (delete original → replies also deleted)

4. **Browser Level**
   - No console errors
   - Console shows ✅ success logs
   - Page doesn't crash or freeze

---

## Performance Notes

- **Small Dataset**: All tests should complete instantly (< 100ms)
- **Large Dataset**: May see slight delays with 1000+ messages
- **Cascading**: Delete message with 100 replies should complete in < 500ms

---

## Screenshots to Verify

After completing tests, verify these states:

1. **Reply Preview State**
   - Message input visible
   - Reply preview box above it
   - Shows: "ตอบกลับ [ชื่อผู้ใช้]"
   - Shows truncated message
   - Cancel button visible

2. **Reply Sent State**
   - New message appears in list
   - No errors in console
   - Message shows below original message

3. **Multi-User State**
   - Two browsers (teacher + student)
   - Teacher sees student's message
   - Teacher can click reply button
   - Reply appears for both users (if real-time enabled)

---

**Test Completed At**: _______________
**Tested By**: ________________________
**Result**: ☐ PASS  ☐ FAIL  ☐ PARTIAL

**Notes**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```
