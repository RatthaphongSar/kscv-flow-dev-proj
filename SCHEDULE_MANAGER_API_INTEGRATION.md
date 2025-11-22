# API Integration Details - Schedule Manager

## 📡 Backend API Endpoints

### Schedule Management

#### GET /api/classes/:classId/schedule
**ดึงตารางเรียนของชั้นเรียน**

```typescript
// Request
GET /api/classes/cls-001/schedule

// Response: 200 OK
{
  "data": [
    {
      "id": "sch-001",
      "classId": "cls-001",
      "dayOfWeek": 0,              // 0-6 (Monday-Sunday)
      "startTime": "09:00",
      "endTime": "10:30",
      "room": "302",
      "building": "อาคาร A",
      "type": "lecture",
      "createdAt": "2568-11-22T10:00:00Z",
      "updatedAt": "2568-11-22T10:00:00Z"
    }
  ],
  "status": "success"
}
```

#### POST /api/classes/:classId/schedule
**สร้างตารางเรียนใหม่**

```typescript
// Request
POST /api/classes/cls-001/schedule
Content-Type: application/json

{
  "dayOfWeek": 0,
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "302",
  "building": "อาคาร A",
  "type": "lecture"
}

// Response: 201 Created
{
  "data": {
    "id": "sch-001",
    "classId": "cls-001",
    "dayOfWeek": 0,
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "302",
    "building": "อาคาร A",
    "type": "lecture",
    "createdAt": "2568-11-22T10:30:00Z"
  },
  "status": "created"
}
```

#### PATCH /api/classes/:classId/schedule/:scheduleId
**อัปเดตตารางเรียน**

```typescript
// Request
PATCH /api/classes/cls-001/schedule/sch-001
Content-Type: application/json

{
  "startTime": "10:00",
  "endTime": "11:30",
  "room": "303"
}

// Response: 200 OK
{
  "data": {
    "id": "sch-001",
    "classId": "cls-001",
    "dayOfWeek": 0,
    "startTime": "10:00",
    "endTime": "11:30",
    "room": "303",
    "building": "อาคาร A",
    "type": "lecture",
    "updatedAt": "2568-11-22T10:35:00Z"
  },
  "status": "updated"
}
```

#### DELETE /api/classes/:classId/schedule/:scheduleId
**ลบตารางเรียน**

```typescript
// Request
DELETE /api/classes/cls-001/schedule/sch-001

// Response: 204 No Content
(หรือ)
{
  "status": "deleted"
}
```

---

### Assignment Planning

#### GET /api/classes/:classId/assignments
**ดึงงานทั้งหมดของชั้นเรียน**

```typescript
// Request
GET /api/classes/cls-001/assignments

// Response: 200 OK
{
  "data": [
    {
      "id": "asg-001",
      "classId": "cls-001",
      "title": "บันทึกการทดลอง",
      "description": "ส่งด้วย PDF",
      "type": "homework",
      "maxScore": 100,
      "dueDate": "2568-11-28T23:59:00Z",
      "givenAt": "2568-11-20T00:00:00Z",
      "createdAt": "2568-11-20T10:00:00Z",
      "updatedAt": "2568-11-20T10:00:00Z"
    }
  ],
  "status": "success"
}
```

#### POST /api/classes/:classId/assignment-plans
**สร้างแผนส่งงานใหม่**

```typescript
// Request
POST /api/classes/cls-001/assignment-plans
Content-Type: application/json

{
  "title": "โครงงาน API",
  "description": "สร้าง REST API ด้วย Node.js",
  "assignmentType": "project",
  "maxScore": 100,
  "dueDate": "2568-12-15"
}

// Response: 201 Created
{
  "data": {
    "id": "plan-001",
    "classId": "cls-001",
    "title": "โครงงาน API",
    "description": "สร้าง REST API ด้วย Node.js",
    "assignmentType": "project",
    "maxScore": 100,
    "dueDate": "2568-12-15T23:59:00Z",
    "createdAt": "2568-11-22T10:00:00Z"
  },
  "status": "created"
}
```

#### PATCH /api/classes/:classId/assignment-plans/:planId
**อัปเดตแผนส่งงาน**

