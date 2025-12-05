# 🎯 KVC WebApp - Pre-Deployment QA Checklist

**Project:** KVC (Kalasin Vocational College Portal)  
**Date:** December 6, 2025  
**Version:** 1.0  
**Status:** Ready for QA Review

---

## 📋 QA Checklist Categories

### 1️⃣ ENVIRONMENT & INFRASTRUCTURE

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 1.1 | Backend server running (http://localhost:4001) | Infrastructure | 🔴 Critical | ☐ | Verify port 4001 is listening | DevOps | |
| 1.2 | Frontend server running (http://localhost:5173) | Infrastructure | 🔴 Critical | ☐ | Verify Vite dev server active | DevOps | |
| 1.3 | PostgreSQL database connected | Infrastructure | 🔴 Critical | ☐ | Check DATABASE_URL in .env | DevOps | |
| 1.4 | Prisma migrations applied | Infrastructure | 🔴 Critical | ☐ | Run: `prisma migrate deploy` | DevOps | |
| 1.5 | Environment variables configured | Infrastructure | 🔴 Critical | ☐ | All required .env vars set | DevOps | |
| 1.6 | SSL certificates (for HTTPS) | Infrastructure | 🟡 High | ☐ | Self-signed certs for localhost | DevOps | |
| 1.7 | Reverse proxy configured (if needed) | Infrastructure | 🟡 High | ☐ | nginx/Apache setup | DevOps | |
| 1.8 | Log files rotation configured | Infrastructure | 🟢 Medium | ☐ | Prevent disk space issues | DevOps | |

---

### 2️⃣ BACKEND API TESTING

#### 2.1 Authentication & Authorization

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.1.1 | Login endpoint working | Auth | 🔴 Critical | ☐ | POST /api/auth/login | QA | |
| 2.1.2 | JWT token generation | Auth | 🔴 Critical | ☐ | Access token & refresh token created | QA | |
| 2.1.3 | Token refresh endpoint | Auth | 🔴 Critical | ☐ | POST /api/auth/refresh | QA | |
| 2.1.4 | Logout endpoint | Auth | 🔴 Critical | ☐ | POST /api/auth/logout | QA | |
| 2.1.5 | Role-based access control | Auth | 🔴 Critical | ☐ | Teacher vs Student permissions | QA | |
| 2.1.6 | Protected routes require auth | Auth | 🔴 Critical | ☐ | 401 Unauthorized when no token | QA | |
| 2.1.7 | CORS headers present | Auth | 🟡 High | ☐ | Proper origin validation | QA | |

#### 2.2 Class Management API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.2.1 | GET /api/classes | Classes | 🔴 Critical | ☐ | List all classes for user | QA | |
| 2.2.2 | GET /api/classes/{id} | Classes | 🔴 Critical | ☐ | Get class details | QA | |
| 2.2.3 | POST /api/classes (teacher only) | Classes | 🔴 Critical | ☐ | Create new class | QA | |
| 2.2.4 | PUT /api/classes/{id} (teacher only) | Classes | 🔴 Critical | ☐ | Update class details | QA | |
| 2.2.5 | DELETE /api/classes/{id} (teacher only) | Classes | 🔴 Critical | ☐ | Delete class | QA | |
| 2.2.6 | GET /api/classes/{id}/students | Classes | 🔴 Critical | ☐ | List class students | QA | |
| 2.2.7 | POST /api/classes/{id}/join-request | Classes | 🔴 Critical | ☐ | Student join request | QA | |
| 2.2.8 | GET /api/classes/{id}/join-requests | Classes | 🟡 High | ☐ | Teacher view requests | QA | |
| 2.2.9 | POST /api/classes/join-requests/{id}/approve | Classes | 🟡 High | ☐ | Teacher approve join | QA | |
| 2.2.10 | POST /api/classes/join-requests/{id}/reject | Classes | 🟡 High | ☐ | Teacher reject join | QA | |

#### 2.3 Chat API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.3.1 | GET /api/chat/rooms | Chat | 🔴 Critical | ☐ | List user's chat rooms | QA | |
| 2.3.2 | POST /api/chat/rooms | Chat | 🔴 Critical | ☐ | Create new chat room | QA | |
| 2.3.3 | GET /api/chat/rooms/{id}/messages | Chat | 🔴 Critical | ☐ | Load room messages | QA | |
| 2.3.4 | POST /api/chat/rooms/{id}/messages | Chat | 🔴 Critical | ☐ | Send message | QA | |
| 2.3.5 | POST /api/chat/rooms/{id}/pin | Chat | 🟡 High | ☐ | Pin room for user | QA | |
| 2.3.6 | DELETE /api/chat/rooms/{id}/pin | Chat | 🟡 High | ☐ | Unpin room | QA | |
| 2.3.7 | GET /api/chat/me/pinned | Chat | 🟡 High | ☐ | Get user's pinned rooms | QA | |
| 2.3.8 | WebSocket connection (socket.io) | Chat | 🔴 Critical | ☐ | Real-time messaging | QA | |

#### 2.4 Attendance API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.4.1 | GET /api/classes/{id}/attendance | Attendance | 🟡 High | ☐ | Get class attendance | QA | |
| 2.4.2 | POST /api/classes/{id}/attendance | Attendance | 🟡 High | ☐ | Mark attendance | QA | |
| 2.4.3 | GET /api/attendance/my-sessions | Attendance | 🟡 High | ☐ | Student view sessions | QA | |

#### 2.5 Leave Request API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.5.1 | GET /api/leaves/my-requests | Leaves | 🟡 High | ☐ | Student view requests | QA | |
| 2.5.2 | POST /api/leaves/request | Leaves | 🟡 High | ☐ | Submit leave request | QA | |
| 2.5.3 | GET /api/leaves/pending | Leaves | 🟡 High | ☐ | Teacher view pending (teacher only) | QA | |

#### 2.6 Exam API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.6.1 | GET /api/exams | Exams | 🟡 High | ☐ | List exams | QA | |
| 2.6.2 | GET /api/classes/{id}/exams | Exams | 🟡 High | ☐ | Class exams | QA | |

#### 2.7 Resources API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.7.1 | GET /api/resources | Resources | 🟡 High | ☐ | List resources | QA | |
| 2.7.2 | GET /api/resources/{id}/download | Resources | 🟡 High | ☐ | Download resource | QA | |

#### 2.8 Export API

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.8.1 | GET /api/export/transcript/pdf | Export | 🟡 High | ☐ | Export transcript as PDF | QA | |
| 2.8.2 | GET /api/export/activities/csv | Export | 🟡 High | ☐ | Export activities as CSV | QA | |
| 2.8.3 | GET /api/export/attendance/csv | Export | 🟡 High | ☐ | Export attendance as CSV | QA | |

#### 2.9 Error Handling

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 2.9.1 | 400 Bad Request errors | Errors | 🟡 High | ☐ | Validation errors return proper response | QA | |
| 2.9.2 | 401 Unauthorized errors | Errors | 🔴 Critical | ☐ | Missing/invalid token handling | QA | |
| 2.9.3 | 403 Forbidden errors | Errors | 🟡 High | ☐ | Permission denied handling | QA | |
| 2.9.4 | 404 Not Found errors | Errors | 🟡 High | ☐ | Resource not found handling | QA | |
| 2.9.5 | 500 Server errors | Errors | 🔴 Critical | ☐ | Graceful error messages | QA | |
| 2.9.6 | Error logging | Errors | 🟡 High | ☐ | Errors logged for debugging | QA | |

---

### 3️⃣ FRONTEND UI/UX TESTING

#### 3.1 Responsive Design

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.1.1 | Mobile (< 640px) layout | Responsive | 🔴 Critical | ☐ | Single column, touch-friendly | QA | |
| 3.1.2 | Tablet (640-1024px) layout | Responsive | 🔴 Critical | ☐ | 2-3 column layout | QA | |
| 3.1.3 | Desktop (> 1024px) layout | Responsive | 🔴 Critical | ☐ | Full multi-column layout | QA | |
| 3.1.4 | No horizontal scroll | Responsive | 🔴 Critical | ☐ | All content fits screen width | QA | |
| 3.1.5 | Touch targets 44px+ | Responsive | 🟡 High | ☐ | Mobile-friendly button sizes | QA | |
| 3.1.6 | Text readable on all devices | Responsive | 🟡 High | ☐ | Font sizes scale appropriately | QA | |

#### 3.2 Page Load & Performance

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.2.1 | Page load time < 3 seconds | Performance | 🟡 High | ☐ | Check lighthouse score | QA | |
| 3.2.2 | CSS/JS minified | Performance | 🟡 High | ☐ | Production build | QA | |
| 3.2.3 | Images optimized | Performance | 🟡 High | ☐ | WebP or compressed | QA | |
| 3.2.4 | No console errors | Performance | 🔴 Critical | ☐ | Dev console clean | QA | |
| 3.2.5 | No console warnings | Performance | 🟡 High | ☐ | No deprecation warnings | QA | |
| 3.2.6 | Lazy loading implemented | Performance | 🟡 High | ☐ | Images/components load on demand | QA | |

#### 3.3 Authentication Flow

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.3.1 | Login page loads | Auth | 🔴 Critical | ☐ | Route: /login | QA | |
| 3.3.2 | Login form validation | Auth | 🔴 Critical | ☐ | Username & password required | QA | |
| 3.3.3 | Successful login redirects | Auth | 🔴 Critical | ☐ | Redirects to /chat or dashboard | QA | |
| 3.3.4 | Failed login shows error | Auth | 🔴 Critical | ☐ | Error message displayed | QA | |
| 3.3.5 | Logout clears session | Auth | 🔴 Critical | ☐ | User logged out properly | QA | |
| 3.3.6 | Protected routes require auth | Auth | 🔴 Critical | ☐ | Redirect to login if not logged in | QA | |

#### 3.4 Class Management Pages

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.4.1 | Class list loads | Classes | 🔴 Critical | ☐ | Displays all user classes | QA | |
| 3.4.2 | Class details page loads | Classes | 🔴 Critical | ☐ | Shows schedule, students, assignments | QA | |
| 3.4.3 | Create class (teacher only) | Classes | 🟡 High | ☐ | Form and submission working | QA | |
| 3.4.4 | Edit class (teacher only) | Classes | 🟡 High | ☐ | Update class details | QA | |
| 3.4.5 | Delete class (teacher only) | Classes | 🟡 High | ☐ | Confirmation modal appears | QA | |
| 3.4.6 | Join class request | Classes | 🟡 High | ☐ | Student can request to join | QA | |
| 3.4.7 | View join requests (teacher) | Classes | 🟡 High | ☐ | Teacher see pending requests | QA | |
| 3.4.8 | Approve/reject requests (teacher) | Classes | 🟡 High | ☐ | Actions work properly | QA | |

#### 3.5 Chat Pages

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.5.1 | Chat room list loads | Chat | 🔴 Critical | ☐ | Shows all chat rooms | QA | |
| 3.5.2 | Chat mobile full-screen | Chat | 🔴 Critical | ☐ | Room list takes full screen on mobile | QA | |
| 3.5.3 | Chat room selection | Chat | 🔴 Critical | ☐ | Clicking room shows messages | QA | |
| 3.5.4 | Messages display | Chat | 🔴 Critical | ☐ | Load and display messages | QA | |
| 3.5.5 | Send message | Chat | 🔴 Critical | ☐ | Message sends and appears | QA | |
| 3.5.6 | Real-time updates | Chat | 🔴 Critical | ☐ | WebSocket receiving messages | QA | |
| 3.5.7 | Pin room feature | Chat | 🟡 High | ☐ | Pin button works, shows icon | QA | |
| 3.5.8 | Pinned tab filter | Chat | 🟡 High | ☐ | Filter shows only pinned | QA | |
| 3.5.9 | Search rooms | Chat | 🟡 High | ☐ | Search functionality works | QA | |

#### 3.6 Attendance Pages

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.6.1 | Attendance page loads | Attendance | 🟡 High | ☐ | Shows attendance records | QA | |
| 3.6.2 | Mark attendance (teacher) | Attendance | 🟡 High | ☐ | Can mark students present/absent | QA | |
| 3.6.3 | View my attendance (student) | Attendance | 🟡 High | ☐ | Student sees their attendance | QA | |

#### 3.7 Leave Pages

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.7.1 | Leave request form | Leaves | 🟡 High | ☐ | Form displays correctly | QA | |
| 3.7.2 | Submit leave request | Leaves | 🟡 High | ☐ | Request submitted successfully | QA | |
| 3.7.3 | View my requests | Leaves | 🟡 High | ☐ | Student sees their requests | QA | |

#### 3.8 Settings Pages

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 3.8.1 | Settings page loads | Settings | 🟡 High | ☐ | User preferences displayed | QA | |
| 3.8.2 | Save settings | Settings | 🟡 High | ☐ | Settings update properly | QA | |
| 3.8.3 | Export transcript (PDF) | Settings | 🟡 High | ☐ | PDF download works | QA | |
| 3.8.4 | Export activities (CSV) | Settings | 🟡 High | ☐ | CSV download works | QA | |

---

### 4️⃣ SECURITY & DATA TESTING

#### 4.1 Authentication Security

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 4.1.1 | JWT tokens secure | Security | 🔴 Critical | ☐ | Tokens in httpOnly cookies | QA | |
| 4.1.2 | Password hashing | Security | 🔴 Critical | ☐ | Passwords never stored plain text | QA | |
| 4.1.3 | CORS validation | Security | 🔴 Critical | ☐ | Only allowed origins | QA | |
| 4.1.4 | Rate limiting | Security | 🟡 High | ☐ | API rate limited (120 req/min) | QA | |
| 4.1.5 | SQL injection prevention | Security | 🔴 Critical | ☐ | Prisma ORM prevents injection | QA | |

#### 4.2 Data Validation

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 4.2.1 | Input validation | Data | 🔴 Critical | ☐ | All inputs validated | QA | |
| 4.2.2 | XSS protection | Data | 🔴 Critical | ☐ | No unescaped HTML in output | QA | |
| 4.2.3 | CSRF protection | Data | 🟡 High | ☐ | CSRF tokens validated | QA | |
| 4.2.4 | Data sanitization | Data | 🔴 Critical | ☐ | User inputs sanitized | QA | |

#### 4.3 Database

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 4.3.1 | Database backups | Data | 🟡 High | ☐ | Regular backup schedule | QA | |
| 4.3.2 | Connection pooling | Data | 🟡 High | ☐ | Efficient DB connections | QA | |
| 4.3.3 | Query performance | Data | 🟡 High | ☐ | No N+1 queries | QA | |
| 4.3.4 | Data relationships | Data | 🟡 High | ☐ | Foreign keys maintained | QA | |

---

### 5️⃣ BROWSER COMPATIBILITY

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 5.1 | Chrome latest | Browser | 🔴 Critical | ☐ | Desktop & mobile | QA | |
| 5.2 | Firefox latest | Browser | 🟡 High | ☐ | Desktop & mobile | QA | |
| 5.3 | Safari latest | Browser | 🟡 High | ☐ | Desktop & mobile | QA | |
| 5.4 | Edge latest | Browser | 🟡 High | ☐ | Windows | QA | |
| 5.5 | Mobile Safari (iOS) | Browser | 🟡 High | ☐ | iOS 14+ | QA | |
| 5.6 | Chrome Android | Browser | 🟡 High | ☐ | Android 10+ | QA | |

---

### 6️⃣ ACCESSIBILITY (a11y)

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 6.1 | Keyboard navigation | Accessibility | 🟡 High | ☐ | Tab through all interactive elements | QA | |
| 6.2 | ARIA labels | Accessibility | 🟡 High | ☐ | Screen reader friendly | QA | |
| 6.3 | Color contrast | Accessibility | 🟡 High | ☐ | WCAG AA compliant | QA | |
| 6.4 | Focus indicators | Accessibility | 🟡 High | ☐ | Visible focus states | QA | |
| 6.5 | Form labels | Accessibility | 🟡 High | ☐ | All inputs labeled | QA | |

---

### 7️⃣ DEPLOYMENT VERIFICATION

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 7.1 | Build succeeds | Build | 🔴 Critical | ☐ | `npm run build` works | DevOps | |
| 7.2 | No build warnings | Build | 🟡 High | ☐ | Clean build output | DevOps | |
| 7.3 | Production env vars set | Deploy | 🔴 Critical | ☐ | .env configured | DevOps | |
| 7.4 | Database migrations ran | Deploy | 🔴 Critical | ☐ | Schema up to date | DevOps | |
| 7.5 | Health check passes | Deploy | 🔴 Critical | ☐ | GET /health returns 200 | DevOps | |
| 7.6 | API responding | Deploy | 🔴 Critical | ☐ | GET /api returns 200 | DevOps | |
| 7.7 | Frontend loading | Deploy | 🔴 Critical | ☐ | index.html loads | DevOps | |
| 7.8 | Reverse proxy configured | Deploy | 🟡 High | ☐ | nginx/Apache routing works | DevOps | |
| 7.9 | SSL certificates installed | Deploy | 🟡 High | ☐ | HTTPS working | DevOps | |
| 7.10 | Monitoring enabled | Deploy | 🟡 High | ☐ | Logs & metrics collection | DevOps | |

---

### 8️⃣ DOCUMENTATION & HANDOFF

| # | Item | Category | Priority | Status | Notes | Assigned To | Date |
|---|------|----------|----------|--------|-------|-------------|------|
| 8.1 | API documentation | Docs | 🟡 High | ☐ | OpenAPI spec complete | Dev | |
| 8.2 | README updated | Docs | 🟡 High | ☐ | Installation & setup instructions | Dev | |
| 8.3 | Environment variables documented | Docs | 🟡 High | ☐ | .env.example provided | Dev | |
| 8.4 | Database schema documented | Docs | 🟡 High | ☐ | ER diagrams available | Dev | |
| 8.5 | User guide prepared | Docs | 🟡 High | ☐ | How to use the system | PM | |
| 8.6 | Known issues documented | Docs | 🟡 High | ☐ | Workarounds provided | Dev | |
| 8.7 | Support contacts available | Docs | 🟡 High | ☐ | Emergency contacts listed | PM | |

---

## 📊 Summary Checklist

### Critical Items (🔴 Must Pass)
- [ ] All backend APIs responding (200 OK)
- [ ] Frontend loads without errors
- [ ] Authentication/Authorization working
- [ ] Database connected and migrated
- [ ] No console errors or critical warnings
- [ ] Responsive design working (mobile/tablet/desktop)
- [ ] Chat real-time messaging working (socket.io)
- [ ] Export functionality working (PDF/CSV)
- [ ] All 401/403 errors handled properly
- [ ] SSL/HTTPS ready (with valid certificates)

### High Priority Items (🟡 Should Pass)
- [ ] All APIs tested and documented
- [ ] Browser compatibility verified
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] Build process clean
- [ ] Production environment configured

### Medium Priority Items (🟢 Nice to Have)
- [ ] Automated tests passing
- [ ] Monitoring/logging setup
- [ ] Backup procedures documented
- [ ] Disaster recovery plan
- [ ] Load testing results reviewed

---

## 🎯 Test Execution Guide

### Phase 1: Infrastructure Setup (30 min)
- [ ] Verify servers are running
- [ ] Test database connectivity
- [ ] Check environment variables

### Phase 2: Backend API Testing (60 min)
- [ ] Test authentication endpoints
- [ ] Test class management APIs
- [ ] Test chat APIs
- [ ] Verify error handling

### Phase 3: Frontend UI Testing (90 min)
- [ ] Test responsive design (3 viewport sizes)
- [ ] Test page navigation
- [ ] Test form submissions
- [ ] Test file uploads/downloads

### Phase 4: End-to-End Testing (60 min)
- [ ] Complete user workflows
- [ ] Test on multiple browsers
- [ ] Test on multiple devices

### Phase 5: Security Testing (60 min)
- [ ] Test authentication security
- [ ] Test CORS configuration
- [ ] Test input validation
- [ ] Test unauthorized access

### Phase 6: Performance Testing (30 min)
- [ ] Check page load times
- [ ] Check API response times
- [ ] Run lighthouse audit

### Phase 7: Deployment Verification (30 min)
- [ ] Verify build succeeds
- [ ] Verify health checks pass
- [ ] Verify database migrations complete

**Total Estimated Time: 360 minutes (6 hours)**

---

## 📝 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | _______________ | ________ | __________ |
| Dev Lead | _______________ | ________ | __________ |
| DevOps | _______________ | ________ | __________ |
| Project Manager | _______________ | ________ | __________ |

---

## 🔗 Resources

- **API Documentation:** `docs/openapi.yaml`
- **Backend README:** `backend/README.md`
- **Frontend README:** `frontend/src/README.md`
- **Deployment Guide:** `_docs/DEPLOYMENT_READINESS_100_PERCENT.md`
- **Test Scripts:** `_tests/test-complete-system.mjs`

---

## 📌 Notes

- Test on actual deployment server, not just localhost
- Clear browser cache before testing
- Test with real data, not just mock data
- Include security testing in QA process
- Document any bugs found with reproducible steps
- Verify fixes before marking as complete

---

**Generated:** December 6, 2025  
**Version:** 1.0 Production Ready  
**Status:** ✅ Ready for QA Execution
