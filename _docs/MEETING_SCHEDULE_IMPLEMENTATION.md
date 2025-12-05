# Meeting & Schedule System - Implementation Guide

## 📋 Overview
Complete Meeting & Schedule system for KVC WebApp with full support for teachers to create/manage meetings and students to join/view meetings.

## 🗄️ Database Schema

### Meeting Model
```prisma
model Meeting {
  id          String
  title       String
  description String?
  type        String        // online | onsite
  platform    String?       // Microsoft Teams, Google Meet, Zoom (online only)
  location    String?       // Room number/name (onsite only)
  startTime   DateTime
  endTime     DateTime
  status      String        // scheduled | active | completed | cancelled
  capacity    Int?          // Max participants
  createdAt   DateTime
  updatedAt   DateTime

  // Relations
  teacher     User
  class       Class
  participants MeetingParticipant[]
}
```

### MeetingParticipant Model
```prisma
model MeetingParticipant {
  id        String
  status    String        // joined | left | declined
  joinedAt  DateTime
  leftAt    DateTime?
  
  // Relations
  meeting   Meeting
  student   User
}
```

## 🔌 Backend APIs

### Base Path: `/api/meetings`

#### 1. Create Meeting (POST /)
**Access**: Teacher only
**Request**:
```json
{
  "title": "Weekly Team Meeting",
  "classId": "class-id-123",
  "type": "online",
  "platform": "Microsoft Teams",
  "startTime": "2025-11-25T09:00:00Z",
  "endTime": "2025-11-25T10:00:00Z",
  "capacity": 50,
  "description": "Weekly sync"
}
```

#### 2. List Meetings (GET /)
**Query Parameters**:
- `classId` - Filter by class
- `status` - Filter by status (scheduled, active, completed, cancelled)
- `userId` - For teacher: their meetings; for student: their enrolled class meetings

#### 3. Get Meeting Details (GET /:id)
Returns meeting with all participants

#### 4. Update Meeting (PATCH /:id)
**Access**: Teacher (creator only)
**Allowed Fields**: title, description, type, platform, location, startTime, endTime, capacity

#### 5. Delete Meeting (DELETE /:id)
**Access**: Teacher (creator only)
**Conditions**: Cannot delete active meetings

#### 6. Start Meeting (POST /:id/start)
**Access**: Teacher (creator only)
**Action**: Changes status from scheduled → active

#### 7. End Meeting (POST /:id/end)
**Access**: Teacher (creator only)
**Action**: Changes status from active → completed

#### 8. Join Meeting (POST /:id/join)
**Access**: Student (must be enrolled in class)
**Action**: Add student as participant with status "joined"

#### 9. Leave Meeting (POST /:id/leave)
**Access**: Student (must have joined)
**Action**: Update participant status to "left" with leftAt timestamp

#### 10. Get Participants (GET /:id/participants)
Returns list of all participants for a meeting

## 🎨 Frontend Components (To Be Built)

### Teacher Components
1. **CreateMeetingModal**
   - Form for creating new meeting
   - Inputs: title, type (online/onsite), platform, location, startTime, endTime, capacity
   - Validation for start < end time
   - Success feedback

2. **MeetingsList**
   - Grid/list view of all teacher's meetings
   - Filter by status (scheduled, active, completed)
   - Show: title, date, time, participant count
   - Actions: Edit, Delete, Start/End

3. **MeetingDetails**
   - Full meeting info
   - Participant list with join/leave times
   - Meeting controls (start/end for scheduled meetings)
   - Edit meeting details

4. **MeetingScheduleView**
   - Calendar view of all meetings for the class
   - Week/month view
   - Click to see details

### Student Components
1. **AvailableMeetingsList**
   - Show all upcoming meetings from enrolled classes
   - Join button for scheduled meetings
   - Leave button for joined meetings
   - Filter by status

