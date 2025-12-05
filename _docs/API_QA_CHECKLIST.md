# 🔍 API QA CHECKLIST - Pre-Deployment Testing

**Project:** KVC WebApp (Kalasin Vocational College Portal)  
**Date:** December 6, 2025  
**Version:** 1.0  
**Status:** Ready for QA Execution  

---

## 📋 Execution Plan

| Phase | Duration | Focus | Test Items |
|-------|----------|-------|------------|
| **Phase 1** | 30 min | Auth & Tokens | 8 tests |
| **Phase 2** | 45 min | Classes & Enrollment | 12 tests |
| **Phase 3** | 40 min | Chat & Messaging | 11 tests |
| **Phase 4** | 35 min | Leaves & Attendance | 9 tests |
| **Phase 5** | 30 min | Clubs & Resources | 8 tests |
| **Phase 6** | 25 min | Exports & Grades | 6 tests |
| **Phase 7** | 20 min | Error Handling & Edge Cases | 12 tests |
| **TOTAL** | **3.5 hours** | **All Endpoints** | **66 API tests** |

---

## 🔐 PHASE 1: AUTHENTICATION & TOKENS (30 min)

### Environment Setup
- **Backend URL:** http://localhost:4001/api
- **Frontend URL:** http://localhost:5173
- **Test User (Teacher):** `teacher-demo` / `Teacher123!`
- **Test User (Student):** `student-demo` / `Student123!`
- **Test User (Admin):** `admin-demo` / `Admin123!`
- **Tools:** Postman, curl, Browser DevTools

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 1.1 | `/api/auth/login` | POST | Login with valid credentials (teacher) | 200, tokens returned | ⬜ | Check access_token & refresh_token |
| 1.2 | `/api/auth/login` | POST | Login with invalid username | 401 Unauthorized | ⬜ | Error message present |
| 1.3 | `/api/auth/login` | POST | Login with invalid password | 401 Unauthorized | ⬜ | Error message present |
| 1.4 | `/api/auth/login` | POST | Login with empty body | 400 Bad Request | ⬜ | Validation error |
| 1.5 | `/api/auth/refresh` | POST | Refresh token with valid refresh token | 200, new access token | ⬜ | Old token valid for 15m |
| 1.6 | `/api/auth/refresh` | POST | Refresh with expired token | 401 Unauthorized | ⬜ | Must re-login |
| 1.7 | `/api/auth/logout` | POST | Logout with valid token | 200 | ⬜ | Tokens cleared |
| 1.8 | `/api/auth/verify` | GET | Verify valid JWT token | 200, user data | ⬜ | Contains role & user info |

### Phase 1 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 👥 PHASE 2: CLASSES & ENROLLMENT (45 min)

### Test Credentials
- **Teacher Role:** Can create, edit, delete classes
- **Student Role:** Can view, enroll, get summary
- **Admin Role:** Can manage all

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 2.1 | `/api/classes` | GET | List all classes (student) | 200, array of classes | ⬜ | Check pagination |
| 2.2 | `/api/classes` | GET | List classes with filters | 200, filtered results | ⬜ | Filter by semester/major |
| 2.3 | `/api/classes/:classId` | GET | Get class details | 200, class info | ⬜ | Includes members & schedule |
| 2.4 | `/api/classes/:classId/summary` | GET | Get class summary (student) | 200, summary data | ⬜ | Attendance, grades, materials |
| 2.5 | `/api/classes` | POST | Create class (teacher) | 201, new class | ⬜ | Check auto-generated code |
| 2.6 | `/api/classes` | POST | Create class (student) | 403 Forbidden | ⬜ | Role-based access |
| 2.7 | `/api/classes/:classId` | PATCH | Update class (teacher) | 200, updated data | ⬜ | Can update name, room, etc. |
| 2.8 | `/api/classes/:classId` | DELETE | Delete class (teacher) | 200 | ⬜ | Check cascade delete |
| 2.9 | `/api/classes/:classId/enroll` | POST | Enroll in class | 200 | ⬜ | Duplicate enrollment rejected |
| 2.10 | `/api/classes/:classId/enroll` | POST | Enroll in full class | 400 Bad Request | ⬜ | Capacity check |
| 2.11 | `/api/classes/:classId/join-requests` | GET | View join requests (teacher) | 200, requests array | ⬜ | Student role returns 403 |
| 2.12 | `/api/classes/:classId/join-requests/:requestId/approve` | PATCH | Approve join request | 200 | ⬜ | Student gets enrolled |

