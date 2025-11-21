# KVC WebApp - Test Scripts & Verification Guide

**วันที่**: 2025-11-20  
**สถานะ**: ✅ พร้อมสำหรับทดสอบ

---

## 📋 Quick Start - Testing Class System

### 1. เตรียมสิ่งแวดล้อม

```bash
# ตรวจสอบว่า backend กำลังทำงาน
cd backend
npm run dev
# Expected: Server running on http://localhost:4001

# ใน terminal ใหม่ เริ่ม frontend
cd frontend
npm run dev
# Expected: ➜  Local:   http://localhost:5173/
```

### 2. ทดสอบในเบราว์เซอร์

1. **ไป Login Page**: http://localhost:5173/login
2. **Input credentials**:
   - Username: (ใช้ username จากฐานข้อมูล)
   - Password: (รหัสผ่านของ username นั้น)
3. **Submit**: ควรได้รับ accessToken และ redirect ไป `/chat`
4. **ไปที่ Classes**: คลิก "Classes" ในเมนู หรือ ไปที่ `/class`
5. **ตรวจสอบ**:
   - ✅ ไม่มี mock data
   - ✅ แสดง real classes จากฐานข้อมูล
   - ✅ Overview tab: ข้อมูลจริง (ไม่ใช่ mock)
   - ✅ Assignments tab: assignment จริง
   - ✅ Attendance tab: attendance record จริง
   - ✅ (Teacher): Configuration Status block
   - ✅ (Student): "Request to Join" button

---

## 🧪 Test Scripts - Automated Testing

### Option 1: PowerShell Script (Windows)

```bash
# เปิด PowerShell
cd c:\Users\PC\Downloads\kvc-fullstack

# รัน test script
.\test-complete-system.ps1

# Output ที่คาดหวัง:
# ✓ Backend is reachable
# ✓ Login successful
# ✓ Access token received
# ✓ Classes fetched
# ... และอื่น ๆ
```

**Options:**
```bash
# ระบุ username/password ที่ต่างกัน
.\test-complete-system.ps1 -Username "teacher1" -Password "Pass@1234"

# Verbose mode (แสดงรายละเอียด)
.\test-complete-system.ps1 -Verbose

# ระบุ backend URL ที่ต่างกัน
.\test-complete-system.ps1 -Backend "http://localhost:4002"
```

**Output Example:**
```
╔════════════════════════════════════════╗
║   KVC WebApp - API Test Suite          ║
║   Backend: http://localhost:4001       ║
╚════════════════════════════════════════╝

═══════════════════════════════════════════
1. CONNECTION & INFRASTRUCTURE TESTS
═══════════════════════════════════════════

→ Testing backend connection to http://localhost:4001...
✓ Backend is reachable

═══════════════════════════════════════════
2. AUTHENTICATION & TOKEN TESTS
═══════════════════════════════════════════

→ Testing login with username: testuser...
✓ Login successful (Status: 200)
✓ Access token received
✓ User data received: testuser - Role: STUDENT

... [more tests] ...

═══════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════
 Passed: 15
 Failed: 0
Total:  15

Success Rate: 100%

✓ ALL TESTS PASSED!
```

---

### Option 2: Node.js Script (All Platforms)

```bash
# รัน test script
node test-complete-system.mjs

# ด้วย custom credentials
node test-complete-system.mjs --user teacher1 --pass Pass@1234

# ด้วย custom backend URL
BACKEND_URL=http://localhost:4002 node test-complete-system.mjs
```

**Output**: เหมือนกับ PowerShell script

---

## 🔍 Test Coverage

### Tests ที่รวมอยู่ใน Script

#### 1. Connection & Infrastructure
- ✅ Backend server reachability
- ✅ Health check endpoint (ถ้ามี)
- ✅ CORS configuration
- ✅ Server response time

#### 2. Authentication & Tokens
- ✅ Login with valid credentials
- ✅ Access token generation
- ✅ Refresh token generation
- ✅ Token refresh flow
- ✅ Token validation

