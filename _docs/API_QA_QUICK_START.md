# 🚀 API QA CHECKLIST - QUICK START GUIDE

**File:** `_docs/API_QA_CHECKLIST.md` (Main reference)  
**Tracking:** `_docs/API_QA_CHECKLIST.csv` (Team collaboration)  
**Status:** Ready to Execute  

---

## ⚡ Quick Start (5 minutes)

### 1. **Open the Checklist**
```bash
# View in your preferred editor
cat _docs/API_QA_CHECKLIST.md

# Or import CSV into Excel
open _docs/API_QA_CHECKLIST.csv
```

### 2. **Start Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Runs on http://localhost:4001

# Terminal 2 - Frontend  
cd frontend
npm run dev  # Runs on http://localhost:5173
```

### 3. **Get Test Token**
```bash
# Login to get JWT token
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}'

# Save the token value from response
# Use in Authorization: Bearer <TOKEN> header for all tests
```

---

## 📊 Test Summary

| Phase | Duration | Tests | Focus |
|-------|----------|-------|-------|
| **1: Auth & Tokens** | 30 min | 8 | Login, refresh, logout, verify JWT |
| **2: Classes** | 45 min | 12 | List, create, enroll, join requests |
| **3: Chat** | 40 min | 11 | Messages, rooms, pin/unpin, WebSocket |
| **4: Leaves & Attendance** | 35 min | 9 | Leave requests, check-in, records |
| **5: Clubs & Resources** | 30 min | 8 | Clubs, exams, resources, downloads |
| **6: Exports** | 25 min | 6 | PDF transcript, CSV export |
| **7: Error Handling** | 20 min | 12 | 401/403/404, validation, security |
| **TOTAL** | **3.5 hrs** | **66** | **All endpoints** |

---

## 🔑 Test Users

| User | Username | Password | Role | Use For |
|------|----------|----------|------|---------|
| **Teacher** | teacher-demo | Teacher123! | TEACHER | Classes, leaves approval, chat rooms |
| **Student** | student-demo | Student123! | STUDENT | Enrollment, attendance, leave requests |
| **Admin** | admin-demo | Admin123! | ADMIN | System management, approvals |

---

## 🧪 Testing Approaches

### Option A: **Postman (Easiest)**
```
1. Open Postman
2. Click "Import" → Select docs/openapi.yaml
3. Sets up all endpoints automatically
4. Set environment: base_url = http://localhost:4001/api
5. Run collection with Pre-request/Tests scripts
```

### Option B: **curl (Command Line)**
```bash
# Example: Test login endpoint
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}' \
  | jq -r '.data.access_token')

# Test with token
curl -X GET http://localhost:4001/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

### Option C: **Browser DevTools**
```javascript
// In browser console while logged into http://localhost:5173
const token = localStorage.getItem('access_token');

// Fetch API call
fetch('http://localhost:4001/api/classes', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.table(d.data))
```

### Option D: **VS Code REST Client Extension**
```http
### Get auth token
POST http://localhost:4001/api/auth/login
Content-Type: application/json

{
  "username": "teacher-demo",
  "password": "Teacher123!"
}

### Use token in next requests
@token = <token from above response>

### List classes
GET http://localhost:4001/api/classes
Authorization: Bearer @token
```

---

## ✅ Phase 1: Authentication (30 min)

### Test 1.1: Login Success
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}'

# Expected: 200 + access_token + refresh_token
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 1.2: Invalid Password
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"wrong"}'

# Expected: 401 Unauthorized
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 1.3-1.8
See full checklist in `_docs/API_QA_CHECKLIST.md` for remaining auth tests.

---

## ✅ Phase 2: Classes (45 min)

### Test 2.1: List Classes
```bash
TOKEN="your_jwt_token_here"
curl -X GET "http://localhost:4001/api/classes?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 + array of classes
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 2.5: Create Class (Teacher only)
```bash
curl -X POST http://localhost:4001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS101",
    "name": "Introduction to Programming",
    "section": "1",
    "credits": 3,
    "capacity": 40
  }'

# Expected: 201 + new class object
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 2.9: Enroll in Class (Student)
```bash
curl -X POST http://localhost:4001/api/classes/CLASS_ID/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Expected: 200 or 400 if already enrolled
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## ✅ Phase 3: Chat (40 min)

### Test 3.1: List Chat Rooms
```bash
curl -X GET http://localhost:4001/api/chat/rooms \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 + array of rooms with pinned status
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 3.5: Send Message
```bash
curl -X POST http://localhost:4001/api/chat/rooms/ROOM_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'

# Expected: 200 + message saved + real-time broadcast
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 3.8: Pin Room
```bash
curl -X POST http://localhost:4001/api/chat/rooms/ROOM_ID/pin \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 + pinned flag set
# Verify 📌 icon appears in UI
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 3.11: WebSocket Real-time
```javascript
// Open browser console on http://localhost:5173
// Type chat messages and verify real-time delivery
// (Messages should appear without page refresh)

// Check: Network tab → WS protocol active
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## ✅ Phase 4: Leaves & Attendance (35 min)

### Test 4.1: Request Sick Leave
```bash
curl -X POST http://localhost:4001/api/leaves \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sick",
    "startDate": "2025-12-10",
    "endDate": "2025-12-10"
  }'