### Phase 2 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 💬 PHASE 3: CHAT & MESSAGING (40 min)

### WebSocket & Socket.io Testing
- Real-time message delivery
- Room pin/unpin functionality
- File upload support

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 3.1 | `/api/chat/rooms` | GET | List chat rooms (authenticated) | 200, array of rooms | ⬜ | Check pinned status |
| 3.2 | `/api/chat/rooms` | GET | List rooms (unauthenticated) | 401 Unauthorized | ⬜ | Auth required |
| 3.3 | `/api/chat/rooms` | POST | Create room (teacher) | 201, room created | ⬜ | Verify room code auto-generated |
| 3.4 | `/api/chat/rooms/:roomId/messages` | GET | List messages in room | 200, paginated messages | ⬜ | Newest first, pagination works |
| 3.5 | `/api/chat/rooms/:roomId/messages` | POST | Send text message | 200, message saved | ⬜ | Message broadcasts to room |
| 3.6 | `/api/chat/rooms/:roomId/messages` | POST | Send message with file attachment | 200, file uploaded | ⬜ | File size < 50MB |
| 3.7 | `/api/chat/rooms/:roomId/messages/:msgId` | DELETE | Delete own message | 200 | ⬜ | Others can't delete |
| 3.8 | `/api/chat/rooms/:roomId/pin` | POST | Pin room | 200, pinned=true | ⬜ | 📌 icon shows in UI |
| 3.9 | `/api/chat/rooms/:roomId/pin` | DELETE | Unpin room | 200, pinned=false | ⬜ | Remove from pinned list |
| 3.10 | `/api/chat/rooms/pinned` | GET | Get pinned rooms | 200, pinned list | ⬜ | Filter shows only pinned |
| 3.11 | Socket.io | WS | Real-time message delivery | Message appears immediately | ⬜ | Via WebSocket, not polling |

### Phase 3 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 📅 PHASE 4: LEAVES & ATTENDANCE (35 min)

### Leave Types
- Sick (requires doctor cert if > 2 days)
- Personal
- Ordination
- Other

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 4.1 | `/api/leaves` | POST | Request sick leave (1 day) | 201, leave created | ⬜ | status = 'pending' |
| 4.2 | `/api/leaves` | POST | Request sick leave (3 days) | 201, requires cert | ⬜ | Flag doctor cert needed |
| 4.3 | `/api/leaves` | POST | Request with invalid dates | 400 Bad Request | ⬜ | endDate > startDate |
| 4.4 | `/api/leaves/my` | GET | View my leave requests | 200, array | ⬜ | Only own requests shown |
| 4.5 | `/api/leaves/:id/status` | PATCH | Approve leave (advisor) | 200, approved | ⬜ | Student gets notification |
| 4.6 | `/api/leaves/:id/status` | PATCH | Reject leave with reason | 200, rejected | ⬜ | Reason stored |
| 4.7 | `/api/attendance/checkin` | POST | Check-in present | 200, attendance recorded | ⬜ | Timestamp recorded |
| 4.8 | `/api/attendance/my` | GET | View my attendance | 200, monthly records | ⬜ | Present/absent/late stats |
| 4.9 | `/api/attendance/class/:classId` | GET | View class attendance (teacher) | 200, all students | ⬜ | Student role gets 403 |

### Phase 4 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 🏫 PHASE 5: CLUBS & RESOURCES (30 min)

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 5.1 | `/api/clubs` | GET | List all clubs | 200, paginated | ⬜ | Check pagination params |
| 5.2 | `/api/clubs?page=2&limit=10` | GET | Pagination test | 200, correct offset | ⬜ | page & limit params work |
| 5.3 | `/api/clubs/enroll` | POST | Enroll in club | 200 | ⬜ | Duplicate enrollment rejected |
| 5.4 | `/api/clubs/my` | GET | View my clubs | 200, array of clubs | ⬜ | Includes membership status |
| 5.5 | `/api/exams` | GET | List exam schedule | 200, exams list | ⬜ | Check date sorting |
| 5.6 | `/api/resources` | GET | List resources | 200, resources array | ⬜ | Check filter by type |
| 5.7 | `/api/resources/:resourceId/download` | GET | Download resource | 200, file stream | ⬜ | Correct content-type header |
| 5.8 | `/api/resources/:resourceId/download` | GET | Download non-existent resource | 404 Not Found | ⬜ | Proper error message |

