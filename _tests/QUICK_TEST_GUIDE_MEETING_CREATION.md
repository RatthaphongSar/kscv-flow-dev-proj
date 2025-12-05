# Quick Test Guide - Teacher Meeting Creation

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Backend running: `cd backend; npm run dev` ✓
- Frontend running: `cd frontend; npm run dev` ✓
- Both servers operational

### Test Credentials
```
Username: teacher1
Password: Teacher123!
```

---

## 🔄 Complete Test Flow

### Step 1: Login (30 seconds)
1. Open browser: http://localhost:5173
2. Click "Login" or go to /login
3. Enter:
   - Username: `teacher1`
   - Password: `Teacher123!`
4. Click "Sign In"
5. **Expected**: Redirect to dashboard, see "teacher1" in top right

✅ **Verify in Browser DevTools**:
- Console: No errors
- Application → Cookies: See `accessToken` cookie
- Application → LocalStorage: See `access_token` value (JWT)

---

### Step 2: Navigate to Create Meeting (15 seconds)
1. From dashboard, click "Create Meeting" or navigate to http://localhost:5173/create-meeting
2. **Expected**: Page loads without error
3. **Expected**: See class dropdown populated with classes

✅ **Verify in Browser DevTools**:
- Network tab: GET /api/classes → 200 status
- Response: Array of classes with ENG-101 visible
- Console: No 401 or 403 errors

---

### Step 3: Create a Meeting (60 seconds)
1. Fill form:
   - **Class**: Select "ENG-101"
   - **Title**: `Test Meeting - $(date)`
   - **Type**: Select "video"
   - **Platform**: Select "zoom"
   - **Start Time**: Tomorrow 10:00 AM
   - **End Time**: Tomorrow 11:00 AM
   - **Description**: "Automated test meeting"
   - **Capacity**: 30
2. Click "Create Meeting"
3. **Expected**: Success page or redirect to meetings list

✅ **Verify in Browser DevTools**:
- Network tab: POST /api/meetings → 200/201 status
- Request headers: Authorization header present with JWT
- Response: Meeting object with ID, title, status="scheduled"
- Console: No errors

---

### Step 4: Verify Meeting in Database (15 seconds)
1. Backend logs should show:
   ```
   POST /api/meetings 201
   [Auth] User authenticated: teacher1
   ```

2. Check database (optional):
   ```bash
   cd backend
   npx prisma studio  # Opens database UI
   # Navigate to Meeting table → Should see new meeting
   ```

✅ **Verify**:
- Meeting created with:
  - `title`: Your title
  - `classId`: ENG-101 ID
  - `teacherId`: teacher1's user ID
  - `status`: "scheduled"
  - `startTime`: ISO8601 format
  - `endTime`: ISO8601 format

---

## 🔍 Troubleshooting

### Issue: Login fails (401 Unauthorized)
**Cause**: Wrong credentials
**Solution**:
- Double-check username: `teacher1` (lowercase)
- Double-check password: `Teacher123!` (case-sensitive)
- Check backend logs for "Login attempt"

### Issue: Create Meeting page shows 401/403
**Cause**: JWT not in request
**Solution**:
- Check browser DevTools → Application → LocalStorage
- Should see `access_token` with long JWT string
- Check Network → Request Headers → Authorization
- Should be: `Bearer eyJhbGc...` (JWT token)

### Issue: Classes dropdown empty
**Cause**: GET /api/classes failed
**Solution**:
- Check Network tab: GET /api/classes should be 200
- Check backend logs: Should show "[Auth] User authenticated"
- Verify JWT is being sent (see Network → Request Headers)

### Issue: Meeting creation fails
**Cause**: Validation or auth error
**Solution**:
- Check form: All required fields filled?
- Check DateTime: Must be ISO8601 (converted automatically)
- Check Network response: What error message?
- Check backend logs: What validation error?

### Issue: Backend not running
**Solution**:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Restart backend
cd backend
npm run dev

# Verify: Should see "HTTP listening on http://localhost:4001"
```

### Issue: Frontend not running
**Solution**:
```bash
# Kill frontend
taskkill /F /IM node.exe

# Restart frontend
cd frontend
npm run dev

# Verify: Should see "Local: http://localhost:5173"
```

---

## 📊 What Was Fixed

### ✅ Backend Authentication
- Added `authRequired` middleware to all 10 meetings routes
- Now properly validates JWT tokens
- `req.user` correctly populated with role
- Controllers can verify teacher role

### ✅ Frontend Code
- Removed mock token setup
- Using real JWT from login response
- Proper Authorization header added by api.js

### ✅ API Flow
- Login → JWT issued → Stored in localStorage
- API request → JWT added to header
- Backend validation → req.user populated
- Meeting creation → Success

---

## 📝 Manual Test Checklist

- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Can navigate to login page: http://localhost:5173/login
- [ ] Can login with teacher1 / Teacher123!
- [ ] Can navigate to /create-meeting
- [ ] Classes load in dropdown
- [ ] Can fill meeting form completely
- [ ] Can click "Create Meeting" button
- [ ] See success message or redirect
- [ ] Meeting appears in meetings list
- [ ] Meeting has correct title and time
- [ ] Backend logs show no errors

---

## 🔐 Security Verification

✅ **JWT Validation**: Every meeting API request requires valid JWT
✅ **Role Enforcement**: Teacher role required to create/edit/delete
✅ **Token Expiration**: Tokens expire after 24 hours
✅ **Secure Cookies**: AccessToken stored in httpOnly cookie
✅ **CORS Protection**: CORS properly configured

---

## 📞 Need Help?

### Backend Issues
- Check: `backend/src/middleware/auth.js` (JWT validation)
- Check: `backend/src/routes/meetings.js` (routes with authRequired)
- Check: `backend/src/controllers/auth.js` (token generation)

### Frontend Issues
- Check: `frontend/src/context/AuthContext.jsx` (token storage)
- Check: `frontend/src/pages/CreateMeeting.jsx` (form submission)
- Check: `frontend/src/api/api.js` (authorization header)

### Database Issues
- Check: `backend/prisma/schema.prisma` (schema)
- Check: `backend/prisma/seed.js` (test data)
- Run: `npx prisma studio` (database UI)

---

*Quick Guide - Authentication & Meeting Creation*  
*Generated: November 28, 2025*
