# 🚀 Class/LMS System - Enhanced Features Implementation Guide

**Last Updated**: November 16, 2025  
**Status**: Ready for Database Migration & Integration

---

## 📋 Implementation Summary

This document outlines all new features added to the Class/LMS System to enable:
- ✅ Teacher class creation with bulk student enrollment
- ✅ Advanced assignment submission management
- ✅ Assignment grading with resubmission requests
- ✅ Student join requests for classes
- ✅ Teaching materials sharing (files & links)

---

## 📁 New File Structure

### Backend Files Created/Modified

```
backend/src/
├── services/
│   ├── classEnrollment.service.js          (NEW)
│   ├── assignmentExtended.service.js       (NEW)
│   └── teachingMaterial.service.js         (NEW)
├── controllers/
│   ├── classEnrollment.controller.js       (NEW)
│   ├── assignmentExtended.controller.js    (NEW)
│   └── teachingMaterial.controller.js      (NEW)
├── routes/
│   ├── classEnrollment.routes.js           (NEW)
│   ├── assignmentExtended.routes.js        (NEW)
│   ├── teachingMaterial.routes.js          (NEW)
│   └── index.js                            (MODIFIED - imports new routes)
└── prisma/
    ├── schema.prisma                       (MODIFIED - new models)
    └── migrations/
        └── 20251116130000_add_enrollment_features/
            └── migration.sql               (NEW)
```

### Frontend Files Created/Modified

```
frontend/src/
├── api/
│   └── classApi.ts                         (MODIFIED - new endpoints)
├── components/class/
│   ├── ClassCreateModal.tsx                (NEW)
│   ├── GradeSubmissionModal.tsx            (NEW)
│   ├── ManageStudentsModal.tsx             (NEW)
│   └── ClassMaterials.tsx                  (NEW)
└── hooks/
    └── useAuth.ts                          (existing - already integrated)
```

---

## 🗄️ Database Schema Changes

### New Models Added

#### 1. **JoinRequest**
```prisma
model JoinRequest {
  id              String   @id @default(cuid())
  status          String   @default("pending") // pending, approved, rejected
  reason          String?  // rejection reason
  respondedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  student         User     @relation("StudentJoinRequests", ...)
  studentId       String
  class           Class    @relation("ClassJoinRequests", ...)
  classId         String

  @@unique([classId, studentId])
}
```

#### 2. **TeachingMaterial**
```prisma
model TeachingMaterial {
  id              String   @id @default(cuid())
  title           String
  description     String?
  type            String   // FILE or LINK
  fileUrl         String?
  linkUrl         String?
  fileType        String?  // pdf, docx, etc
  createdBy       String   // teacher ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  class           Class    @relation("ClassMaterials", ...)
  classId         String

  @@index([classId, createdAt])
}
```

### Models Modified

#### 1. **Assignment** - Added Fields
```prisma
+ requiredFilesCount    Int      @default(1)    // จำนวนไฟล์ที่ต้องส่ง
+ maxSubmissionCount    Int      @default(1)    // จำนวนครั้งที่อนุญาตให้ส่ง
```

#### 2. **AssignmentSubmission** - Added Fields
```prisma
+ status              String   @default("not_submitted")
  // Enum: not_submitted, submitted, graded, late, requested_resubmit
+ submissionCount     Int      @default(0)    // จำนวนครั้งที่ส่งแล้ว
```

#### 3. **User** - Added Relation
```prisma
+ studentJoinRequests JoinRequest[] @relation("StudentJoinRequests")
```

#### 4. **Class** - Added Relations
```prisma
+ joinRequests        JoinRequest[] @relation("ClassJoinRequests")
+ materials           TeachingMaterial[] @relation("ClassMaterials")
```

---

## 🔌 API Endpoints

### Enrollment Management
```
GET  /api/enrollment/search/students?q=...&limit=10
POST /api/enrollment/:classId/enroll-multiple
DELETE /api/enrollment/enrollment/:enrollmentId
```

### Join Requests (Student & Teacher)
```
POST   /api/enrollment/:classId/join-request                    (student)
GET    /api/enrollment/:classId/join-requests?status=pending    (teacher)
POST   /api/enrollment/join-requests/:joinRequestId/approve     (teacher)
POST   /api/enrollment/join-requests/:joinRequestId/reject      (teacher)
```

