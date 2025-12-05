# ✅ Class System - Verification Checklist

**Date**: 19 November 2025  
**Status**: Ready for Review & Testing  
**Last Updated**: $(date)

---

## 📊 ระบบประเมิน

### ✅ Already Complete
- [x] Database Schema (672 lines, all models defined)
- [x] Backend Controllers (556 lines, all endpoints)
- [x] Backend Services (415 + 264 lines)
- [x] Frontend Components (15 components)
- [x] API Client (525 lines, 28 methods)
- [x] TypeScript Types defined
- [x] Routes registered and working
- [x] CORS configured
- [x] OpenAPI documentation started

---

## 🔴 Critical - Must Fix Now

### 1. Authentication System

#### Problem Statement
```
Frontend shows:
❌ [classApi] Cookie value: NOT FOUND
❌ GET /api/classes 401 Unauthorized

Cause: Token not being sent with requests
```

#### Prerequisites
- [ ] Backend `.env` file created
- [ ] JWT_SECRET = 32+ character string
- [ ] JWT_ACCESS_SECRET = 32+ character string  
- [ ] DATABASE_URL = PostgreSQL connection
- [ ] CORS_ORIGIN = http://localhost:5173

#### Verification Steps

**Step 1: Start Backend**
```bash
cd backend
npm install
npm run dev
# Expected: HTTP listening on http://localhost:4001
```

**Step 2: Test Login with curl**
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher-demo","password":"Teacher123!"}' \
  -i

# Check response headers for:
# Set-Cookie: access_token=eyJ...
```

**Result**:
- [ ] Response 200 (not 500)
- [ ] Set-Cookie header present
- [ ] Token has JWT format

**Step 3: Check Cookie in DevTools**
```
1. Open Frontend: http://localhost:5173
2. Go to Login page
3. Enter: teacher-demo / Teacher123!
4. Click Login
5. Open DevTools → Application → Cookies
6. Look for "access_token" cookie
```

**Result**:
- [ ] Cookie exists with name "access_token"
- [ ] Cookie value is not empty
- [ ] HttpOnly flag is set (can't see value in console)
- [ ] Secure flag off (for localhost)
- [ ] SameSite = Lax

**Step 4: Test Classes API**
```bash
# Get cookie value from DevTools or:
curl -b "access_token=COOKIE_VALUE_HERE" \
  http://localhost:4001/api/classes \
  -H "Content-Type: application/json"

# Expected: Array of classes
```

**Result**:
- [ ] Response 200 (not 401)
- [ ] Classes array returned
- [ ] Can see enrolled classes

---

### 2. Environment Variables

#### Check List
- [ ] `backend/.env` file exists
- [ ] `backend/.env` NOT in git (in .gitignore)
- [ ] All required variables set:
  ```bash
  JWT_SECRET=present
  JWT_ACCESS_SECRET=present
  DATABASE_URL=present
  CORS_ORIGIN=present
  NODE_ENV=development
  PORT=4001
  ```

#### How to Fix
```bash
# Create .env
cd backend
cp .env.example .env
cat > .env << 'EOF'
JWT_SECRET=your_32_character_secret_key_here_1234567890abc
JWT_ACCESS_SECRET=your_access_secret_32_chars_here_1234567890
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kvc_dev
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=4001
EOF
```

#### Verification
- [ ] `backend/.env` readable
- [ ] No syntax errors in values
- [ ] Secrets are strong (32+ chars)
- [ ] Database connection string valid

---

### 3. Duplicate Files

#### Problem
```
Both files exist:
❌ frontend/src/pages/Class.jsx
❌ frontend/src/pages/Class.tsx
```

#### How to Fix
```bash
# List both
ls -lh frontend/src/pages/Class.*

# Remove JSX version
rm frontend/src/pages/Class.jsx

# Verify only TS version remains
ls frontend/src/pages/Class.*
# Should output: Class.tsx only
```

#### Verification
- [ ] Only `Class.tsx` exists
- [ ] No `Class.jsx` in directory
- [ ] No imports reference `.jsx` version

---

## 🟡 Important - Should Fix Soon

### 4. Error Handling (401 Redirect)

#### Check: Frontend Auth Error Handling

**File**: `frontend/src/api/classApi.ts`

**Current**: ⚠️ No error handling for 401
**Needed**: Add try-catch for redirect

```bash
# Verify current state
grep -A5 "getClasses()" frontend/src/api/classApi.ts

