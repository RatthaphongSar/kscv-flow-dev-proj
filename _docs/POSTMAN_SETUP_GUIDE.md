# 📦 POSTMAN COLLECTION SETUP GUIDE

**Quick Setup:** Import and run all 66 API tests in Postman  
**Time Required:** 5 minutes  
**Status:** Ready to use  

---

## 🚀 Setup Steps

### 1. Open Postman
- Download: https://www.postman.com/downloads/
- Or use web version: https://web.postman.co/

### 2. Import OpenAPI Specification
```
1. Click "Import" button (top-left)
2. Select "File" tab
3. Browse to: docs/openapi.yaml
4. Click "Import"
→ Automatically creates all endpoints with descriptions
```

### 3. Create Environment Variables
```
Click "Environments" (left sidebar) → "+ Create"

Set these variables:
- base_url: http://localhost:4001/api
- teacher_token: (will auto-populate after login test)
- student_token: (will auto-populate after student login)
- classId: (will populate after list classes test)
- roomId: (will populate after list chat rooms test)
- leaveId: (will populate after create leave test)
```

### 4. Setup Pre-request Script (for auto-login)
```
1. Create new request: POST /auth/login
2. Body (raw JSON):
{
  "username": "teacher-demo",
  "password": "Teacher123!"
}

3. Go to "Tests" tab, add:
if (pm.response.code === 200) {
  const data = pm.response.json();
  pm.environment.set('teacher_token', data.data.access_token);
  pm.environment.set('teacher_refresh', data.data.refresh_token);
  console.log('✓ Teacher token saved');
}

4. Run request → Token auto-saved to environment
```

---

## 📋 Collection Structure

### Auth Requests (8 tests)
- POST `/api/auth/login` - Get JWT token
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/verify` - Verify token

### Class Requests (12 tests)
- GET `/api/classes` - List classes
- GET `/api/classes/:classId` - Get class details
- POST `/api/classes` - Create class (teacher)
- PATCH `/api/classes/:classId` - Update class
- DELETE `/api/classes/:classId` - Delete class
- POST `/api/classes/:classId/enroll` - Enroll student
- GET `/api/classes/:classId/join-requests` - View requests
- PATCH `/api/classes/:classId/join-requests/:id/approve` - Approve

### Chat Requests (11 tests)
- GET `/api/chat/rooms` - List rooms
- POST `/api/chat/rooms` - Create room
- GET `/api/chat/rooms/:roomId/messages` - List messages
- POST `/api/chat/rooms/:roomId/messages` - Send message
- DELETE `/api/chat/rooms/:roomId/messages/:msgId` - Delete message
- POST `/api/chat/rooms/:roomId/pin` - Pin room
- DELETE `/api/chat/rooms/:roomId/pin` - Unpin room
- GET `/api/chat/rooms/pinned` - Get pinned rooms

### Leaves & Attendance (9 tests)
- POST `/api/leaves` - Request leave
- GET `/api/leaves/my` - View my leaves
- PATCH `/api/leaves/:id/status` - Approve/reject leave
- POST `/api/attendance/checkin` - Check-in
- GET `/api/attendance/my` - View attendance
- GET `/api/attendance/class/:classId` - Class attendance

### Clubs & Resources (8 tests)
- GET `/api/clubs` - List clubs
- POST `/api/clubs/enroll` - Enroll club
- GET `/api/clubs/my` - My clubs
- GET `/api/exams` - List exams
- GET `/api/resources` - List resources
- GET `/api/resources/:id/download` - Download resource

### Exports (6 tests)
- GET `/api/export/transcript/pdf` - Export PDF
- GET `/api/export/activities/csv` - Export CSV
- GET `/api/export/attendance/csv` - Export attendance

### Error Handling (12 tests)
- Tests for 401, 403, 404 errors
- Validation error tests
- Rate limiting tests
- CORS tests

---

## ⚙️ Configure Requests

### Add Authorization Header to All Requests

**Option A: Collection-level (Recommended)**
```
1. Right-click Collection → "Edit"
2. Go to "Authorization" tab
3. Type: Bearer Token
4. Token: {{teacher_token}}
5. Click "Update"
→ All requests inherit token automatically
```

**Option B: Request-level**
```
1. Open request
2. Click "Authorization" tab
3. Type: Bearer Token
4. Token: {{teacher_token}}
```

### Test Request with Different Users

```javascript
// In request "Pre-request Script" tab:
// Automatically set token based on test type

// For teacher tests:
pm.environment.set('current_token', pm.environment.get('teacher_token'));

// For student tests:
pm.environment.set('current_token', pm.environment.get('student_token'));

// Use {{current_token}} in Authorization header
```

---

## ▶️ Run All Tests

### Method 1: Collection Runner (Easiest)
```
1. Click "..." next to collection name
2. Select "Run collection"
3. Select environment: "KVC API (Localhost)"
4. Click "Run KVC API"
→ Executes all requests in sequence
→ Shows pass/fail for each request
```

### Method 2: Manual Request Execution
```
1. Click each request in order
2. Click "Send"
3. Review response in "Response" tab
4. Check "Tests" tab for test results
5. Move to next request
```

---

## 📊 Test Scripts (Auto-Validation)

### Login Request - Extract Token
```javascript
// Tests tab content:
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.have.property('data');
});