```typescript
// Request
PATCH /api/classes/cls-001/assignment-plans/plan-001
Content-Type: application/json

{
  "dueDate": "2568-12-20",
  "maxScore": 120
}

// Response: 200 OK
{
  "data": {
    "id": "plan-001",
    "classId": "cls-001",
    "title": "โครงงาน API",
    "dueDate": "2568-12-20T23:59:00Z",
    "maxScore": 120,
    "updatedAt": "2568-11-22T10:30:00Z"
  },
  "status": "updated"
}
```

#### DELETE /api/classes/:classId/assignment-plans/:planId
**ลบแผนส่งงาน**

```typescript
// Request
DELETE /api/classes/cls-001/assignment-plans/plan-001

// Response: 204 No Content
```

---

### Join Requests

#### GET /api/classes/:classId/join-requests
**ดึงคำขอเข้าร่วมชั้นเรียน (Teacher only)**

```typescript
// Request
GET /api/classes/cls-001/join-requests

// Response: 200 OK
{
  "data": [
    {
      "id": "req-001",
      "studentId": "st-001",
      "studentName": "สมชาย สมหวัง",
      "studentEmail": "somchai@email.com",
      "studentMajor": "วิทยาศาสตร์คอมพิวเตอร์",
      "classId": "cls-001",
      "status": "pending",
      "requestedAt": "2568-11-22T08:30:00Z",
      "approvedAt": null,
      "approvedBy": null,
      "rejectionReason": null
    }
  ],
  "status": "success"
}
```

#### POST /api/classes/:classId/join-request
**นักเรียนส่งคำขอเข้าร่วม**

```typescript
// Request
POST /api/classes/cls-001/join-request
Content-Type: application/json

// Body ว่างหรือ {}

// Response: 201 Created
{
  "data": {
    "id": "req-002",
    "studentId": "st-002",
    "classId": "cls-001",
    "status": "pending",
    "requestedAt": "2568-11-22T09:00:00Z"
  },
  "status": "created"
}
```

#### POST /api/enrollment/join-requests/:requestId/approve
**อนุมัติคำขอเข้าร่วม (Teacher only)**

```typescript
// Request
POST /api/enrollment/join-requests/req-001/approve

// Response: 200 OK
{
  "data": {
    "id": "req-001",
    "status": "approved",
    "approvedAt": "2568-11-22T10:00:00Z",
    "approvedBy": "teacher-001",
    "message": "Join request approved successfully"
  },
  "status": "success"
}
```

#### POST /api/enrollment/join-requests/:requestId/reject
**ปฏิเสธคำขอเข้าร่วม (Teacher only)**

```typescript
// Request
POST /api/enrollment/join-requests/req-001/reject
Content-Type: application/json

{
  "reason": "ขาดข้อมูลที่จำเป็น" // optional
}

// Response: 200 OK
{
  "data": {
    "id": "req-001",
    "status": "rejected",
    "rejectionReason": "ขาดข้อมูลที่จำเป็น",
    "rejectedAt": "2568-11-22T10:05:00Z"
  },
  "status": "success"
}
```

---

## 🔐 Authentication & Headers

### JWT Token
ทุก request ต้องมี authentication:

```typescript
// Header
Authorization: Bearer <jwt_token>
// หรือ (automatic จาก httpOnly cookie)
Cookie: access_token=<jwt_token>
```

### CORS Headers
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid request body",
  "errors": {
    "startTime": "Invalid time format",
    "dayOfWeek": "Must be between 0 and 6"
  }
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "INVALID_TOKEN"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You do not have permission to access this resource",
  "code": "TEACHER_ONLY"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Class not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "code": "SERVER_ERROR"
}
```

---

## 🔄 Frontend API Client Methods

### classApi.ts

```typescript
// Get schedule
getSchedule(classId: string): Promise<ScheduleItem[]>

// Create schedule
createSchedule(classId: string, scheduleData: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  building?: string;
  type?: 'lecture' | 'lab' | 'tutorial';
}): Promise<ScheduleItem>

// Update schedule
updateSchedule(classId: string, scheduleId: string, updateData: any): Promise<ScheduleItem>

// Delete schedule
deleteSchedule(classId: string, scheduleId: string): Promise<void>

// Get assignment plans
getClassAssignments(classId: string): Promise<Assignment[]>