#### 3. Class System APIs
- ✅ GET /api/classes (list)
- ✅ GET /api/classes/{id} (details)
- ✅ GET /api/classes/{id}/students
- ✅ GET /api/classes/{id}/assignments
- ✅ GET /api/classes/{id}/attendance

#### 4. Join Request Flow
- ✅ POST /api/classes/{id}/join-request
- ✅ GET /api/classes/{id}/join-requests
- ✅ (Optional) Approval endpoints

#### 5. Error Handling
- ✅ 401 Unauthorized (no token)
- ✅ 403 Forbidden (invalid token)
- ✅ 404 Not Found (non-existent resource)
- ✅ Invalid request handling

#### 6. Database Verification
- ✅ Database connectivity
- ✅ Data structure validation
- ✅ Sample data existence
- ✅ Field validation

---

## 📊 Expected Test Results

### Success Metrics
```
All tests PASS when:
✅ Backend responds on port 4001
✅ PostgreSQL database accessible
✅ Test user exists in database
✅ API endpoints return proper status codes
✅ Token flow works correctly
✅ Class data is returned (not mock)
✅ Error cases handled correctly
```

### Failure Scenarios & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Backend is not responding" | Backend not running | `cd backend && npm run dev` |
| Login fails (401/403) | User doesn't exist | Check database, use valid username |
| "Classes fetched (Count: 0)" | No classes in DB | Insert test classes in DB |
| 401 on class endpoints | Token not sent | Check Authorization header |
| "Database has class data (0 classes)" | DB empty | Run seed script |

---

## 🗄️ Database Setup

### Check if Database is Running

```bash
# PowerShell
psql -U postgres -d kvcdb -c "SELECT 1;"

# Linux/Mac
psql -U postgres -d kvcdb -c "SELECT 1;"

# Expected: Output showing "1" if successful
```

### Check Sample Data

```bash
# Connect to database
psql -U postgres -d kvcdb

# Run these queries:
SELECT COUNT(*) FROM "User";        -- Check users
SELECT COUNT(*) FROM "Class";       -- Check classes
SELECT COUNT(*) FROM "Enrollment";  -- Check enrollments
SELECT COUNT(*) FROM "JoinRequest"; -- Check join requests

# Exit
\q
```

### Seed Sample Data (if needed)

```bash
cd backend

# Seed users
npm run seed:user

# Seed classes
npm run seed:class

# Expected: Users and classes created successfully
```

---

## 🔐 Authentication - Manual Testing

### 1. Login and Get Token

```bash
# PowerShell
$body = @{
    username = "testuser"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:4001/api/auth/login" `
  -Method POST -Body $body -ContentType "application/json"

$response.Content | ConvertFrom-Json | Select-Object accessToken, refreshToken
```

```bash
# Bash/Linux
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@1234"}'

# Output:
# {"accessToken":"eyJ...","refreshToken":"eyJ...","user":{...}}
```

### 2. Use Token to Access Protected Endpoint

```bash
# PowerShell
$token = "eyJ..." # from login response

$headers = @{
    Authorization = "Bearer $token"
}

$response = Invoke-WebRequest -Uri "http://localhost:4001/api/classes" `
  -Method GET -Headers $headers

$response.Content | ConvertFrom-Json | Select-Object -First 3
```

```bash
# Bash/Linux
TOKEN="eyJ..." # from login response

curl -X GET http://localhost:4001/api/classes \
  -H "Authorization: Bearer $TOKEN"

# Output: [{"id":"...","code":"...","name":"..."}, ...]
```

---

## 📝 Class System Verification Checklist

### Frontend Verification

- [ ] **No Mock Data**
  - [ ] Class list shows real data from API
  - [ ] No `mockClasses` in console
  - [ ] No hardcoded "Calculus 101", "Data Structures" in output

