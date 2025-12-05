# Meeting & Schedule API Quick Test Guide

## 📌 Quick Start - 5 Minute Test

### Prerequisites
- Backend running: `cd backend && nodemon src/server.js`
- Frontend running: `cd frontend && npm run dev` (optional)
- Database: PostgreSQL running with migrations applied

### Step 1: Get Test Data
First, get your class ID from the database or from the Class page in the frontend.

```bash
# Store these in variables for easy testing
TEACHER_TOKEN="your_teacher_token_here"
STUDENT_TOKEN="your_student_token_here"
CLASS_ID="your_class_id_here"
MEETING_ID="will_get_from_create_response"
```

### Step 2: Create a Meeting (1 command)

```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "classId": "'$CLASS_ID'",
    "type": "online",
    "platform": "Google Meet",
    "startTime": "2025-11-25T14:00:00Z",
    "endTime": "2025-11-25T15:00:00Z",
    "capacity": 50
  }'
```

✅ **Expected**: 201 Created, contains meeting object with `id` field
📝 **Save**: Copy the `id` value, use as `MEETING_ID`

---

### Step 3: List Meetings

```bash
# Teacher sees their meetings
curl -X GET http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# Student sees meetings from enrolled classes
curl -X GET http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

✅ **Expected**: 200 OK, array with your created meeting

---

### Step 4: Get Meeting Details

```bash
curl -X GET http://localhost:4001/api/meetings/$MEETING_ID \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

✅ **Expected**: 200 OK, meeting details with empty participants array

---

### Step 5: Start Meeting (Teacher)

```bash
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/start \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

✅ **Expected**: 200 OK, meeting status = "active"

---

### Step 6: Student Joins Meeting

```bash
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

✅ **Expected**: 200 OK, participant object created

---

### Step 7: Get Participants

```bash
curl -X GET http://localhost:4001/api/meetings/$MEETING_ID/participants \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

✅ **Expected**: 200 OK, array with 1 participant (the student who joined)

---

### Step 8: Student Leaves Meeting

```bash
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/leave \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

✅ **Expected**: 200 OK, participant status = "left", leftAt timestamp set

---

### Step 9: End Meeting (Teacher)

```bash
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/end \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

✅ **Expected**: 200 OK, meeting status = "completed"

---

### Step 10: Delete Meeting (Teacher)

```bash
curl -X DELETE http://localhost:4001/api/meetings/$MEETING_ID \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

✅ **Expected**: 200 OK with success message

---

## 🧪 Testing the Workflow

### Full Teacher-Student Flow
```bash
# 1. Teacher creates meeting
RESPONSE=$(curl -s -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo","classId":"'$CLASS_ID'","type":"online","platform":"Meet","startTime":"2025-11-25T14:00:00Z","endTime":"2025-11-25T15:00:00Z"}')

MEETING_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created meeting: $MEETING_ID"

# 2. Teacher starts meeting
curl -s -X POST http://localhost:4001/api/meetings/$MEETING_ID/start \
  -H "Authorization: Bearer $TEACHER_TOKEN" | grep -o '"status":"[^"]*"'

# 3. Student joins
curl -s -X POST http://localhost:4001/api/meetings/$MEETING_ID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN" | grep -o '"status":"[^"]*"'

# 4. Check participants
curl -s -X GET http://localhost:4001/api/meetings/$MEETING_ID/participants \
  -H "Authorization: Bearer $TEACHER_TOKEN" | grep -o '"status":"[^"]*"'

# 5. Student leaves
curl -s -X POST http://localhost:4001/api/meetings/$MEETING_ID/leave \
  -H "Authorization: Bearer $STUDENT_TOKEN" | grep -o '"status":"[^"]*"'

# 6. Teacher ends meeting
curl -s -X POST http://localhost:4001/api/meetings/$MEETING_ID/end \
  -H "Authorization: Bearer $TEACHER_TOKEN" | grep -o '"status":"[^"]*"'
```