# Should show error handling:
# catch (error) {
#   if (error.response?.status === 401) {
#     window.location.href = '/login'
#   }
# }
```

#### Fix Applied
- [ ] Add 401 handling to all classApi methods
- [ ] Redirect to login on auth failure
- [ ] Show error message to user

---

### 5. Frontend Integration

#### Check: AuthContext Implementation

**File**: `frontend/src/context/AuthContext.tsx`

```bash
# Verify exists
test -f frontend/src/context/AuthContext.tsx && echo "✅ EXISTS" || echo "❌ MISSING"
```

#### Needs
- [ ] AuthContext.tsx created
- [ ] useAuth() hook working
- [ ] AuthProvider wraps App in main.jsx
- [ ] Protected component for routes

---

### 6. Backend Login Controller

**File**: `backend/src/controllers/auth.js`

#### Check: Cookie Setting Code
```bash
grep -n "res.cookie" backend/src/controllers/auth.js

# Should show:
# res.cookie('access_token', token, {
#   httpOnly: true,
#   secure: false,
#   sameSite: 'lax',
```

#### Verify
- [ ] login() method exists
- [ ] Creates JWT token
- [ ] Sets cookie with httpOnly: true
- [ ] Returns 200 on success
- [ ] Returns 401 on invalid credentials

---

## 📋 Testing Scenarios

### Scenario 1: Fresh Start Login

```bash
1. Clear all cookies in browser
   DevTools → Application → Cookies → Delete all

2. Start backend (if not running)
   cd backend && npm run dev

3. Start frontend (if not running)
   cd frontend && npm run dev

4. Go to http://localhost:5173/login

5. Try login with:
   Username: teacher-demo
   Password: Teacher123!

6. Check if redirects to classes page

Expected:
✅ No 401 errors
✅ Classes page loads
✅ Classes list visible
✅ No console errors
```

### Scenario 2: Check API Calls

```bash
1. Open DevTools → Network tab
2. Go to /class page
3. Look for GET /api/classes request
4. Click on it and check:
   - Request Headers
   - Response Headers
   - Response Body

Expected:
✅ Request includes Cookie header
✅ Response 200 (not 401)
✅ Response body has classes array
✅ No CORS errors
```

### Scenario 3: Token Expiration

```bash
1. Wait 1 hour (or manually expire token)
2. Try API call
3. Should redirect to /login automatically

Expected:
✅ 401 response
✅ Automatic redirect to /login
✅ User-friendly error message
```

### Scenario 4: Invalid Credentials

```bash
1. Go to /login
2. Enter wrong password
3. Try to submit

Expected:
✅ Error message shown
✅ Not redirected
✅ Can retry login
```

---

## 🔧 Database Verification

### Check: Test Data Exists

```bash
# Run seed script
cd backend
npm run seed:class

# Expected output:
# 🌱 Seeding test data...
# ✅ Teacher user created: teacher-001
# ✅ Student 1 created: student-001
# ✅ Student 2 created: student-002
# ✅ Test class created/updated: clxxxxx
```

### Check: Data in Database

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/kvc_dev

# Run queries
SELECT id, code, name FROM "Class" LIMIT 1;
SELECT id, username, role FROM "User" WHERE role='TEACHER' LIMIT 1;
SELECT COUNT(*) FROM "Enrollment";
```

---

## 📊 Component Health Check

### Frontend Components

```bash
# Check all 15 class components exist
for file in ClassAnnouncements ClassAssignments ClassAssignmentCreator \
            ClassAttendance ClassCreateModal ClassGrades ClassHeader \
            ClassManagement ClassMaterials ClassOverview ClassSchedule \
            ClassSidebar ClassStudents GradeSubmissionModal ManageStudentsModal
do
  test -f "frontend/src/components/class/$file.tsx" \
    && echo "✅ $file.tsx" \
    || echo "❌ $file.tsx MISSING"
done
```

