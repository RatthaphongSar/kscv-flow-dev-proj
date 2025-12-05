# Meeting & Schedule System - Testing Guide

## 🧪 Testing Environment Setup

### Prerequisites
- Backend running on http://localhost:4001
- Frontend running on http://localhost:5173
- Database (PostgreSQL) with migrations applied
- Test user accounts:
  - Teacher: username=teacher1, role=TEACHER
  - Student: username=student1, role=STUDENT

## 🧪 API Testing (Using curl or Postman)

### 1. Authentication Setup
First, get auth token for test users:

```bash
# Login as teacher
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"password"}'

# Login as student
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password"}'
```

Store the returned `access_token` in Authorization header.

### 2. Backend API Tests

#### Test 2.1: Create Meeting (Teacher Only)
```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CS-101 Online Class",
    "classId": "CLASS_ID_HERE",
    "type": "online",
    "platform": "Google Meet",
    "startTime": "2025-11-25T09:00:00Z",
    "endTime": "2025-11-25T10:00:00Z",
    "capacity": 50,
    "description": "Weekly class session"
  }'
```

**Expected Response**: 201 Created with meeting object
**Store**: `meetingId` from response for next tests

#### Test 2.2: List Meetings (Teacher)
```bash
curl -X GET "http://localhost:4001/api/meetings?classId=CLASS_ID_HERE" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK with array of meetings

#### Test 2.3: List Meetings (Student - Only Their Classes)
```bash
curl -X GET http://localhost:4001/api/meetings \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response**: 200 OK with student's enrolled class meetings

#### Test 2.4: Get Meeting Details
```bash
curl -X GET http://localhost:4001/api/meetings/MEETING_ID \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK with meeting + participants

#### Test 2.5: Update Meeting (Teacher Only)
```bash
curl -X PATCH http://localhost:4001/api/meetings/MEETING_ID \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CS-101 Updated Title",
    "description": "Updated description"
  }'
```

**Expected Response**: 200 OK with updated meeting

#### Test 2.6: Start Meeting (Teacher Only)
```bash
curl -X POST http://localhost:4001/api/meetings/MEETING_ID/start \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK, status changes to "active"

#### Test 2.7: Join Meeting (Student)
```bash
curl -X POST http://localhost:4001/api/meetings/MEETING_ID/join \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response**: 200 OK, student added as participant

#### Test 2.8: Get Participants
```bash
curl -X GET http://localhost:4001/api/meetings/MEETING_ID/participants \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK with array of participants (joinedAt, leftAt times)

#### Test 2.9: Leave Meeting (Student)
```bash
curl -X POST http://localhost:4001/api/meetings/MEETING_ID/leave \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response**: 200 OK, participant status = "left"

#### Test 2.10: End Meeting (Teacher Only)
```bash
curl -X POST http://localhost:4001/api/meetings/MEETING_ID/end \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK, status changes to "completed"

#### Test 2.11: Delete Meeting (Teacher Only)
```bash
curl -X DELETE http://localhost:4001/api/meetings/MEETING_ID \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 200 OK with success message

### 3. Error Cases to Test

#### Test 3.1: Student Creates Meeting (Should Fail)
```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","classId":"ID","startTime":"2025-11-25T09:00:00Z","endTime":"2025-11-25T10:00:00Z"}'
```

**Expected Response**: 403 Forbidden - "Only teachers can create meetings"

#### Test 3.2: Student Join Non-Enrolled Class Meeting (Should Fail)
```bash
curl -X POST http://localhost:4001/api/meetings/MEETING_FROM_OTHER_CLASS/join \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response**: 400 Bad Request - "You are not enrolled in this class"

#### Test 3.3: Invalid Time Range (Start >= End)
```bash
curl -X POST http://localhost:4001/api/meetings \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Invalid",
    "classId":"CLASS_ID",
    "startTime":"2025-11-25T10:00:00Z",
    "endTime":"2025-11-25T09:00:00Z"
  }'
```

**Expected Response**: 400 Bad Request - "Start time must be before end time"