pm.test("Token returned", function () {
    const data = pm.response.json().data;
    pm.expect(data).to.have.property('access_token');
    pm.environment.set('teacher_token', data.access_token);
});
```

### List Classes - Validate Response
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains classes array", function () {
    const data = pm.response.json();
    pm.expect(data).to.have.property('data');
    pm.expect(data.data).to.be.an('array');
});

pm.test("Extract classId for next requests", function () {
    const classes = pm.response.json().data;
    if (classes.length > 0) {
        pm.environment.set('classId', classes[0].id);
    }
});
```

### Send Message - Real-time Test
```javascript
pm.test("Message sent successfully", function () {
    pm.response.to.have.status(200);
    const data = pm.response.json();
    pm.expect(data.data).to.have.property('id');
    pm.expect(data.data).to.have.property('content');
});

pm.test("Timestamp is recent", function () {
    const data = pm.response.json().data;
    const msgTime = new Date(data.createdAt).getTime();
    const now = new Date().getTime();
    pm.expect(now - msgTime).to.be.below(5000); // Within 5 seconds
});
```

### Error Handling - 401 Test
```javascript
pm.test("Unauthorized error for missing token", function () {
    pm.response.to.have.status(401);
});

pm.test("Error message is descriptive", function () {
    const data = pm.response.json();
    pm.expect(data.error || data.message).to.include('Unauthorized');
});
```

---

## 📈 Expected Results

### Success Indicators ✅
- Status code 200/201 for successful requests
- 401 for unauthorized requests
- 403 for forbidden (insufficient permissions)
- 404 for not found resources
- 400 for validation errors
- 429 for rate limiting

### Response Format
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

Or on error:
```json
{
  "status": "error",
  "error": "Error message",
  "details": "Additional details"
}
```

---

## 🔍 Debugging Tips

### Check Response Body
```
1. Send request
2. Look at "Response" tab
3. Click "Pretty" for formatted view
4. Look for error messages
```

### Check Request Headers
```
1. Click request name
2. Look at "Headers" section
3. Verify Authorization: Bearer {{token}}
4. Check Content-Type: application/json
```

### Enable Logging
```
1. Click "Console" (bottom-left)
2. Send request
3. View console logs for debugging
```

### Export Results
```
1. Run collection
2. Click "Export"
3. Save as JSON
4. Can share with team
```

---

## 🧪 Test Workflow

### Recommended Order (Faster Feedback)

**Phase 1: Setup (5 min)**
```
1. Run: POST /api/auth/login (teacher)
   ✓ Get teacher_token
2. Run: GET /api/classes
   ✓ Get classId
3. Run: GET /api/chat/rooms
   ✓ Get roomId
```

**Phase 2: Core Functionality (30 min)**
```
4. Test all CLASS endpoints
5. Test all CHAT endpoints
6. Test all LEAVE endpoints
7. Test all ATTENDANCE endpoints
```

**Phase 3: Additional Features (20 min)**
```
8. Test EXPORT endpoints
9. Test CLUBS endpoints
10. Test RESOURCES endpoints
```

**Phase 4: Error Handling (15 min)**
```
11. Test 401/403/404 errors
12. Test validation errors
13. Test rate limiting
```

---

## 📝 Creating Custom Tests

### Add New Test Request
```
1. Right-click collection → "Add Request"
2. Name: "Test Name"
3. Method: GET/POST/etc
4. URL: {{base_url}}/endpoint
5. Headers tab:
   - Authorization: Bearer {{current_token}}
   - Content-Type: application/json
6. Body tab (for POST):
   - Raw JSON
7. Tests tab:
   - Add validation scripts
```

### Save Test Data Between Requests
```javascript
// In response Tests tab:
const data = pm.response.json();
pm.environment.set('resourceId', data.data.id);
pm.globals.set('lastMessageId', data.data.messageId);
```

### Reuse in Next Request
```
URL: {{base_url}}/resources/{{resourceId}}/download
```

---

## 📚 Quick Reference

| Action | Steps |
|--------|-------|
| Run all tests | Click "..." on collection → "Run collection" |
| Change user | Update environment: teacher_token / student_token |
| Check specific test | Click request → "Tests" tab |
| View results | Collection runner shows ✅/❌ |
| Export results | Collection runner → "Export" |
| Debug error | Click "Console" at bottom |
| Add bearer token | Authorization tab → "Bearer Token" → {{teacher_token}} |
| See actual request | Click "Code" snippet button |
| Format JSON | Copy JSON → Paste in "Body" → Click "Beautify" |

---

## 🆘 Common Issues

### "Could not resolve variable token"
→ Run login request first to populate token

### "401 Unauthorized"
→ Check Authorization header has "Bearer" prefix
→ Check token hasn't expired (valid 15 minutes)

### "404 Not Found"
→ Check resource ID is correct (from previous request)
→ Verify base_url environment variable

### "400 Bad Request"
→ Check request body JSON is valid
→ Check required fields are included
→ Look at error message in response

---

## 📞 Support

**Issues?** Check:
- API Response tab for error details
- Console for JavaScript errors
- Environment variables are set
- Token is still valid (< 15 min old)
- Backend is running on localhost:4001

---

**Setup Time:** 5-10 minutes  
**Execution Time:** 45 minutes (full collection)  
**Coverage:** All 66 API endpoints  
**Status:** 🟢 Ready to Test
