# 🚀 KVC WebApp - Quick Start & Testing Guide

## ⚡ Quick Start

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Server runs on: `http://localhost:4001`

### 2. Start Frontend Server  
```bash
cd frontend
npm install
npm run dev
```
App runs on: `http://localhost:5173`

### 3. Login with Mock Tokens

**Teacher Login**:
```
Local Storage Key: access_token
Value: Bearer mock-teacher-token
```

**Student Login**:
```
Local Storage Key: access_token
Value: Bearer mock-student-token
```

Set in browser console:
```javascript
localStorage.setItem('access_token', 'Bearer mock-teacher-token')
// Refresh page to apply
```

---

## 📋 Feature Testing Checklist

### 1. **Announcements** ✅
**Test as Teacher**:
- [ ] Navigate to Home page → see "โพส์ประกาศ" button
- [ ] Click button → modal appears
- [ ] Fill: Class (dropdown), Category, Title, Content, Image
- [ ] Submit → announcement appears in feed
- [ ] Navigate to /announcements page
- [ ] See newly posted announcement

**Test as Student**:
- [ ] Navigate to Home page → see announcements from enrolled classes
- [ ] Click on announcement → view details
- [ ] Check cannot see "โพส์ประกาศ" button
- [ ] Navigate to /announcements → see same announcements

---

### 2. **Assignment System** ✅
**URL**: `/assignment`

**Test as Teacher**:
- [ ] View created assignments
- [ ] See assignment details

**Test as Student**:
- [ ] See assignments from enrolled classes
- [ ] View assignment details
- [ ] View submission status

---

### 3. **Grades & Transcript** ✅
**URL**: `/grades`

- [ ] View student grades by course
- [ ] See GPA calculation
- [ ] View full transcript
- [ ] Check grades are role-filtered

---

### 4. **Exam Schedule** ✅
**URL**: `/exam`

- [ ] View scheduled exams
- [ ] See exam details (date, time, room, duration)
- [ ] Check calendar view
- [ ] Filter by subject/date

---

### 5. **Class Schedule** ✅
**URL**: `/schedule`

- [ ] View weekly/monthly schedule
- [ ] See upcoming classes
- [ ] Check schedule for specific class
- [ ] See class details

---

### 6. **Course Materials** ✅
**URL**: `/resources`

**Test as Teacher**:
- [ ] Upload materials for class
- [ ] See uploaded materials in list

**Test as Student**:
- [ ] Browse materials
- [ ] Download files
- [ ] Filter by class

---

### 7. **Advisor Contact** ✅
**URL**: `/advisor`

- [ ] View assigned advisor info
- [ ] See advisor contact details
- [ ] Browse all advisors directory

---

### 8. **Course Registration** ✅
**URL**: `/register-services`

**Test as Student**:
- [ ] Browse available courses
- [ ] Register for course
- [ ] See registration status
- [ ] Drop course

---

### 9. **Clubs & Activities** ✅
**URL**: `/organization`

**Test as Student**:
- [ ] Browse available clubs
- [ ] Join club
- [ ] View club details

---

### 10. **User Settings** ✅
**URL**: `/settings`

- [ ] Update profile information
- [ ] Change preferences
- [ ] Save settings successfully

---

### 11. **Dashboard (Home)** ✅
**URL**: `/`

- [ ] See personalized welcome greeting
- [ ] View quick status cards (teacher/student roles differ)
- [ ] See live announcement feed
- [ ] View upcoming schedule
- [ ] See important alerts

---

## 🧪 API Testing

### Test Announcements Endpoints

**Get All Announcements**:
```bash
curl -H "Authorization: Bearer mock-teacher-token" \
  http://localhost:4001/api/announcements
```

**Create Announcement**:
```bash
curl -X POST -H "Authorization: Bearer mock-teacher-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "content": "This is a test",
    "classId": "cmiajvle80008vhtwi4cv3xb3",
    "category": "ประกาศ"
  }' \
  http://localhost:4001/api/announcements
```