#### Test 3.4: Teacher Updates Another's Meeting (Should Fail)
```bash
curl -X PATCH http://localhost:4001/api/meetings/OTHER_TEACHER_MEETING/start \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected Response**: 400 Bad Request - "Only the meeting creator can..."

## 🎨 Frontend Integration Testing

### Teacher Side Tests

#### Test 4.1: Navigate to Class Meetings
1. Login as teacher1
2. Click on a class
3. Go to Meetings tab
4. Should see existing meetings in list

#### Test 4.2: Create New Meeting
1. Click "Create Meeting" button
2. Fill form:
   - Title: "Test Meeting"
   - Type: Online (shows platform dropdown)
   - Platform: "Google Meet"
   - Start: Tomorrow 10:00 AM
   - End: Tomorrow 11:00 AM
   - Capacity: 50
3. Click Create
4. Success message appears
5. Meeting appears in list with status "scheduled"

#### Test 4.3: Edit Meeting
1. Click meeting in list
2. Click Edit button
3. Change title to "Updated Title"
4. Click Save
5. List updates with new title

#### Test 4.4: Start Meeting
1. Click scheduled meeting
2. Click "Start Meeting" button
3. Status changes to "active"
4. Show participant count (should increase as students join)

#### Test 4.5: View Participants
1. While meeting is active, check participant list
2. Should show all students who have joined
3. Show join time and leave time (if left)

#### Test 4.6: End Meeting
1. Click "End Meeting" button
2. Status changes to "completed"
3. Cannot join anymore

#### Test 4.7: Delete Meeting
1. Click scheduled meeting
2. Click Delete button
3. Confirmation dialog appears
4. Click Confirm
5. Meeting removed from list

### Student Side Tests

#### Test 5.1: View Available Meetings
1. Login as student1
2. Go to Class section
3. Click on class they're enrolled in
4. Go to Meetings tab
5. See all available meetings from that class

#### Test 5.2: Join Meeting
1. Find scheduled meeting
2. Click "Join" button
3. Success message appears
4. Status changes to "joined"
5. Button changes to "Leave"

#### Test 5.3: See Joined Status
1. After joining meeting
2. Meeting shows in "My Meetings" section
3. Shows "You have joined this meeting"
4. Shows join time

#### Test 5.4: Leave Meeting
1. From joined meeting
2. Click "Leave" button
3. Confirmation appears
4. Click Confirm
5. Status changes back to "Not joined"
6. Can rejoin if meeting still active

#### Test 5.5: Cannot Join Non-Enrolled Class
1. Try to access meeting from different class
2. Error message: "You are not enrolled in this class"

## 📊 Data Validation Tests

### Test 6.1: Meeting Capacity
```
Create meeting with capacity: -1 (Should fail)
Create meeting with capacity: 0 (Should fail)
Create meeting with capacity: 100 (Should succeed)
```

### Test 6.2: Time Validation
```
Create meeting with:
- startTime = 2025-11-25T10:00:00Z
- endTime = 2025-11-25T10:00:00Z (Should fail - same time)
- endTime = 2025-11-25T09:00:00Z (Should fail - end before start)
- endTime = 2025-11-25T11:00:00Z (Should succeed)
```

### Test 6.3: Type Validation
```
Create with type: "online" without platform (Should succeed - platform optional)
Create with type: "onsite" without location (Should succeed - location optional)
Create with type: "invalid" (Should fail)
```

## 🔍 Real-Time Updates Tests

### Test 7.1: Participant Count Updates
1. Teacher starts meeting
2. Open meeting in multiple student windows
3. Student 1 clicks Join
4. Participant count on teacher's screen increases to 1
5. Student 2 clicks Join
6. Participant count increases to 2

### Test 7.2: Status Updates
1. Teacher starts meeting (status → active)
2. All participants see status changes
3. Teacher ends meeting (status → completed)
4. All see "meeting completed"

## ✅ Checklist for Complete Testing

### Backend
- [ ] Create meeting with all required fields
- [ ] Create meeting with optional fields
- [ ] List meetings (teacher and student)
- [ ] Get meeting details with participants
- [ ] Update meeting (title, description, etc)
- [ ] Cannot update deleted/completed meetings
- [ ] Start meeting (scheduled → active)
- [ ] End meeting (active → completed)
- [ ] Student join meeting
- [ ] Student cannot join twice
- [ ] Student cannot join non-enrolled class meeting
- [ ] Student leave meeting
- [ ] Get participants with join/leave times
- [ ] Delete meeting (teacher only, not if active)
- [ ] All error cases tested
- [ ] Validation works for all fields

### Frontend - Teacher
- [ ] See all meetings in class
- [ ] Filter by status
- [ ] Create new meeting modal
- [ ] Form validation works
- [ ] Create meeting successfully
- [ ] Edit meeting details
- [ ] See participant count
- [ ] Start meeting
- [ ] View participants with times
- [ ] End meeting
- [ ] Delete meeting with confirmation
- [ ] Calendar view of meetings

### Frontend - Student
- [ ] See available meetings from classes
- [ ] See meeting details
- [ ] Join meeting successfully
- [ ] Cannot join twice
- [ ] Joined status shows correctly
- [ ] Leave meeting
- [ ] See participant count
- [ ] Cannot join non-enrolled class
- [ ] Calendar view shows meetings
- [ ] Real-time updates of participant count

## 🐛 Known Issues / Edge Cases
(To be filled after testing)

---

**Last Updated**: November 25, 2025
**Status**: Ready for testing