### Assignment Submissions & Grading
```
POST   /api/assignments-ext/:assignmentId/submit                (student)
POST   /api/assignments-ext/:assignmentId/cancel-submission     (student)
POST   /api/assignments-ext/:assignmentId/grade                 (teacher)
POST   /api/assignments-ext/:assignmentId/request-resubmit      (teacher)
GET    /api/assignments-ext/:assignmentId/stats/:classId        (teacher)
```

### Teaching Materials
```
GET    /api/materials/:classId/materials                        (all)
POST   /api/materials/:classId/materials                        (teacher)
PATCH  /api/materials/materials/:materialId                     (teacher)
DELETE /api/materials/materials/:materialId                     (teacher)
```

---

## 🎨 Frontend Components

### 1. **ClassCreateModal.tsx**
**Purpose**: Create new class with bulk student enrollment  
**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: (newClass) => void`

**Features**:
- Form for class details (code, name, section, semester, room, capacity)
- Student search & multi-select
- Bulk enrollment on creation

### 2. **GradeSubmissionModal.tsx**
**Purpose**: Grade individual assignment submissions  
**Props**:
- `isOpen: boolean`
- `submission: StudentSubmission`
- `maxScore: number`
- `assignmentId: string`
- `classId: string`
- `onClose: () => void`
- `onSuccess: () => void`

**Features**:
- View submission details (file, content, metadata)
- Grade with score and feedback
- Option to request resubmission
- Real-time percentage calculation

### 3. **ManageStudentsModal.tsx**
**Purpose**: Manage class enrollment & join requests  
**Props**:
- `isOpen: boolean`
- `classId: string`
- `onClose: () => void`

**Features**:
- Tab 1: View enrolled students, remove students
- Tab 2: View pending join requests, approve/reject

### 4. **ClassMaterials.tsx**
**Purpose**: Display teaching materials (files & links)  
**Props**:
- `classId: string`

**Features**:
- List materials with download/link access
- Add new materials (teacher only)
- Delete materials (teacher only)
- Support for files and external links

---

## 🚀 Setup & Migration Instructions

### Step 1: Update Environment
```bash
# Ensure DATABASE_URL is set in .env
DATABASE_URL="postgresql://user:password@localhost:5432/kvcdb"
```

### Step 2: Run Database Migration
```bash
cd backend

# Run Prisma migration
npx prisma migrate dev --name add_enrollment_features

# Verify migration
npx prisma db push
```

### Step 3: Verify Routes are Mounted
Check that `backend/src/routes/index.js` includes:
```javascript
import classEnrollmentRoutes from './classEnrollment.routes.js'
import assignmentExtendedRoutes from './assignmentExtended.routes.js'
import teachingMaterialRoutes from './teachingMaterial.routes.js'

router.use('/enrollment', classEnrollmentRoutes)
router.use('/assignments-ext', assignmentExtendedRoutes)
router.use('/materials', teachingMaterialRoutes)
```

### Step 4: Install Dependencies (if needed)
```bash
# Backend is already using express-validator
npm install  # backend/

# Frontend has all dependencies already
npm install  # frontend/
```

### Step 5: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 6: Test APIs
```bash
# Use existing test script or create new one
node test-enrollment-features.mjs
```

---

## 🔄 Feature Workflows

### Teacher: Create Class with Students

```
1. Click "Create Class" button in UI
2. ClassCreateModal opens
3. Fill class details (code, name, etc.)
4. Search & select students:
   - Type student name/email in search box
   - Results appear from API (/api/enrollment/search/students)
   - Click to add students to selection list
5. Click "Create Class"
   - Backend: Creates Class record
   - Backend: Creates Enrollment records for all selected students
6. Class appears in teacher's class list
7. Students see class in their list automatically (via GET /api/classes)
```

### Student: Request to Join Class

```
1. Student navigates to "Browse Classes" or similar
2. Sees available classes with "Request to Join" button
3. Clicks button:
   - POST /api/enrollment/:classId/join-request
   - JoinRequest created with status: 'pending'
4. UI shows "Request Pending" state
5. Teacher sees in ManageStudentsModal → Requests tab
6. Teacher clicks "Approve":
   - Enrollment created
   - JoinRequest status → 'approved'
   - Student can now see class in their list
```

### Teacher: Grade Assignment

```
1. In ClassAssignments tab, teacher sees submissions list
2. Clicks on student name / "Grade" button
3. GradeSubmissionModal opens:
   - Shows submission (file/content)
   - Shows current grade/feedback (if exists)
