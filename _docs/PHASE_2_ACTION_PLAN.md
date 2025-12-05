# 🛠️ Phase 2 Action Plan - Backend API Implementation

**Timeline:** 2-3 days  
**Priority:** CRITICAL for deployment  
**Status:** Not Started

---

## 🎯 Objectives

Complete the Backend API implementations that are currently placeholders in Frontend code, so all forms and features can save data to the database.

---

## 📋 Tasks Breakdown

### Task 1: Settings API (6-8 hours)

**Files to Create/Modify:**
```
backend/src/controllers/settings.js (NEW)
backend/src/services/settings.service.js (NEW)
backend/src/routes/settings.js (NEW)
backend/prisma/schema.prisma (UPDATE)
```

**Endpoints to Implement:**
```
GET    /api/settings              - Get user settings
POST   /api/settings              - Save user settings
DELETE /api/settings/:setting     - Delete specific setting
```

**Database Changes:**
```sql
-- Add to Prisma schema
model UserSettings {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  language              String   @default("th")
  theme                 String   @default("dark")
  notifyAnnouncement    Boolean  @default(true)
  notifyAssignment      Boolean  @default(true)
  notifyActivity        Boolean  @default(false)
  autoReminder          Boolean  @default(true)
  studyFocusMode        Boolean  @default(false)
  shareActivity         Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Testing:**
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "language": "th",
    "theme": "dark",
    "notifyAnnouncement": true
  }'
```

---

### Task 2: Export Data API (6-8 hours)

**Files to Create/Modify:**
```
backend/src/controllers/export.js (NEW)
backend/src/services/export.service.js (NEW)
backend/src/routes/export.js (NEW)
```

**Endpoints to Implement:**
```
GET /api/export/transcript/pdf    - Export academic transcript as PDF
GET /api/export/activities/csv    - Export activity record as CSV
GET /api/export/attendance/csv    - Export attendance record as CSV
```

**Dependencies:**
```json
"pdfkit": "^0.13.0",
"csv-stringify": "^6.4.4"
```

**Implementation Hints:**
```javascript
// For PDF generation
import PDFDocument from 'pdfkit'
const doc = new PDFDocument()
doc.pipe(fs.createWriteStream('transcript.pdf'))

// For CSV generation
import { stringify } from 'csv-stringify'
const output = await new Promise((resolve, reject) => {
  stringify(data, (err, output) => {
    if (err) reject(err)
    resolve(output)
  })
})
```

**Testing:**
```bash
# Test PDF export
curl -X GET http://localhost:3000/api/export/transcript/pdf \
  -H "Authorization: Bearer <token>" \
  -o transcript.pdf

# Test CSV export
curl -X GET http://localhost:3000/api/export/activities/csv \
  -H "Authorization: Bearer <token>" \
  -o activities.csv
```

---

### Task 3: Leave Requests API Enhancement (4-6 hours)

**Files to Modify:**
```
backend/src/controllers/leaves.js (UPDATE)
backend/src/services/leaves.service.js (UPDATE)
backend/src/routes/leaves.js (UPDATE)
```

**Endpoints to Ensure:**
```
GET    /api/leaves                - List leave requests
POST   /api/leaves                - Create leave request
GET    /api/leaves/:id            - Get specific leave request
PUT    /api/leaves/:id            - Update leave request
DELETE /api/leaves/:id            - Cancel leave request
```

**Required Fields in Database:**
```prisma
model LeaveRequest {
  id          String   @id @default(cuid())
  userId      String
  type        String   // sick | personal | ordination
  startDate   DateTime
  endDate     DateTime
  fullDay     Boolean
  reason      String
  status      String   @default("pending") // pending | approved | rejected
  fileUrl     String?  // For attachment
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Validation Rules:**
```javascript
// Check overlapping leaves
// Check max days per type (sick: 30, personal: 7, ordination: 60)
// Verify user has not exceeded limits
// Store file attachments in cloud storage
```

---

### Task 4: File Upload API (4-6 hours)

**Files to Create/Modify:**
```
backend/src/middleware/upload.js (UPDATE)
backend/src/controllers/uploads.js (NEW)
backend/src/services/storage.service.js (NEW)
backend/src/routes/uploads.js (NEW)
```

**Endpoints to Implement:**
```
POST   /api/uploads/single        - Upload single file
POST   /api/uploads/multiple      - Upload multiple files
GET    /api/uploads/:id           - Get file info
DELETE /api/uploads/:id           - Delete file
```

**Configuration:**
```javascript
// Use cloud storage (AWS S3, Azure Blob, or local)
// Supported types: PDF, JPG, JPEG, PNG, DOC, DOCX
// Max size: 10MB per file
// Virus scan for production
```

**Implementation:**
```javascript
// Using local storage
const multer = require('multer')
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})
```

---

### Task 5: Exam System API (6-8 hours)

**Files to Create/Modify:**
```
backend/src/controllers/exams.js (UPDATE)
backend/src/services/exams.service.js (UPDATE)
backend/src/routes/exams.js (UPDATE)
backend/prisma/schema.prisma (UPDATE)
```

**Endpoints to Implement:**
```
GET    /api/exams                 - List exams for user
GET    /api/exams/:id             - Get exam details
POST   /api/exams/:id/start       - Start exam session
POST   /api/exams/:id/submit      - Submit exam answers
POST   /api/exams/:id/reminder    - Set exam reminder
```

**Database Schema:**
```prisma
model Exam {
  id          String   @id @default(cuid())
  courseId    String
  type        String   // midterm | final | quiz
  date        DateTime
  time        String
  duration    Int      // in minutes
  status      String   @default("scheduled")
  createdAt   DateTime @default(now())
}

