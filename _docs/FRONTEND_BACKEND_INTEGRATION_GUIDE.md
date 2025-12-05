# ⚡ Frontend-Backend Integration Quick Reference

**Status:** ✅ 100% COMPLETE  
**Date:** December 6, 2025

---

## 🔗 Pages & Their API Connections

### 1. Settings.jsx
**Location:** `frontend/src/pages/Settings.jsx`  
**Updated Functions:**
- `handleSaveSettings()` → `PATCH /api/settings/preferences`
- Export PDF button → `GET /api/export/transcript/pdf`
- Export Activities CSV → `GET /api/export/activities/csv`
- Export Attendance CSV → `GET /api/export/attendance/csv`

**Key Code:**
```javascript
const response = await api('/settings/preferences', {
  method: 'PATCH',
  body: { language, theme, notifications, studyFocusMode, shareActivity }
})
```

---

### 2. RegisterServices.jsx (Leaves)
**Location:** `frontend/src/pages/RegisterServices.jsx`  
**Updated Functions:**
- `fetchLeaveRequests()` → `GET /api/leaves/my-requests`
- `handleSubmitLeave()` → `POST /api/leaves/request`

**Key Code:**
```javascript
// Fetch leave requests
const response = await api("/leaves/my-requests", { method: "GET" })

// Submit new leave request
const response = await api("/leaves/request", {
  method: "POST",
  body: { type, startDate, endDate, fullDay, reason }
})
```

---

### 3. Resources.jsx
**Location:** `frontend/src/pages/Resources.jsx`  
**Updated Functions:**
- `fetchResources()` → `GET /api/resources`
- Download button → `GET /api/resources/:id/download`

**Key Code:**
```javascript
// List all resources
const response = await api("/resources", { method: "GET" })

// Download file
const response = await fetch(`/api/resources/${f.id}/download`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
```

---

### 4. Exam.jsx
**Location:** `frontend/src/pages/Exam.jsx`  
**Updated Functions:**
- `fetchExams()` → `GET /api/exams`

**Key Code:**
```javascript
const response = await api("/exams", { method: "GET" })
```

---

### 5. ClubsActivities.jsx
**Location:** `frontend/src/pages/ClubsActivities.jsx`  
**Updated Functions:**
- `fetchClubsData()` → `GET /api/clubs`
- `handleJoinClub()` → `POST /api/clubs/:id/join-request`

**Key Code:**
```javascript
// Fetch clubs
const response = await api("/clubs", { method: "GET" })

// Join club
const response = await api(`/clubs/${club.id}/join-request`, {
  method: 'POST',
  body: { interests: [...] }
})
```

---

## 🛠️ Backend Files Created/Modified

### New Files
- `backend/src/controllers/export.js` - PDF/CSV export functions
- `backend/src/routes/export.js` - Export API routes

### Modified Files
- `backend/src/routes/index.js` - Added export routes mounting
- `backend/package.json` - Added pdfkit and csv-stringify

### Verified Existing Files
- `backend/src/controllers/settings.js` - ✅ updatePreferences() exists
- `backend/src/controllers/leaves.js` - ✅ requestLeave(), myLeaves() exist
- `backend/src/controllers/exams.js` - ✅ listExams(), myExams() exist
- `backend/src/controllers/clubs.js` - ✅ enrollClub(), myClubs() exist

---

## 📊 API Endpoints Summary

| Method | Endpoint | Frontend Page | Status |
|--------|----------|---------------|--------|
| GET | `/api/settings` | Settings | ✅ |
| PATCH | `/api/settings/preferences` | Settings | ✅ |
| GET | `/api/export/transcript/pdf` | Settings | ✅ |
| GET | `/api/export/activities/csv` | Settings | ✅ |
| GET | `/api/export/attendance/csv` | Settings | ✅ |
| GET | `/api/leaves/my-requests` | RegisterServices | ✅ |
| POST | `/api/leaves/request` | RegisterServices | ✅ |
| GET | `/api/resources` | Resources | ✅ |
| GET | `/api/resources/:id/download` | Resources | ✅ |
| GET | `/api/exams` | Exam | ✅ |
| GET | `/api/clubs` | ClubsActivities | ✅ |
| POST | `/api/clubs/:id/join-request` | ClubsActivities | ✅ |

---

## 🧪 Testing Each API

### 1. Settings Save
```bash
curl -X PATCH http://localhost:5000/api/settings/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"th","theme":"dark","notifications":{"announcement":true}}'
```

### 2. Export Transcript PDF
```bash
curl -X GET http://localhost:5000/api/export/transcript/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output transcript.pdf
```

### 3. Fetch Leave Requests
```bash
curl -X GET http://localhost:5000/api/leaves/my-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Submit Leave Request
```bash
curl -X POST http://localhost:5000/api/leaves/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"sick","startDate":"2025-12-10","endDate":"2025-12-10","fullDay":true,"reason":"Fever"}'
```

### 5. List Resources
```bash
curl -X GET http://localhost:5000/api/resources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. List Exams
```bash
curl -X GET http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. List Clubs
```bash
curl -X GET http://localhost:5000/api/clubs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Join Club
```bash
curl -X POST http://localhost:5000/api/clubs/123/join-request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interests":["leadership","teamwork"]}'
```

---

## 🔍 Error Handling Patterns

All Frontend API calls follow this pattern:

```javascript
try {
  const response = await api('/endpoint', { method: 'GET' })
  // Success - update state or display data
  alert('Operation successful')
} catch (err) {
  console.error('Error:', err)
  alert('Operation failed. Please try again.')
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (token expired/missing)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Server Error

---

## 📦 Dependencies Added

```json
{
  "pdfkit": "^0.13.0",
  "csv-stringify": "^6.4.4"
}
```

Install with:
```bash
npm install pdfkit csv-stringify
```

---

## ✅ Verification Checklist

- [x] All Frontend pages import `api` from `utils/api`
- [x] All TODO comments removed
- [x] All fetch functions use proper async/await
- [x] All error handling implemented
- [x] All loading states working
- [x] JWT token attached to all requests
- [x] All API endpoints verified in Backend
- [x] Export dependencies added to package.json
- [x] Git commits track all changes
- [x] No hardcoded URLs (using relative paths)

---

## 🚀 Deployment Instructions

### 1. Install Dependencies
```bash
cd backend && npm install
cd frontend && npm install
```

### 2. Set Environment Variables
```bash
# backend/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-key"
```

### 3. Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

### 4. Start Both Services
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Verify All APIs
- Open Frontend at `http://localhost:5173`
- Navigate to each page
- Test each function (save settings, submit leave, download files, etc.)

---

## 📞 Support

If you encounter issues:
1. Check browser DevTools Console for errors
2. Check Backend terminal for API errors
3. Verify JWT token is present in localStorage
4. Check Backend logs for database errors
5. Ensure all environment variables are set

---

**Prepared:** December 6, 2025  
**Status:** ✅ PRODUCTION READY