# Expected: 201 + leave created with status=pending
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 4.7: Check-In Attendance
```bash
curl -X POST http://localhost:4001/api/attendance/checkin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "CLASS_ID",
    "date": "2025-12-06",
    "status": "present"
  }'

# Expected: 200 + attendance recorded
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## ✅ Phase 5: Clubs & Resources (30 min)

### Test 5.1: List Clubs
```bash
curl -X GET "http://localhost:4001/api/clubs?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 + paginated clubs
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 5.7: Download Resource
```bash
curl -X GET http://localhost:4001/api/resources/RESOURCE_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_file.pdf

# Expected: 200 + file downloaded with correct MIME type
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## ✅ Phase 6: Exports (25 min)

### Test 6.1: Export Transcript PDF
```bash
curl -X GET http://localhost:4001/api/export/transcript/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -o transcript.pdf

# Expected: 200 + PDF file (open to verify content)
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 6.3: Export Activities CSV
```bash
curl -X GET http://localhost:4001/api/export/activities/csv \
  -H "Authorization: Bearer $TOKEN" \
  -o activities.csv

# Expected: 200 + CSV file (open in Excel to verify)
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## ✅ Phase 7: Error Handling (20 min)

### Test 7.1: Missing Authorization
```bash
curl -X GET http://localhost:4001/api/classes

# Expected: 401 Unauthorized
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 7.3: Malformed JWT
```bash
curl -X GET http://localhost:4001/api/classes \
  -H "Authorization: Bearer invalid.jwt.token"

# Expected: 401 Unauthorized
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

### Test 7.10: Rate Limiting
```bash
# Make 150+ requests in 1 minute (automated script)
# Expected: 429 Too Many Requests after 120 requests

# Check for Retry-After header in response
```
**Status:** ☐ Pass ☐ Fail | **Notes:** _______________

---

## 📋 Critical Path (Must Pass)

✅ **These 10 tests MUST pass for deployment:**

1. ☐ **Auth:** POST `/api/auth/login` returns valid JWT
2. ☐ **Classes:** GET `/api/classes` returns 200 (no 500 error)
3. ☐ **Chat Rooms:** GET `/api/chat/rooms` returns 200
4. ☐ **Messages:** POST `/api/chat/rooms/:id/messages` sends successfully
5. ☐ **Leaves:** POST `/api/leaves` creates request
6. ☐ **Attendance:** POST `/api/attendance/checkin` records check-in
7. ☐ **Export PDF:** GET `/api/export/transcript/pdf` returns file
8. ☐ **WebSocket:** Real-time message delivery via Socket.io
9. ☐ **Auth Error:** Missing token returns 401
10. ☐ **CORS:** Requests from localhost:5173 allowed

---

## 📊 Results Tracking

### Start Testing
- **Start Time:** ___:___
- **Start Date:** __________
- **Tester Name:** ________________
- **Test Environment:** ☐ Localhost ☐ Staging ☐ Production

### Phase Results
| Phase | Tests | Passed | Failed | Notes |
|-------|-------|--------|--------|-------|
| 1: Auth | 8 | ☐ | ☐ | |
| 2: Classes | 12 | ☐ | ☐ | |
| 3: Chat | 11 | ☐ | ☐ | |
| 4: Leaves | 9 | ☐ | ☐ | |
| 5: Clubs | 8 | ☐ | ☐ | |
| 6: Exports | 6 | ☐ | ☐ | |
| 7: Errors | 12 | ☐ | ☐ | |
| **TOTAL** | **66** | **☐** | **☐** | |

### Final Results
- **End Time:** ___:___
- **Total Duration:** ___ minutes
- **Pass Rate:** ___%
- **Recommendation:** ☐ APPROVED ☐ HOLD (Fix Issues)

---

## 🔗 Useful Links

- **Detailed Checklist:** `_docs/API_QA_CHECKLIST.md` (900+ lines)
- **Tracking Spreadsheet:** `_docs/API_QA_CHECKLIST.csv` (78 items)
- **API Documentation:** `docs/openapi.yaml`
- **Backend Routes:** `backend/src/routes/`
- **Backend Setup:** `backend/README.md`
- **Frontend Integration:** `frontend/src/README.md`

---

## 🆘 Troubleshooting

### "Connection refused" on localhost:4001
```bash
# Backend not running. Start it:
cd backend && npm run dev
```

### "401 Unauthorized" with token
```bash
# Token expired or invalid. Get new token:
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}'
```

### "CORS error" from frontend
```bash
# CORS not configured. Check backend/src/middleware/cors.js
# Frontend must be on http://localhost:5173
```

### "404 Not Found" on test
```bash
# Resource ID invalid. Check:
# 1. Correct endpoint path
# 2. Valid resource ID from previous test
# 3. Resource exists in database
```

---

## ✍️ Sign-Off

**Testing Complete:**
- QA Tester: ________________________________ Date: __________
- Lead Reviewer: ______________________________ Date: __________
- Final Approval: ______________________________ Date: __________

**Deployment Decision:** ☐ APPROVED ☐ BLOCKED

---

**Generated:** December 6, 2025  
**Status:** 🟢 Ready for Execution  
**Estimated Time:** 3.5 hours  
**Expected Result:** 100% pass rate (60+ tests passing)