model ExamSession {
  id          String   @id @default(cuid())
  examId      String
  userId      String
  startedAt   DateTime
  submittedAt DateTime?
  score       Float?
  answers     Json
}
```

---

### Task 6: Club Operations API (4-6 hours)

**Files to Create/Modify:**
```
backend/src/controllers/clubs.js (UPDATE)
backend/src/services/clubs.service.js (UPDATE)
backend/src/routes/clubs.js (UPDATE)
```

**Endpoints to Implement:**
```
POST   /api/clubs/:id/join-request   - Send club join request
GET    /api/clubs/:id/members        - Get club members
GET    /api/clubs/:id/pending        - Get pending join requests (admin)
POST   /api/clubs/:id/approve/:uid   - Approve join request (admin)
DELETE /api/clubs/:id/members/:uid   - Remove member (admin)
```

**Validation:**
```javascript
// Check if user already member
// Check if join request already pending
// Verify admin permissions for approval
// Log all changes
```

---

## 🔍 Integration Testing Strategy

### Test Suite Setup
```javascript
// test/api/settings.test.js
describe('Settings API', () => {
  it('should save user settings', async () => {
    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'th', theme: 'dark' })
    expect(response.status).toBe(200)
  })
})
```

### Manual Testing Checklist
```
Settings API:
  [ ] Save settings with valid data
  [ ] Retrieve settings
  [ ] Update settings
  [ ] Error handling for invalid data

Export API:
  [ ] Generate PDF transcript
  [ ] Generate CSV activities
  [ ] File size validation
  [ ] Permission checks

Leave API:
  [ ] Create leave request
  [ ] Validate max days limit
  [ ] Check overlapping leaves
  [ ] Update leave status

Upload API:
  [ ] Upload single file
  [ ] Upload multiple files
  [ ] Validate file type
  [ ] Check file size
  [ ] Retrieve uploaded files

Exam API:
  [ ] List exams
  [ ] Start exam session
  [ ] Submit exam
  [ ] Set reminder

Club API:
  [ ] Send join request
  [ ] List members
  [ ] Approve request
  [ ] Remove member
```

---

## 🚀 Implementation Order

### Day 1
```
Morning:
  - [ ] Settings API (complete)
  - [ ] Unit tests

Afternoon:
  - [ ] Export API (complete)
  - [ ] Integration tests
```

### Day 2
```
Morning:
  - [ ] File Upload API (complete)
  - [ ] Leave Requests Enhancement

Afternoon:
  - [ ] Exam System API (partial)
  - [ ] Testing
```

### Day 3
```
Morning:
  - [ ] Complete Exam System
  - [ ] Club Operations API

Afternoon:
  - [ ] Full integration testing
  - [ ] Bug fixes
  - [ ] Code review
```

---

## 📦 Dependencies to Add

```bash
npm install pdfkit csv-stringify multer bcryptjs dotenv
npm install --save-dev jest supertest
```

---

## ✅ Acceptance Criteria

- [x] All APIs implemented with CRUD operations
- [x] Error handling for all endpoints
- [x] Input validation for all endpoints
- [x] Database migrations complete
- [x] Unit tests for all business logic
- [x] Integration tests passing
- [x] API documentation complete
- [x] Security headers configured
- [x] Rate limiting configured
- [x] Logging implemented

---

## 📝 Documentation to Generate

```
- API Endpoint reference (docs/api-reference.md)
- Database schema diagram
- ER diagram for relationships
- Deployment guide
- Testing guide
- Security guidelines
```

---

## 🎯 Success Criteria

```
✅ All Frontend forms can save data
✅ All API endpoints return proper responses
✅ Error handling working correctly
✅ Data persists in database
✅ Export functionality working
✅ File uploads functional
✅ No console errors
✅ Performance acceptable (< 200ms response time)
```

---

**Ready to start Phase 2? Let's go! 🚀**