### Backend Services

```bash
# Check service files exist
ls -1 backend/src/services/*service.js | grep -E "class|enrollment" \
  && echo "✅ All class services exist" \
  || echo "❌ Missing services"
```

### Routes

```bash
# Check routes are registered
grep "classRoutes" backend/src/routes/index.js \
  && echo "✅ Class routes registered" \
  || echo "❌ Routes not registered"
```

---

## 🚀 Deployment Checklist

### Before Production

- [ ] All environment variables set
- [ ] Database migrated
- [ ] HTTPS enabled (set HTTPS=1)
- [ ] CORS_ORIGIN set to frontend domain
- [ ] JWT secrets are secure (32+ chars, random)
- [ ] secure: true in cookie settings (for HTTPS)
- [ ] Seed script does NOT run in production
- [ ] Error logging configured
- [ ] Rate limiting configured
- [ ] HTTPS certificates available

### Production Monitoring

- [ ] Monitor 401 errors in logs
- [ ] Monitor failed login attempts
- [ ] Monitor slow API responses
- [ ] Monitor database connections
- [ ] Monitor CPU/memory usage

---

## 📝 Sign-Off

### Verified By
- [ ] Backend Developer
- [ ] Frontend Developer  
- [ ] QA Tester
- [ ] DevOps Engineer

### Testing Completed
- [ ] Unit Tests Passed
- [ ] Integration Tests Passed
- [ ] E2E Tests Passed
- [ ] Performance Tests Passed

### Deployment Approved
- [ ] Code Review Passed
- [ ] Security Review Passed
- [ ] Documentation Complete
- [ ] Ready for Staging
- [ ] Ready for Production

---

## 📞 Troubleshooting Guide

### Problem: 401 Unauthorized

**Checklist**:
1. [ ] Backend is running on 4001
2. [ ] Frontend is on 5173
3. [ ] .env has JWT secrets
4. [ ] Login endpoint returns Set-Cookie
5. [ ] Cookie appears in DevTools
6. [ ] Axios has withCredentials: true
7. [ ] CORS_ORIGIN matches frontend URL

### Problem: CORS Error

**Checklist**:
1. [ ] CORS_ORIGIN in .env
2. [ ] Matches exactly: http://localhost:5173
3. [ ] Backend app.js has cors() middleware
4. [ ] credentials: true in CORS config
5. [ ] Frontend uses withCredentials: true

### Problem: 500 Error on Login

**Checklist**:
1. [ ] Database connected (DATABASE_URL valid)
2. [ ] User table exists
3. [ ] Test users seeded
4. [ ] Password hashing works (bcrypt)
5. [ ] JWT_ACCESS_SECRET set
6. [ ] No syntax errors in auth.js

### Problem: Token Verification Fails

**Checklist**:
1. [ ] JWT_ACCESS_SECRET matches between login & verification
2. [ ] Token format is valid JWT (3 parts separated by .)
3. [ ] Token not expired
4. [ ] Token signed with correct secret
5. [ ] No typos in header Authorization

---

**Created**: November 19, 2025  
**Status**: Active Checklist  
**Version**: 1.0

---

## 📚 Quick Reference

### Test Users
```
Teacher:
  Username: teacher-demo
  Password: Teacher123!
  Role: TEACHER

Student:
  Username: student-demo
  Password: Student123!
  Role: STUDENT
```

### Key URLs
```
Frontend:     http://localhost:5173
Backend:      http://localhost:4001
API:          http://localhost:4001/api
Login:        http://localhost:5173/login
Classes:      http://localhost:5173/class
Swagger:      http://localhost:4001/api/docs (if enabled)
```

### Important Files
```
Backend
  .env                              (CREATE THIS)
  src/controllers/auth.js           (Login handler)
  src/middleware/auth.js            (Token verification)
  src/routes/class.routes.js        (Class endpoints)

Frontend  
  src/context/AuthContext.tsx       (CREATE THIS)
  src/api/classApi.ts               (Update error handling)
  src/pages/Class.tsx               (KEEP only this)
  src/pages/Class.jsx               (DELETE this)
```