### Phase 5 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 📊 PHASE 6: EXPORTS & GRADES (25 min)

### Test Cases

| # | Endpoint | Method | Test Case | Expected | Status | Notes |
|---|----------|--------|-----------|----------|--------|-------|
| 6.1 | `/api/export/transcript/pdf` | GET | Export transcript as PDF | 200, PDF file | ⬜ | Verify PDF opens correctly |
| 6.2 | `/api/export/transcript/pdf` | GET | PDF contains correct data | Valid data | ⬜ | Student name, ID, grades |
| 6.3 | `/api/export/activities/csv` | GET | Export activities as CSV | 200, CSV file | ⬜ | Verify CSV opens in Excel |
| 6.4 | `/api/export/attendance/csv` | GET | Export attendance as CSV | 200, CSV file | ⬜ | Month, present/absent/late |
| 6.5 | `/api/grades` | GET | List grades | 200, grades array | ⬜ | Check GPA calculation |
| 6.6 | `/api/grades/class/:classId` | GET | Class grades (teacher) | 200, all students | ⬜ | Student role gets 403 |

### Phase 6 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## ⚠️ PHASE 7: ERROR HANDLING & EDGE CASES (20 min)

### Test Cases

| # | Scenario | Endpoint | Expected Behavior | Status | Notes |
|---|----------|----------|-------------------|--------|-------|
| 7.1 | Missing auth token | ANY | 401 Unauthorized | ⬜ | Clear error message |
| 7.2 | Expired auth token | ANY | 401 Unauthorized | ⬜ | Refresh token offered |
| 7.3 | Invalid auth token | ANY | 401 Unauthorized | ⬜ | Malformed JWT rejected |
| 7.4 | Insufficient permissions | POST /classes | 403 Forbidden | ⬜ | Student can't create class |
| 7.5 | Invalid request body | POST /leaves | 400 Bad Request | ⬜ | Validation errors listed |
| 7.6 | Non-existent resource | GET /classes/fake-id | 404 Not Found | ⬜ | Friendly error message |
| 7.7 | Duplicate enrollment | POST /classes/:id/enroll | 400 Bad Request | ⬜ | "Already enrolled" message |
| 7.8 | Class at capacity | POST /classes/:id/enroll | 400 Bad Request | ⬜ | "Class full" message |
| 7.9 | Invalid file upload | POST /chat/messages | 400 Bad Request | ⬜ | File size exceeded |
| 7.10 | Rate limiting | Rapid requests (>120/min) | 429 Too Many Requests | ⬜ | Retry-After header present |
| 7.11 | CORS preflight | OPTIONS request | 200 with CORS headers | ⬜ | From localhost:5173 |
| 7.12 | SQL injection attempt | POST /auth/login | 400/401, no error leak | ⬜ | No SQL error in response |

### Phase 7 Sign-Off
- **Tester:** ________________  
- **Date:** ________________  
- **All Passed:** ☐ YES ☐ NO  
- **Issues Found:** ________________________________

---

## 📱 CRITICAL ENDPOINTS CHECKLIST

### Must Pass (Blocking Issues)
- ⬜ POST `/api/auth/login` - Returns valid JWT token
- ⬜ GET `/api/classes` - Lists classes without 500 error
- ⬜ GET `/api/chat/rooms` - Real-time chat loads
- ⬜ POST `/api/chat/rooms/:id/messages` - Messages send successfully
- ⬜ GET `/api/leaves/my` - My leaves display
- ⬜ POST `/api/attendance/checkin` - Check-in works
- ⬜ GET `/api/export/transcript/pdf` - PDF exports without error
- ⬜ WebSocket connection - Chat real-time delivery works
- ⬜ 401/403/404 errors - Return proper HTTP status codes
- ⬜ CORS headers - Requests from frontend allowed

### Should Pass (High Priority)
- ⬜ File uploads work (chat messages)
- ⬜ Pagination works (classes, clubs, messages)
- ⬜ Role-based access control enforced
- ⬜ Validation errors have clear messages
- ⬜ Timestamps consistent across APIs
- ⬜ Database transactions atomic