2. **MyMeetingsView**
   - Meetings student has joined
   - Show status (joined, left)
   - Join/leave actions
   - Meeting details

3. **MeetingCalendar**
   - Calendar view of all meetings
   - Visual indicators for joined/available
   - Click for details

4. **JoinMeetingModal**
   - Confirmation before joining
   - Meeting details
   - Join/Cancel buttons

## 📱 User Flows

### Teacher Creating a Meeting
1. Navigate to Class → Meetings tab
2. Click "Create Meeting"
3. Fill form with meeting details
4. Select online (enter platform) or onsite (enter location)
5. Click Create → Success message
6. Meeting appears in list with status "scheduled"

### Teacher Starting a Meeting
1. Click meeting in list
2. Click "Start Meeting" button
3. Status changes to "active"
4. Participants can now join
5. Teacher sees participant count

### Teacher Ending a Meeting
1. While meeting is active, click "End Meeting"
2. Status changes to "completed"
3. Participants can no longer join

### Student Viewing Meetings
1. Navigate to Class → Meetings tab
2. See all scheduled meetings from their classes
3. Click meeting to see details
4. Click "Join" to join the meeting

### Student Joining Meeting
1. See "Join" button on scheduled meeting
2. Click to join
3. Status shown as "joined"
4. Can click "Leave" to exit
5. Participant count updated in real-time

## 🔒 Security & Validation

### Authorization
- Teachers can only manage (create/update/delete) their own meetings
- Students can only join meetings from their enrolled classes
- Only enrolled students can join meetings from that class

### Validation
- Start time must be before end time
- Only scheduled meetings can be started
- Only active meetings can be ended
- Cannot delete active meetings
- Capacity must be positive if set

### Data Integrity
- Unique constraint on (meetingId, studentId) for participants
- Cascade delete for related participants when meeting deleted
- Automatic timestamps (createdAt, updatedAt)

## 🧪 Testing Checklist

### Backend Testing
- [ ] Create meeting with valid data
- [ ] Reject create meeting without required fields
- [ ] Teacher can update own meeting
- [ ] Teacher cannot update others' meetings
- [ ] Start scheduled meeting → status changes to active
- [ ] Student can join meeting from enrolled class
- [ ] Student cannot join meeting from non-enrolled class
- [ ] Student cannot join twice
- [ ] List meetings filters correctly by status
- [ ] Get participants returns all joined students

### Frontend Testing (Teacher)
- [ ] Create meeting modal works
- [ ] Form validation shows errors
- [ ] Successful creation shows feedback
- [ ] Edit meeting form pre-fills data
- [ ] Delete meeting with confirmation
- [ ] Start meeting updates UI
- [ ] End meeting updates UI
- [ ] Meeting list updates in real-time

### Frontend Testing (Student)
- [ ] See all available meetings from classes
- [ ] Join meeting successfully
- [ ] Leave meeting successfully
- [ ] Cannot join non-enrolled class meeting
- [ ] Joined status shows visually
- [ ] Participant count updates

## 📁 Files Modified/Created
- `backend/prisma/schema.prisma` - Added models
- `backend/prisma/migrations/20251125164438_add_meeting_models/` - Migration
- `backend/src/controllers/meetings.js` - Controller with 10 endpoints
- `backend/src/services/meetings.js` - Service layer logic
- `backend/src/routes/meetings.js` - Routes with validation
- `frontend/src/api/classApi.ts` - API client methods
- `frontend/src/pages/Meeting.jsx` - Existing with mock data (to be integrated)

## 📝 Next Steps
1. Create frontend components for teachers
2. Create frontend components for students
3. Test all endpoints
4. Add real-time updates with WebSocket/Socket.io
5. Add notifications when meetings start/end
6. Add calendar integration

## 🔗 Related Documentation
- Database: Prisma schema in backend/prisma/schema.prisma
- Routes: backend/src/routes/index.js mounts /meetings route
- Frontend routing: See frontend routes configuration
