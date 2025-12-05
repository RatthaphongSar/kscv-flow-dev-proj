# Class System Refactor - Phase 2: Student Join/Approval Flow

**Status**: ✅ Phase 2 Complete  
**Date**: 2025-11-20  
**Focus**: Implementing student join requests and teacher approval system

---

## Summary of Changes

### 1. **Type Definitions** - `frontend/src/types/class.types.ts`

Added new interface for join requests:
```typescript
export interface JoinRequest {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    username: string;
    email?: string;
  };
}
```

---

### 2. **Frontend: `frontend/src/pages/Class.jsx`** - Student Join UI

#### New State for Join Requests
```javascript
// Student join request status per class
const [joinRequestStatus, setJoinRequestStatus] = useState({});
const [joinRequestLoading, setJoinRequestLoading] = useState(false);
```

#### New useEffect: Check Student's Join Status
```javascript
// When student opens a class, checks if they have a pending/approved/rejected join request
useEffect(() => {
  if (!selectedId || userRole !== "STUDENT") return;
  
  // Fetches:
  // 1. Class details
  // 2. All join requests for that class
  // 3. Finds if current student has a request
  // 4. Stores status (pending/approved/rejected)
}, [selectedId, userRole, user]);
```

#### New Function: Request to Join
```javascript
const handleRequestJoin = async () => {
  // Calls: POST /api/classes/{classId}/join-request
  // Shows alert on success/failure
  // Updates UI to show "Pending Approval" state
}
```

#### Updated Header UI - Student View
Added conditional rendering:
```jsx
{userRole === "STUDENT" && (
  joinRequestStatus[selectedId]?.joinRequest ? (
    // Show status badge:
    // - Pending Approval (yellow)
    // - Approved (green) 
    // - Rejected (red)
  ) : (
    // Show "Request to Join" button
    <button onClick={handleRequestJoin}>
      Request to Join
    </button>
  )
)}
```

---

### 3. **Frontend: `frontend/src/components/class/ClassStudents.tsx`** - Teacher Approval Panel

#### Updated State Management
```typescript
const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
const [processingJoinRequest, setProcessingJoinRequest] = useState<string | null>(null);
```

#### Updated Data Fetching
Changed from `loadStudents()` to `loadData()`:
```javascript
// Loads both enrolled students AND pending join requests
const loadData = async () => {
  const [studentsData, joinRequestsData] = await Promise.all([
    classApi.getClassStudents(classId!),
    classApi.getJoinRequests(classId!),
  ]);
  // ... update state
};
```

#### New Handler Functions
```javascript
// Approve a join request
const handleApproveJoinRequest = async (joinRequestId: string) => {
  // Calls: POST /api/enrollment/join-requests/{joinRequestId}/approve
  // Reloads student and join request lists
}

// Reject a join request
const handleRejectJoinRequest = async (joinRequestId: string) => {
  // Prompts teacher for optional reason
  // Calls: POST /api/enrollment/join-requests/{joinRequestId}/reject
  // Reloads lists
}
```

#### New UI Section: Join Requests Panel
Added above the enrolled students list:
```jsx
{joinRequests && joinRequests.length > 0 && (
  <div className="p-4 rounded-lg bg-blue-600/10 border border-blue-500/30">
    <h3 className="text-sm font-semibold text-blue-300 mb-3">
      Pending Join Requests ({joinRequests.length})
    </h3>
    
    {joinRequests.map((request) => (
      <div className="flex items-center justify-between">
        {/* Student info: name, email */}
        {/* Approve button (green checkmark icon) */}
        {/* Reject button (red X icon) */}
      </div>
    ))}
  </div>
)}
```

---

## Data Flow

### Student Requests to Join a Class

```
Student Views Class Page (not enrolled)
  ↓
Check current join request status
  GET /api/classes/{classId}/join-requests
  ↓
If no existing request:
  Show "Request to Join" button
  ↓
Student clicks "Request to Join"
  ↓
POST /api/classes/{classId}/join-request
  └─ Backend creates JoinRequest with status='pending'
  ↓
UI shows "Pending Approval" badge
  ↓
Student waits for teacher approval
```