4. Teacher selects action:
   a) "Give Grade":
      - Enters score
      - Enters feedback
      - Clicks "Save"
      - Status → 'graded'
   b) "Request Resubmit":
      - Enters reason/feedback
      - Clicks "Send Request"
      - Status → 'requested_resubmit'
      - Student sees notification
5. On success, modal closes, list updates
```

### Student: Submit Assignment

```
1. In ClassAssignments tab, student clicks on assignment
2. Assignment detail view opens with submit form
3. Student:
   - Uploads file(s) OR pastes content
   - Clicks "Submit"
   - POST /api/assignments-ext/:assignmentId/submit
4. Submission recorded with status: 'submitted' or 'late'
5. Can see:
   - Submission time
   - File/content
   - Current score/feedback (when teacher grades)
6. If status is 'requested_resubmit':
   - Alert shows "Please review feedback and resubmit"
   - Can click "Resubmit" to upload again
```

### Teacher: Share Materials

```
1. In ClassMaterials tab, click "Add Material"
2. Form appears:
   - Title
   - Description
   - Type: File or Link
   - For File: URL + file type (pdf, docx, etc)
   - For Link: URL
3. Click "Save"
   - POST /api/materials/:classId/materials
4. Material appears in list
5. Students see materials with download/link buttons
```

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] POST /api/enrollment/search/students - search works
- [ ] POST /api/enrollment/:classId/enroll-multiple - bulk enroll works
- [ ] POST /api/enrollment/:classId/join-request - create request works
- [ ] GET /api/enrollment/:classId/join-requests - list requests works
- [ ] POST /api/enrollment/join-requests/:id/approve - approval works
- [ ] POST /api/assignments-ext/:id/submit - submit assignment works
- [ ] POST /api/assignments-ext/:id/grade - grade submission works
- [ ] POST /api/assignments-ext/:id/request-resubmit - request resubmit works
- [ ] POST /api/materials/:classId/materials - add material works
- [ ] GET /api/materials/:classId/materials - list materials works

### Frontend Tests
- [ ] ClassCreateModal - form validation, search, selection
- [ ] GradeSubmissionModal - grading, resubmit request
- [ ] ManageStudentsModal - list students, manage requests
- [ ] ClassMaterials - add, delete, view materials
- [ ] Integration - full workflows (create → submit → grade)

---

## 🔐 Security Notes

- ✅ All endpoints check `req.user.role` (TEACHER/STUDENT)
- ✅ Teachers can only modify their own classes
- ✅ Students can only submit/view their own submissions
- ✅ Join requests prevent duplicate submissions
- ✅ Enrollment prevents duplicates with unique constraint

---

## 📊 Usage Examples

### Search Students
```bash
curl "http://localhost:4001/api/enrollment/search/students?q=john&limit=10" \
  -H "Authorization: bearer student-token"
```

### Create Class with Students
```bash
curl -X POST "http://localhost:4001/api/enrollment/classId/enroll-multiple" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer teacher-token" \
  -d '{"studentIds": ["student-001", "student-002"]}'
```

### Submit Assignment
```bash
curl -X POST "http://localhost:4001/api/assignments-ext/assignmentId/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer student-token" \
  -d '{"content": "Answer here", "fileUrl": "https://..."}'
```

### Grade Submission
```bash
curl -X POST "http://localhost:4001/api/assignments-ext/assignmentId/grade" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer teacher-token" \
  -d '{"studentId": "student-001", "score": 85, "feedback": "Good work!"}'
```

---

## 📝 Next Steps

1. **Run Migration**: `npx prisma migrate dev`
2. **Test APIs**: Use curl or Postman with endpoints above
3. **Integrate Components**: Add modals to Class.tsx
4. **Test UI**: Verify all workflows in browser
5. **Deploy**: Follow deployment guide in main README

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution**: 
```bash
# Reset DB if needed (CAUTION - deletes all data)
npx prisma migrate reset

# Or re-run migration
npx prisma migrate dev
```

### Issue: API returns 403 Unauthorized
**Solution**: Ensure Authorization header contains correct role (teacher/student)

### Issue: Students not showing in search
**Solution**: 
- Verify students exist in DB with role = 'STUDENT'
- Check search query length (min 2 characters)

---

## 📚 Related Documentation

- Backend API Spec: See route files for validation rules
- Database Schema: `backend/prisma/schema.prisma`
- Frontend Components: JSDoc comments in component files
- Class System Overview: `CLASS_SYSTEM_COMPLETE.md`

---

**Status**: ✅ Ready for Implementation  
**Last Verified**: November 16, 2025
