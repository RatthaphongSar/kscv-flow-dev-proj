# Quick Testing Guide

## Test User Credentials

**Database Users (verified):**
- ✅ teacher-demo / Teacher123! → TEACHER role
- ✅ student-demo / Student123! → STUDENT role

## Issue: Frontend not using correct credentials

Frontend logs show attempts with:
- `teacher`, `student1`, `student-123`, `student2` ❌

But should be:
- `teacher-demo`, `student-demo` ✅

## Solution: Frontend Cache Issue

The frontend likely has stale cached credentials. Try:

### Option 1: Clear Browser Cache
1. Open browser DevTools (F12)
2. Go to Application → Clear Site Data
3. Reload page http://localhost:5173/login
4. Click "Demo Teacher" button
5. Should now send `teacher-demo`

### Option 2: Manual Testing
1. Open http://localhost:5173/login
2. Username field: type `teacher-demo`
3. Password field: type `Teacher123!`
4. Click Login
5. Should see "8 tabs" (TEACHER role)

### Option 3: Test with Student
1. Logout
2. Username field: type `student-demo`
3. Password field: type `Student123!`
4. Click Login
5. Should see "5 tabs" (STUDENT role)

## Backend Logs (Expected)

When correct credentials are sent:
```
[Login] Attempting login with username: teacher-demo
[Login] Query result for username 'teacher-demo': Found user teacher-001
```

## Debugging

If still getting "not found" errors:

1. Check backend port: http://localhost:4001
   - Should show "HTTP listening on http://localhost:4001"

2. Check Prisma connection:
   ```bash
   node test-db.js
   ```

3. Test API directly with curl (on Mac/Linux):
   ```bash
   curl -X POST http://localhost:4001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"teacher-demo","password":"Teacher123!"}'
   ```