// Create assignment plan
createAssignmentPlan(classId: string, planData: {
  title: string;
  description?: string;
  assignmentType: 'homework' | 'quiz' | 'project' | 'exam';
  maxScore: number;
  dueDate: string;
}): Promise<AssignmentPlan>

// Update assignment plan
updateAssignmentPlan(classId: string, planId: string, updateData: any): Promise<AssignmentPlan>

// Delete assignment plan
deleteAssignmentPlan(classId: string, planId: string): Promise<void>

// Get join requests
getJoinRequests(classId: string, status?: 'pending'): Promise<JoinRequest[]>

// Approve join request
approveJoinRequest(requestId: string): Promise<any>

// Reject join request
rejectJoinRequest(requestId: string, reason?: string): Promise<any>
```

---

## 🔍 Request/Response Examples

### Example 1: ครูเพิ่มตารางเรียน

```typescript
// Frontend Code
const scheduleData = {
  dayOfWeek: 2,              // พุธ
  startTime: "14:00",
  endTime: "15:30",
  room: "405",
  building: "อาคาร B",
  type: "lab"
};

await classApi.createSchedule("cls-001", scheduleData);

// Request sent to backend
POST /api/classes/cls-001/schedule
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "dayOfWeek": 2,
  "startTime": "14:00",
  "endTime": "15:30",
  "room": "405",
  "building": "อาคาร B",
  "type": "lab"
}

// Response
201 Created
{
  "data": {
    "id": "sch-234",
    "classId": "cls-001",
    "dayOfWeek": 2,
    "startTime": "14:00",
    "endTime": "15:30",
    "room": "405",
    "building": "อาคาร B",
    "type": "lab",
    "createdAt": "2568-11-22T11:00:00Z"
  },
  "status": "created"
}
```

### Example 2: ครูอนุมัติคำขอเข้าร่วม

```typescript
// Frontend Code
await classApi.approveJoinRequest("req-123");

// Request sent to backend
POST /api/enrollment/join-requests/req-123/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response
200 OK
{
  "data": {
    "id": "req-123",
    "studentId": "st-456",
    "classId": "cls-001",
    "status": "approved",
    "approvedAt": "2568-11-22T11:05:00Z",
    "approvedBy": "teacher-001"
  },
  "status": "success"
}
```

### Example 3: นักเรียนดึงแผนส่งงาน

```typescript
// Request sent to backend
GET /api/classes/cls-001/assignments
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response
200 OK
{
  "data": [
    {
      "id": "asg-001",
      "classId": "cls-001",
      "title": "บันทึกการทดลอง",
      "type": "homework",
      "maxScore": 50,
      "dueDate": "2568-11-28T23:59:00Z",
      "givenAt": "2568-11-20T00:00:00Z"
    },
    {
      "id": "asg-002",
      "classId": "cls-001",
      "title": "โครงงาน",
      "type": "project",
      "maxScore": 100,
      "dueDate": "2568-12-15T23:59:00Z",
      "givenAt": "2568-11-25T00:00:00Z"
    }
  ],
  "status": "success"
}
```

---

## 🧪 Test API with cURL

### Create Schedule
```bash
curl -X POST http://localhost:5000/api/classes/cls-001/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "302",
    "building": "อาคาร A",
    "type": "lecture"
  }'
```

### Get Schedules
```bash
curl -X GET http://localhost:5000/api/classes/cls-001/schedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Join Request
```bash
curl -X POST http://localhost:5000/api/enrollment/join-requests/req-001/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Join Requests
```bash
curl -X GET http://localhost:5000/api/classes/cls-001/join-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes

1. **Time Format**: ใช้ HH:mm (24-hour format)
2. **Date Format**: ใช้ ISO 8601 (YYYY-MM-DD หรือ YYYY-MM-DDTHH:mm:ssZ)
3. **dayOfWeek**: 0 = Monday, 6 = Sunday
4. **Status**: "pending", "approved", "rejected"
5. **Type**: "lecture", "lab", "tutorial" (schedule)
6. **assignmentType**: "homework", "quiz", "project", "exam"

---

**Version**: 1.0  
**Created**: November 22, 2568  
**Status**: ✅ Ready for integration