- [ ] **Overview Tab**
  - [ ] Shows real class info (code, name, credits, etc.)
  - [ ] Shows real progress summary
  - [ ] (Teacher) Shows configuration status block
  - [ ] (Teacher) Shows student count, assignment count
  - [ ] (Student) Shows personal progress (submitted %, attendance %)

- [ ] **Assignments Tab**
  - [ ] Shows real assignments from API
  - [ ] Not mock assignments
  - [ ] Each assignment has: title, dueDate, maxScore

- [ ] **Attendance Tab**
  - [ ] Shows real attendance records
  - [ ] (Teacher) Shows class-wide statistics
  - [ ] (Student) Shows personal attendance

- [ ] **Join Request Flow**
  - [ ] (Student) "Request to Join" button visible on non-enrolled class
  - [ ] After clicking: badge shows "Pending Approval"
  - [ ] (Teacher) "Pending Join Requests" panel visible in Students tab
  - [ ] (Teacher) Can approve/reject requests
  - [ ] After approval: student sees "Approved" badge

### Backend Verification

- [ ] All API endpoints respond correctly
- [ ] Authentication middleware enforces token
- [ ] 401 returned when no token
- [ ] 401 returned for invalid token
- [ ] Tokens properly validated and refreshed
- [ ] Role-based access control works (STUDENT vs TEACHER)
- [ ] Database queries return real data

### Database Verification

- [ ] PostgreSQL running on localhost:5432
- [ ] Database `kvcdb` exists
- [ ] All tables exist (User, Class, Enrollment, JoinRequest, etc.)
- [ ] Sample data exists in tables
- [ ] Relationships are set up correctly
- [ ] Indices exist for performance

---

## 🚀 Next Steps After Verification

### If All Tests Pass ✅
1. **Code Review**: Review CLASS_SYSTEM_REFACTOR_COMPLETE_SUMMARY.md
2. **Commit Changes**: 
   ```bash
   git add -A
   git commit -m "Complete class system refactor - remove mock data, add real APIs"
   ```
3. **Deploy**: Push to development/staging environment
4. **QA Testing**: Full manual testing by QA team

### If Tests Fail ❌
1. **Check Logs**: Review browser console and backend terminal
2. **Debug**: 
   - Use test script with `--Verbose` flag
   - Check network tab in browser DevTools
   - Verify database connection
3. **Fix Issues**: Address any failing tests
4. **Re-run**: Execute test script again

---

## 📞 Troubleshooting

### Common Issues

**Q: Test script returns "Backend is not responding"**
- A: Make sure backend is running: `cd backend && npm run dev`

**Q: Login fails with "User not found"**
- A: Check database has the user: `SELECT * FROM "User" WHERE username='testuser';`

**Q: Classes endpoint returns empty array**
- A: Insert test classes: `npm run seed:class` in backend folder

**Q: CORS error in frontend**
- A: Check .env CORS_ORIGIN includes `http://localhost:5173`

**Q: Token refresh fails**
- A: Check cookie settings and refresh token in database

**Q: Mock data still appears in frontend**
- A: 
  - Hard refresh browser (Ctrl+Shift+R)
  - Clear browser cache
  - Restart dev server

---

## 📚 Additional Resources

- **Project Structure**: TEST_PROJECT_STRUCTURE.md
- **Class Refactor Summary**: CLASS_SYSTEM_REFACTOR_COMPLETE_SUMMARY.md
- **Phase 1 Details**: CLASS_SYSTEM_REFACTOR_PHASE1.md
- **Phase 2 Details**: CLASS_SYSTEM_REFACTOR_PHASE2.md
- **API Documentation**: docs/openapi.yaml
- **Database Schema**: backend/prisma/schema.prisma

---

## ✅ Conclusion

The class system has been completely refactored to remove mock data and use real database-driven functionality. Use the provided test scripts to verify everything is working correctly.

**Run**: `.\test-complete-system.ps1` (PowerShell) or `node test-complete-system.mjs` (Node.js)

**Expected**: All tests pass with 100% success rate.
