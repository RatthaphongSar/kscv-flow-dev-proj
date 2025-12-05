# Schedule API Route Fix - Summary

## Problem Identified

When trying to create a schedule from the frontend, the following error occurred:

```
POST http://localhost:4001/api/classes/cmi91xaci0001vhncifp3vnkx/schedule 404 (Not Found)
Error: Not Found
```

The issue was that the schedule creation endpoints were not mounted under the `/api/classes/:classId/schedule` path.

## Root Cause

The backend had:
- Schedule routes in `backend/src/routes/schedule.js` mounted at `/api/schedule`
- No routes for schedule management at `/api/classes/:classId/schedule`
- Frontend was trying to access: `POST /api/classes/{classId}/schedule`
- Backend was not providing this endpoint

## Solution Implemented

### 1. Added Routes to `class.routes.js`

Added the following routes under the Classes endpoint:

#### Schedule Management Routes:
```javascript
// Create schedule for a class
POST /:classId/schedule
  - Required fields: dayOfWeek, startTime, endTime
  - Optional fields: room, building, scheduleType

// Update schedule
PATCH /:classId/schedule/:scheduleId
  - All fields optional

// Delete schedule
DELETE /:classId/schedule/:scheduleId
```

#### Assignment Plan Routes:
```javascript
// Create assignment plan
POST /:classId/assignment-plans
  - Required fields: title
  - Optional fields: assignmentType, maxScore, dueDate

// Update assignment plan
PATCH /:classId/assignment-plans/:planId
  - All fields optional

// Delete assignment plan
DELETE /:classId/assignment-plans/:planId
```

### 2. Added Controller Methods to `class.controller.js`

Implemented the following methods:

**Schedule Management:**
- `createClassSchedule()` - Creates a new schedule entry
- `updateClassSchedule()` - Updates an existing schedule
- `deleteClassSchedule()` - Deletes a schedule

**Assignment Plan Management:**
- `createClassAssignmentPlan()` - Creates an assignment plan
- `updateClassAssignmentPlan()` - Updates an assignment plan
- `deleteClassAssignmentPlan()` - Deletes an assignment plan

All methods include:
- Role-based access control (TEACHER only)
- Request validation
- Error handling
- Proper HTTP status codes

### 3. Added Service Methods to `class.service.js`

Implemented corresponding service layer methods:

**Schedule Methods:**
- `createSchedule()` - Insert schedule into database
- `updateSchedule()` - Update schedule record
- `deleteSchedule()` - Remove schedule from database

**Assignment Plan Methods:**
- `createAssignmentPlan()` - Insert assignment plan (uses Assignment model)
- `updateAssignmentPlan()` - Update assignment plan
- `deleteAssignmentPlan()` - Delete assignment plan

## Database Mapping

The backend uses the existing `Assignment` model for assignment plans since there is no separate `AssignmentPlan` model in the schema.

### Schedule Model Fields:
- `id` - Unique identifier
- `classId` - Associated class
- `dayOfWeek` - 0-6 (Sunday-Saturday)
- `startTime` - Time string (HH:MM)
- `endTime` - Time string (HH:MM)
- `room` - Room number/name
- `building` - Building name
- `scheduleType` - Type of session (lecture, lab, tutorial, etc.)

### Assignment (for plans) Model Fields:
- `id` - Unique identifier
- `classId` - Associated class
- `teacherId` - Teacher who created it
- `title` - Assignment title
- `assignmentType` - homework, quiz, project, exam
- `maxScore` - Maximum points
- `dueDate` - Deadline

## Security Features

1. **Authentication**: All routes require valid JWT authentication
2. **Authorization**: Only teachers can create/update/delete schedules and assignment plans
3. **Input Validation**: Express-validator used for all request data
4. **Role Checking**: Middleware checks user role and returns 403 if not TEACHER

## Testing

### Manual Test (After Restart):

```bash
# Backend should log successful restarts with:
# [Assistant] mounted at /api/assistant
# HTTP listening on http://localhost:4001
```

### Frontend Test:

The frontend components can now:
1. Create schedules via `classApi.createSchedule()`
2. Update schedules via `classApi.updateSchedule()`
3. Delete schedules via `classApi.deleteSchedule()`
4. Create assignment plans via `classApi.createAssignmentPlan()`
5. Update assignment plans via `classApi.updateAssignmentPlan()`
6. Delete assignment plans via `classApi.deleteAssignmentPlan()`

## Files Modified

1. **backend/src/routes/class.routes.js**
   - Added 6 new route handlers (POST, PATCH, DELETE for schedules and assignment plans)

2. **backend/src/controllers/class.controller.js**
   - Added 6 new controller methods with full error handling

3. **backend/src/services/class.service.js**
   - Added 6 new service methods for database operations

## Backend Restart Required

✅ Backend has been restarted to load the new routes.

## Next Steps

1. ✅ Open frontend in browser
2. ✅ Login as teacher
3. ✅ Navigate to a class
4. ✅ Click "จัดการตารางเรียน" (Schedule Manager) tab
5. ✅ Try creating, updating, or deleting a schedule
6. ✅ Try creating, updating, or deleting an assignment plan

The error should now be resolved and schedules/assignments can be created successfully!

## API Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/classes/{classId}/schedule` | Get all schedules for a class |
| POST | `/api/classes/{classId}/schedule` | Create a new schedule |
| PATCH | `/api/classes/{classId}/schedule/{scheduleId}` | Update a schedule |
| DELETE | `/api/classes/{classId}/schedule/{scheduleId}` | Delete a schedule |
| POST | `/api/classes/{classId}/assignment-plans` | Create assignment plan |
| PATCH | `/api/classes/{classId}/assignment-plans/{planId}` | Update assignment plan |
| DELETE | `/api/classes/{classId}/assignment-plans/{planId}` | Delete assignment plan |

All endpoints require:
- Valid JWT authentication
- User to have TEACHER role (except GET endpoints for students)
- Proper request body validation

---

**Status**: ✅ FIXED  
**Commit**: Latest  
**Ready to Test**: YES
