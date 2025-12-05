# 🧪 Class Join System - Testing Guide

## 🎯 Test Objectives

Verify that the complete class join workflow functions correctly with all UI components, backend integration, and teacher approval process.

---

## ⚙️ Setup & Prerequisites

### Before Testing
1. ✅ Backend running on `http://localhost:4001`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ Database connected and tables created
4. ✅ Both servers fully started (check console output)

### Test Users (Mock Auth)
```
TEACHER TOKEN: Bearer mock-teacher-token
STUDENT TOKEN: Bearer mock-student-token
```

---

## 🧪 Test Scenarios

### **Scenario 1: Student Discovers Non-Enrolled Classes** ✅

**Objective**: Verify students can see all classes, not just enrolled ones

**Steps**:
1. Open app at `http://localhost:5173`
2. Click on "Class" menu (should auto-login as student)
3. Check the class list in the left sidebar

**Expected Result**:
- ✅ Student sees ALL classes in the system
- ✅ Classes are sorted with enrolled ones first
- ✅ Non-enrolled classes show "+ ขอเข้าห้องเรียน" button
- ✅ Enrolled classes show "ลงทะเบียนแล้ว" badge

**What's Being Tested**:
- Backend: `getClassesForUser()` returns all classes with `enrollmentStatus`
- Frontend: Class list rendering and filtering

---

### **Scenario 2: Open Confirmation Modal** ✅

**Objective**: Verify the join confirmation modal appears with correct information

**Prerequisites**: 
- Student can see at least one non-enrolled class

**Steps**:
1. Find a class you're not enrolled in
2. Click the "+ ขอเข้าห้องเรียน" button

**Expected Result**:
- ✅ Beautiful modal pops up with title "ยืนยันการลงทะเบียน"
- ✅ Modal shows class name
- ✅ Modal shows class code
- ✅ Modal shows teacher name
- ✅ Blue info box explains: "คำขอของคุณจะถูกส่งไปยังอาจารย์ผู้สอน..."
- ✅ Two buttons: "ยกเลิก" (Cancel) and "ยืนยันการลงทะเบียน" (Confirm)

**What's Being Tested**:
- Frontend: JoinConfirmationModal component rendering
- Component receives correct props
- Modal styling and layout

---

### **Scenario 3: Cancel Join Request** ✅

**Objective**: Verify canceling doesn't send a request

**Prerequisites**: 
- Confirmation modal is open

**Steps**:
1. Click "ยกเลิก" (Cancel) button
2. Verify modal closes
3. Check if join button is still visible

**Expected Result**:
- ✅ Modal closes without sending request
- ✅ Join button remains visible and clickable
- ✅ Button still shows "+ ขอเข้าห้องเรียน"

**What's Being Tested**:
- Modal close handler works
- No API call made
- UI state not changed

---

### **Scenario 4: Send Join Request** ✅

**Objective**: Verify join request is sent and button updates

**Prerequisites**: 
- Confirmation modal is open

**Steps**:
1. Click "ยืนยันการลงทะเบียน" (Confirm) button
2. Wait for loading animation
3. Wait for modal to close
4. Check button text

**Expected Result**:
- ✅ Loading spinner appears during submission
- ✅ Button text changes to "กำลังส่ง..."
- ✅ Modal closes after successful request
- ✅ Button now shows: "ส่งคำขอแล้ว รอการอนุมัติ" (yellow with clock icon)

**What's Being Tested**:
- Frontend: handleConfirmJoin() executes
- API: POST /api/classes/{classId}/join-request works
- State updates: hasPendingRequest flag set
- UI: Button state change based on status

---

### **Scenario 5: Teacher Views Join Requests** ✅

**Objective**: Verify teacher can see pending requests from students

**Prerequisites**: 
- Student has sent at least one join request

**Steps**:
1. Switch to teacher login (need to reload with teacher token in browser)
2. Go to Class page
3. Select the class that received the join request
4. Click "จัดการ" (Manage) button