---

## ❌ Error Cases to Test

### 1. Student Creates Meeting (Should Fail - 403)
```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Should Fail",
    "classId":"'$CLASS_ID'",
    "type":"online",
    "platform":"Meet",
    "startTime":"2025-11-25T14:00:00Z",
    "endTime":"2025-11-25T15:00:00Z"
  }'
```

**Expected**: 403 Forbidden - "Only teachers can create meetings"

---

### 2. Invalid Time Range (Should Fail - 400)
```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Invalid Times",
    "classId":"'$CLASS_ID'",
    "type":"online",
    "platform":"Meet",
    "startTime":"2025-11-25T15:00:00Z",
    "endTime":"2025-11-25T14:00:00Z"
  }'
```

**Expected**: 400 Bad Request - "Start time must be before end time"

---

### 3. Join Twice (Should Fail - 400)
```bash
# First join (succeeds)
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Second join (fails)
curl -X POST http://localhost:4001/api/meetings/$MEETING_ID/join \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Expected on 2nd**: 400 Bad Request - "You have already joined this meeting"

---

### 4. Update Other Teacher's Meeting (Should Fail - 400)
```bash
curl -X PATCH http://localhost:4001/api/meetings/$OTHER_TEACHER_MEETING_ID \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked"}'
```

**Expected**: 400 Bad Request - "Only the meeting creator can update this meeting"

---

## 📊 Response Examples

### Create Meeting Response (201)
```json
{
  "success": true,
  "data": {
    "id": "clq1a2b3c4d5e6f7g8h9i0j",
    "title": "Test Meeting",
    "description": null,
    "type": "online",
    "platform": "Google Meet",
    "location": null,
    "startTime": "2025-11-25T14:00:00.000Z",
    "endTime": "2025-11-25T15:00:00.000Z",
    "status": "scheduled",
    "capacity": 50,
    "createdAt": "2025-11-25T12:34:56.789Z",
    "updatedAt": "2025-11-25T12:34:56.789Z",
    "teacherId": "teacher_id_here",
    "classId": "class_id_here",
    "teacher": {
      "id": "teacher_id_here",
      "username": "teacher1",
      "email": "teacher@example.com"
    },
    "class": {
      "id": "class_id_here",
      "code": "CS-101",
      "name": "Introduction to Computer Science"
    },
    "participants": []
  },
  "message": "Meeting created successfully"
}
```

### Join Meeting Response (200)
```json
{
  "success": true,
  "data": {
    "id": "participant_id_here",
    "status": "joined",
    "joinedAt": "2025-11-25T14:05:00.000Z",
    "leftAt": null,
    "meetingId": "meeting_id_here",
    "studentId": "student_id_here",
    "student": {
      "id": "student_id_here",
      "username": "student1",
      "email": "student@example.com"
    }
  },
  "message": "Joined meeting successfully"
}
```

---

## 💡 Tips

1. **Save IDs in variables** for easier testing:
   ```bash
   MEETING_ID="the-id-from-create"
   ```

2. **Use `jq`** for pretty JSON output:
   ```bash
   curl ... | jq .
   ```

3. **Check all status codes**:
   - 201 = Created (success)
   - 200 = OK (success)
   - 400 = Bad Request (validation error)
   - 403 = Forbidden (authorization error)
   - 404 = Not Found

4. **Use `-v`** flag to see request/response headers:
   ```bash
   curl -v -X GET ...
   ```

---

## ✅ Quick Validation Checklist

After running these tests, check:
- [ ] Can create meeting as teacher
- [ ] Cannot create as student
- [ ] Can start meeting
- [ ] Can join as student
- [ ] Can see participants
- [ ] Can leave meeting
- [ ] Can end meeting
- [ ] Can delete meeting
- [ ] Proper error messages
- [ ] Proper status codes

---

**Last Updated**: November 25, 2025