### Nice to Have (Medium Priority)
- ⬜ CSV exports are well-formatted
- ⬜ PDF exports are styled nicely
- ⬜ Error rates < 0.1%
- ⬜ Response times < 500ms average
- ⬜ File cleanup after export

---

## 🔧 TESTING TOOLS & COMMANDS

### Using Postman
```bash
# Import API collection
1. Open Postman
2. Click "Import" → Select openapi.yaml from docs/
3. Auto-generates all endpoints
4. Set environment variables: base_url, token, classId
5. Run tests in sequence
```

### Using curl (Command Line)
```bash
# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}'

# List classes (with token)
curl -X GET http://localhost:4001/api/classes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send message
curl -X POST http://localhost:4001/api/chat/rooms/ROOM_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'
```

### Using JavaScript/Node.js
```javascript
// Login
const res = await fetch('http://localhost:4001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'teacher-demo', password: 'Teacher123!' })
});
const { data: { access_token } } = await res.json();

// Get classes
const classes = await fetch('http://localhost:4001/api/classes', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

---

## 📊 TEST EXECUTION SUMMARY

### Overall Results
| Category | Total | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Auth | 8 | ⬜ | ⬜ | ⬜ |
| Classes | 12 | ⬜ | ⬜ | ⬜ |
| Chat | 11 | ⬜ | ⬜ | ⬜ |
| Leaves/Attendance | 9 | ⬜ | ⬜ | ⬜ |
| Clubs/Resources | 8 | ⬜ | ⬜ | ⬜ |
| Exports/Grades | 6 | ⬜ | ⬜ | ⬜ |
| Error Handling | 12 | ⬜ | ⬜ | ⬜ |
| **TOTAL** | **66** | **⬜** | **⬜** | **⬜** |

### Success Criteria
- ✅ **Pass Rate:** ≥ 95% (max 3 failures)
- ✅ **Critical Path:** 100% (all 10 critical endpoints pass)
- ✅ **Error Handling:** No SQL errors, XSS, or security issues
- ✅ **Response Times:** 90% under 500ms
- ✅ **No 5xx Errors:** Only 4xx/2xx responses

---

## ✍️ FINAL SIGN-OFF

### QA Lead Sign-Off
- **Name:** ________________________________
- **Date:** ________________________________
- **Recommendation:** ☐ Approve for Deploy ☐ Hold (Issues to Fix)
- **Issues Summary:** ________________________________
  ________________________________
  ________________________________

### Development Lead Review
- **Name:** ________________________________
- **Date:** ________________________________
- **Review Status:** ☐ Approved ☐ Needs Fixes ☐ Blocked
- **Comments:** ________________________________
  ________________________________

### DevOps/Infrastructure Sign-Off
- **Name:** ________________________________
- **Date:** ________________________________
- **Deployment Ready:** ☐ YES ☐ NO
- **Notes:** ________________________________
  ________________________________

### Project Manager Final Approval
- **Name:** ________________________________
- **Date:** ________________________________
- **Production Deploy:** ☐ APPROVED ☐ HOLD
- **Deployment Date:** ________________________________

---

## 📚 REFERENCES

### API Documentation
- OpenAPI Spec: `docs/openapi.yaml`
- Postman Collection: `_assets/kvc-api-collection.json`
- Backend Routes: `backend/src/routes/`

### Environment & Setup
- Backend: `backend/.env` (configure JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
- Frontend: `frontend/.env` (configure API_URL=http://localhost:4001/api)
- Database: PostgreSQL connection in `backend/.env`

### Related Documentation
- See `README.md` for project overview
- See `API_FIX_TESTING_GUIDE.md` for integration details
- See `FINAL_DELIVERY_SUMMARY.md` for project status

---

## 🎯 Key Metrics to Track

```
Start Time:     ___:___
End Time:       ___:___
Total Duration: ___ minutes

Tester:         ________________________________
Date:           ________________________________
Environment:    ☐ Localhost ☐ Staging ☐ Production
OS/Browser:     ________________________________
```

**Generated:** December 6, 2025  
**Version:** 1.0 - Initial QA Checklist for Pre-Deployment Testing  
**Status:** 🟢 Ready for Execution