**Update Announcement**:
```bash
curl -X PATCH -H "Authorization: Bearer mock-teacher-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}' \
  http://localhost:4001/api/announcements/{id}
```

**Delete Announcement**:
```bash
curl -X DELETE -H "Authorization: Bearer mock-teacher-token" \
  http://localhost:4001/api/announcements/{id}
```

---

## 🔑 Test Accounts

### Available Mock Tokens

```javascript
// Teacher
Bearer mock-teacher-token
// ID: teacher-001, Role: TEACHER

// Student  
Bearer mock-student-token
// ID: student-001, Role: STUDENT

// Admin
Bearer mock-admin-token
// ID: admin-001, Role: ADMIN
```

---

## 📱 Responsive Testing

### Mobile View (375px)
- [ ] Navigation sidebar collapses
- [ ] Announcement modal is readable
- [ ] Forms are touch-friendly
- [ ] All buttons clickable

### Tablet View (768px)
- [ ] Layout adapts properly
- [ ] Two-column layouts work
- [ ] Modals centered correctly

### Desktop View (1920px)
- [ ] Full layout displays
- [ ] Sidebar always visible
- [ ] Content spans properly

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal shows: [nodemon] starting 'node src/server.js'
# If errors appear, check console for stack traces
```

### Check Frontend Errors
```bash
# Open DevTools: F12
# Console tab shows all errors
# Network tab shows API calls
```

### Test Mock Auth
```javascript
// In browser console:
localStorage.setItem('access_token', 'Bearer mock-teacher-token')
location.reload()
```

### Test API Directly
```bash
# Use Postman or curl to test endpoints
# Always include Authorization header
```

---

## ✨ Key Features Summary

| Feature | Frontend | Backend | Database | Status |
|---------|----------|---------|----------|--------|
| Announcements | ✅ | ✅ | ✅ | COMPLETE |
| Assignments | ✅ | ✅ | ✅ | COMPLETE |
| Grades | ✅ | ✅ | ✅ | COMPLETE |
| Exams | ✅ | ✅ | ✅ | COMPLETE |
| Schedule | ✅ | ✅ | ✅ | COMPLETE |
| Materials | ✅ | ✅ | ✅ | COMPLETE |
| Advisor | ✅ | ✅ | ✅ | COMPLETE |
| Registration | ✅ | ✅ | ✅ | COMPLETE |
| Clubs | ✅ | ✅ | ✅ | COMPLETE |
| Settings | ✅ | ✅ | ✅ | COMPLETE |
| Dashboard | ✅ | ✅ | ✅ | COMPLETE |

---

## 🎯 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Run `npm install` in both backend and frontend directories

### Issue: "Port 4001 already in use"
**Solution**: Kill process or use different port: `PORT=4002 npm run dev`

### Issue: "Database error"
**Solution**: 
- Check `.env` file has correct DATABASE_URL
- Run migrations: `npx prisma migrate dev`

### Issue: "401 Unauthorized"
**Solution**: 
- Check access_token in localStorage
- Token should be: `Bearer mock-teacher-token`
- Not just the token, include "Bearer " prefix

### Issue: "Announcement not showing"
**Solution**:
- Check you're logged in as teacher or admin
- Check class is selected correctly
- Check browser console for errors

---

## 🚢 Deployment

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Environment Variables
```
# Backend .env
DATABASE_URL=postgresql://...
PORT=4001
HTTPS=0
JWT_SECRET=your-secret

# Frontend .env
VITE_API_BASE=https://api.example.com/api
```

---

## 📞 Support

For issues or questions:
1. Check SYSTEM_COMPLETION_REPORT.md for detailed docs
2. Review git commit history: `git log --oneline`
3. Check backend logs for server errors
4. Open DevTools (F12) to check frontend errors

---

**Happy Testing! 🎉**