**Expected Result**:
- ✅ JoinRequestModal opens
- ✅ Shows pending join request(s)
- ✅ Shows student name/ID
- ✅ Shows request status as "pending"
- ✅ "Approve" and "Reject" buttons are visible

**What's Being Tested**:
- Frontend: Teacher can access class management
- API: GET /api/classes/{classId}/join-requests returns requests
- Component: JoinRequestModal displays data correctly

---

### **Scenario 6: Teacher Approves Request** ✅

**Objective**: Verify teacher can approve a join request

**Prerequisites**: 
- Teacher view shows pending request

**Steps**:
1. In JoinRequestModal, find the pending request
2. Click the green checkmark "Approve" button
3. Wait for API response

**Expected Result**:
- ✅ Loading animation appears
- ✅ Request status changes to "approved" (green checkmark)
- ✅ No errors shown
- ✅ Student now has access to the class

**What's Being Tested**:
- API: POST /api/enrollment/join-requests/{id}/approve works
- Backend: Creates enrollment record with status='active'
- UI: Status updates in real-time

---

### **Scenario 7: Student Sees Updated Status** ✅

**Objective**: Verify student sees "Enrolled" status after teacher approval

**Prerequisites**: 
- Teacher has approved the join request
- Student is logged in

**Steps**:
1. Switch back to student login
2. Go to Class page
3. Refresh the page or navigate back
4. Look at the class button

**Expected Result**:
- ✅ Button now shows: "ลงทะเบียนแล้ว" (green with checkmark)
- ✅ Can access class content (assignments, schedule, etc.)
- ✅ Class appears in enrolled list

**What's Being Tested**:
- API: Student's class list reflects new enrollment
- Frontend: Correct status displayed based on enrollmentStatus field
- Database: Enrollment record created with status='active'

---

### **Scenario 8: Reject Request** ✅

**Objective**: Verify teacher can reject a request

**Prerequisites**: 
- Another student has sent a join request
- Teacher is viewing join requests

**Steps**:
1. In JoinRequestModal, find a pending request
2. Click the red X "Reject" button
3. (Optional) Enter rejection reason if prompted

**Expected Result**:
- ✅ Loading animation appears
- ✅ Request status changes to "rejected" (red color)
- ✅ Student is NOT enrolled in the class
- ✅ Student can still see the class and click join again

**What's Being Tested**:
- API: POST /api/enrollment/join-requests/{id}/reject works
- Status updates correctly
- Rejected students not enrolled

---

### **Scenario 9: Multiple Classes** ✅

**Objective**: Verify system works correctly with multiple classes

**Steps**:
1. Teacher creates 3-4 different classes
2. Student views class list
3. Student joins different classes with different statuses
4. Verify each class shows correct status independently

**Expected Result**:
- ✅ Each class shows its own join status
- ✅ Joining one class doesn't affect others
- ✅ Button state correctly reflects each class's status

**What's Being Tested**:
- State management handles multiple classes
- UI updates correctly for each class independently

---

### **Scenario 10: Error Handling** ✅

**Objective**: Verify system handles errors gracefully

**Steps**:
1. Try joining a class twice (already pending)
2. Check network errors (temporarily stop backend)
3. Verify error messages appear

**Expected Result**:
- ✅ Duplicate request shows appropriate error
- ✅ Network errors show user-friendly message
- ✅ Modal closes only on successful request
- ✅ Button returns to normal state if request fails

**What's Being Tested**:
- Error handling in handleConfirmJoin()
- API error responses handled
- User feedback for failures

---

## 📋 Manual Testing Checklist

Create two browser windows/tabs:

### **Teacher Tab** (logout to switch)
```
Checklist:
□ Login as teacher
□ Create a test class named "TEST-[Date]"
□ Verify class appears in teacher's class list
□ Keep browser open to view join requests later
□ Approve/reject requests as tests require
```