### Teacher Approves/Rejects Requests

```
Teacher views "Students" tab
  ↓
Load Enrolled Students + Join Requests
  GET /api/classes/{classId}/students
  GET /api/classes/{classId}/join-requests
  ↓
Show Join Requests Panel (if any pending)
  ↓
Teacher clicks approve/reject
  ↓
POST /api/enrollment/join-requests/{id}/approve  OR
POST /api/enrollment/join-requests/{id}/reject
  └─ Backend updates JoinRequest.status
  └─ Backend may auto-create Enrollment on approve
  ↓
Reload lists to show updated status
```

---

## Key Features Implemented

### ✅ Student Join Request Button (Header)
- Visible only for STUDENT role
- Shows button: "Request to Join" (when no existing request)
- On click: Sends `POST /api/classes/{classId}/join-request`
- Shows loading state while processing
- Displays confirmation alert on success

### ✅ Student Join Status Badge
- Displays one of three states:
  - **Pending Approval** (yellow) - request sent, waiting
  - **Approved** (green) - teacher accepted, student now enrolled
  - **Rejected** (red) - teacher rejected the request
- Each status shows with appropriate icon
- Badge remains in header for visual feedback

### ✅ Teacher Approval Panel (Students Tab)
- Shows section only when pending join requests exist
- Displays count: "Pending Join Requests (n)"
- For each pending request shows:
  - Student name
  - Student email
  - Approve button (green checkmark)
  - Reject button (red X)
- Buttons disabled during processing (shows spinner state)
- Can optionally prompt for rejection reason

### ✅ Join Request Status Persistence
- Check status on class selection
- Automatically refreshes after approval/rejection
- Maintains status in per-class state object
- Survives component re-renders

---

## Backend Integration

### Endpoints Used

1. **`POST /api/classes/{classId}/join-request`** (Student)
   - Create pending join request
   - Body: (empty - user from auth)
   - Response: JoinRequest object with status='pending'

2. **`GET /api/classes/{classId}/join-requests`** (Teacher)
   - Get all join requests for a class (can filter by status)
   - Query param: `?status=pending` (optional)
   - Response: JoinRequest[] array

3. **`POST /api/enrollment/join-requests/{joinRequestId}/approve`** (Teacher)
   - Approve a join request
   - Backend should create corresponding Enrollment entry
   - Response: Updated JoinRequest with status='approved'

4. **`POST /api/enrollment/join-requests/{joinRequestId}/reject`** (Teacher)
   - Reject a join request
   - Body: `{ reason?: string }`
   - Response: Updated JoinRequest with status='rejected'

### Database Models Used

**JoinRequest Table** (already exists in schema):
```
- id (string, primary key)
- studentId (foreign key → User.id)
- classId (foreign key → Class.id)
- status (enum: pending, approved, rejected)
- reason (string, nullable - for rejection reason)
- respondedAt (datetime, nullable - when teacher acted)
- createdAt (datetime)
- updatedAt (datetime)
- unique constraint: (classId, studentId)
```

**Enrollment Table** (already exists):
- Auto-created when approval happens (if not already enrolled)
- Tracks `status: 'active' | 'dropped' | 'completed'`

---

## User Experience Flow

### For Students

1. **Browsing Classes**
   - Student sees list of all available classes
   - Can view class info without being enrolled

2. **Requesting to Join**
   - Student clicks "Request to Join" button
   - Button changes to "Pending Approval" badge
   - Student receives confirmation message
   - Waits for teacher to respond

3. **After Teacher Approval**
   - Badge changes to "Approved" (green)
   - Can now access full class content:
     - Overview, Assignments, Attendance
     - See grades, materials, announcements

4. **If Rejected**
   - Badge shows "Rejected" (red)
   - Student may see rejection reason (if provided)
   - Can request to join again if teacher allows

### For Teachers