### **Student Tab** (default login)
```
Checklist:
□ Ensure logged in as student
□ See all available classes (including teacher's new class)
□ Click "+ ขอเข้าห้องเรียน" on test class
□ Verify confirmation modal appears
□ Verify all class details shown in modal
□ Confirm join request
□ Verify button changes to "รอการอนุมัติ"
□ Refresh and verify status persists
```

### **Switch Back to Teacher Tab**
```
Checklist:
□ Navigate to test class
□ Click "จัดการ" (Manage) button
□ Verify join request appears
□ Click "Approve"
□ Verify student's enrollment updated
```

### **Switch Back to Student Tab**
```
Checklist:
□ Refresh page
□ Verify button now shows "ลงทะเบียนแล้ว"
□ Verify can access class content
```

---

## 🐛 Troubleshooting

### Problem: "Backend not responding"
**Solution**:
1. Check backend is running: `node ./src/server.js` in backend folder
2. Check frontend is running: `npm run dev` in frontend folder
3. Verify ports are correct (4001 for backend, 5173 for frontend)

### Problem: "Modal doesn't appear"
**Solution**:
1. Check browser console for errors
2. Verify JoinConfirmationModal is imported in Class.jsx
3. Verify `isJoinConfirmationModalOpen` state is initialized

### Problem: "Button doesn't change after join"
**Solution**:
1. Check if API call succeeded (network tab)
2. Verify `hasPendingRequest` state is being set
3. Check if class list is being refreshed

### Problem: "Teacher can't see join requests"
**Solution**:
1. Make sure logged in as teacher (check auth token)
2. Verify JoinRequestModal is opened (click "จัดการ" button)
3. Check if GET /api/classes/{classId}/join-requests returns data

---

## 🎬 Demo Script (5 minutes)

1. **Setup** (1 min)
   - Open 2 browser windows/tabs
   - Teacher: Logged in, ready to create class
   - Student: Logged in, viewing class page

2. **Part 1: Discovery** (1 min)
   - Teacher creates new class "Demo Class"
   - Student sees it appear in class list immediately

3. **Part 2: Join Request** (1 min)
   - Student clicks "+ ขอเข้าห้องเรียน"
   - Beautiful modal appears
   - Student confirms join
   - Button updates to "รอการอนุมัติ"

4. **Part 3: Approval** (1 min)
   - Teacher sees join request
   - Teacher clicks "Approve"
   - Request status changes to approved

5. **Part 4: Verification** (1 min)
   - Student refreshes page
   - Button shows "ลงทะเบียนแล้ว"
   - Student can now access class

---

## ✅ Pass/Fail Criteria

### **PASS** ✅ if:
- All 10 scenarios work as expected
- No console errors
- All UI elements render correctly
- Thai text displays properly
- API responses are correct
- Button states update appropriately
- Database records are created correctly

### **FAIL** ❌ if:
- Any scenario doesn't work
- Console shows errors
- UI breaks or displays incorrectly
- API returns errors
- Database doesn't have new records
- Join requests not persisted

---

## 📊 Test Results Template

```
Test Date: _______________
Tester: _______________
Environment: 
  - Backend: http://localhost:4001
  - Frontend: http://localhost:5173
  - Database: [Connected/Error]

Scenario Results:
1. Student Discovers Classes: __ PASS __ FAIL
2. Open Confirmation Modal: __ PASS __ FAIL
3. Cancel Join Request: __ PASS __ FAIL
4. Send Join Request: __ PASS __ FAIL
5. Teacher Views Requests: __ PASS __ FAIL
6. Teacher Approves: __ PASS __ FAIL
7. Student Sees Updated Status: __ PASS __ FAIL
8. Reject Request: __ PASS __ FAIL
9. Multiple Classes: __ PASS __ FAIL
10. Error Handling: __ PASS __ FAIL

Overall Result: __ PASS __ FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎉 Success!

If all tests pass, the class join system is fully functional and ready for production! 🚀