1. **Managing Students**
   - Teacher goes to "Students" tab
   - Sees two sections:
     - Enrolled students list (with remove option)
     - Pending join requests (with approve/reject)

2. **Reviewing Requests**
   - Shows student name and email
   - Can click approve (green button)
   - Can click reject (red button)
   - May enter rejection reason when prompted

3. **After Decision**
   - Lists auto-refresh
   - Approved students appear in enrolled list
   - Rejected requests disappear from panel
   - Student receives status update in header badge

---

## Files Modified

| File | Changes | Details |
|------|---------|---------|
| `frontend/src/pages/Class.jsx` | Added join request logic | ✓ Header join button, ✓ Join status check, ✓ Request handler |
| `frontend/src/components/class/ClassStudents.tsx` | Added approval panel | ✓ Join requests display, ✓ Approve/reject handlers, ✓ Icons for actions |
| `frontend/src/types/class.types.ts` | Added JoinRequest interface | ✓ Type definition |
| `frontend/src/api/classApi.ts` | Already has methods | ✓ requestToJoinClass, ✓ getJoinRequests, ✓ approveJoinRequest, ✓ rejectJoinRequest |
| Backend routes/controllers | Already implemented | ✓ Ready to use |

---

## Testing Checklist

### Manual Testing - Student Flow
- [ ] Student views class (not enrolled)
- [ ] "Request to Join" button appears in header
- [ ] Click button → "Pending Approval" badge appears
- [ ] Refresh page → Badge persists
- [ ] Wait for teacher approval
- [ ] Badge changes to "Approved" (green)
- [ ] Student can now access class content

### Manual Testing - Teacher Flow
- [ ] Teacher views "Students" tab
- [ ] "Pending Join Requests" section appears (if any)
- [ ] Shows correct student name and email
- [ ] Click approve button
  - Student gets "Approved" badge
  - Student appears in enrolled list
  - Request disappears from pending
- [ ] Test reject button
  - Prompt for optional reason
  - Student gets "Rejected" badge
  - Request disappears from pending

### Edge Cases
- [ ] Multiple students request join - all appear in list
- [ ] Student requests again after rejection - shows button again
- [ ] Teacher refreshes page - pending requests still show
- [ ] No pending requests - panel doesn't appear
- [ ] Error handling - API fails - show error message

---

## Security & Role-Based Access

✅ **Student Join Button**
- Only visible when `userRole === "STUDENT"`
- Only calls POST `/api/classes/{classId}/join-request`
- Backend verifies user is STUDENT via auth middleware

✅ **Teacher Approval Panel**
- Only shown in ClassStudents for `userRole === "TEACHER"`
- Only teacher of that class can approve/reject
- Backend verifies via teacher auth and class ownership

✅ **Backend Protection**
- `/join-request` endpoint requires STUDENT role
- `/join-requests` endpoint requires TEACHER role
- Verify classId ownership before allowing actions
- Check join request exists before approving/rejecting

---

## Future Enhancements

1. **Notifications**
   - Notify teacher when new join request arrives
   - Notify student when request is approved/rejected

2. **Batch Actions**
   - Select multiple join requests
   - Approve/reject all at once

3. **Join Conditions**
   - Teacher can set join requirements (e.g., "requires approval")
   - Auto-approve certain students (by major, year, etc.)
   - Join deadline

4. **Join Request History**
   - Show past approvals/rejections
   - Audit trail for joins

5. **Waiting List**
   - Show students how many are ahead in queue
   - Notify when space becomes available

---

## Architecture Notes

### State Management
- Per-class storage using `selectedId` as key
- Prevents data loss when switching classes
- Clean separation of student vs teacher states

### API Calls
- Batch loading of students + join requests simultaneously
- Reduces waterfall requests
- Better performance

### UI/UX
- Clear visual states (pending/approved/rejected)
- Immediate feedback on actions
- Confirmation dialogs for destructive actions (reject)

### Type Safety
- Full TypeScript with JoinRequest interface
- No `any` types in join request handling
- Compiler catches mistakes early

