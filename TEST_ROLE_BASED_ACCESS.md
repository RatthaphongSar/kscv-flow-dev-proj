# Role-Based Access Control Testing Guide

## Problem Identified
- ✅ AuthContext ดึง role จาก backend login response ถูกต้อง
- ✅ Class.jsx ใช้ `useAuth()` ดึง user role ถูกต้อง
- ✅ Tabs มี conditional rendering สำหรับ TEACHER only
- ✅ Components มี role checks ในการ render
- ⚠️ Mock users ใน AuthContext default เป็น 'TEACHER' เมื่อ API fails

## Testing Steps

### 1. Test with Real Backend Users (Recommended)

#### a. Backend - Create Test Users
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "Teacher123!",
    "role": "TEACHER"
  }'

curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "Student123!",
    "role": "STUDENT"
  }'
```

#### b. Frontend - Test Login
1. Go to `/login` page
2. Click "Teacher Demo" button → logs in as teacher
3. Verify menu shows: ภาพรวม | งาน | การเข้าเรียน | ประกาศ | ตารางเรียน | จัดการนักเรียน | สร้างงาน | ตั้งค่า
4. Logout → go to `/login` again
5. Click "Student Demo" button → logs in as student
6. Verify menu shows: ภาพรวม | งาน | การเข้าเรียน | ประกาศ | ตารางเรียน (8 tabs → 5 tabs)

### 2. Test with Mock Users (Development)

#### a. Set Mock Role via Browser DevTools
```javascript
// In browser console:
localStorage.setItem('mockRole', 'STUDENT');
location.reload();

// Check result: Should see only 5 tabs
// Then switch to teacher:
localStorage.setItem('mockRole', 'TEACHER');
location.reload();

// Check result: Should see 8 tabs
```

#### b. Expected Behavior by Role

**TEACHER (8 tabs):**
- ✅ ภาพรวม
- ✅ งานที่ได้รับมอบหมาย
- ✅ การเข้าเรียน
- ✅ ประกาศ
- ✅ ตารางเรียน
- ✅ จัดการนักเรียน (Teacher-only)
- ✅ สร้างงาน (Teacher-only)
- ✅ ตั้งค่า (Teacher-only)

**STUDENT (5 tabs):**
- ✅ ภาพรวม
- ✅ งานที่ได้รับมอบหมาย
- ✅ การเข้าเรียน
- ✅ ประกาศ
- ✅ ตารางเรียน
- ❌ No teacher-only tabs visible

### 3. Test Component-Level Role Checks

#### a. ClassStudents.tsx
- When TEACHER: Shows "Add Student" form, student list, remove buttons
- When STUDENT: Shows "This feature is only available for teachers" message

#### b. ClassManagement.tsx
- When TEACHER: Shows create class form, list of classes with edit/delete
- When STUDENT: Shows "This feature is only available for teachers" message

#### c. ClassAssignmentCreator.tsx
- When TEACHER: Shows create assignment form, list with edit/delete
- When STUDENT: Shows "This feature is only available for teachers" message

### 4. Verification Checklist

- [ ] Backend returns `role` field in login response
- [ ] Frontend stores `role` in user object
- [ ] Class.jsx reads `user?.role` from useAuth()
- [ ] Teacher-only tabs only render when role === 'TEACHER'
- [ ] Teacher-only components show error message when role !== 'TEACHER'
- [ ] Switch between teacher/student using mockRole in localStorage
- [ ] All tabs render/hide correctly based on role

## Current Code Structure

### AuthContext.jsx
```javascript
// Login returns user with role
async function login(username, password) {
  const userData = await AuthAPI.login(username, password)  // Returns { id, username, role, ... }
  localStorage.setItem('user', JSON.stringify(userData))
  setUser(userData)
  return userData
}

// useAuth() provides user.role
export function useAuth() {
  return useContext(Ctx)  // Returns { user, loading, login, logout, refresh }
}
```

### Class.jsx
```javascript
const { user } = useAuth();
const userRole = user?.role || "STUDENT";  // Get from auth, default STUDENT

// Conditional rendering
{userRole === "TEACHER" && (
  <button onClick={() => setActiveTab("students")}>
    <Users size={14} />
    จัดการนักเรียน
  </button>
)}
```

### Teacher-Only Components
All check role and show error message:
```javascript
if (userRole !== 'TEACHER') {
  return (
    <div className="flex items-center justify-center py-12 text-center">
      <div className="text-sm text-gray-400">
        <p className="font-medium">This feature is only available for teachers</p>
        <p className="text-xs text-gray-500 mt-1">Only teacher accounts can manage enrollment</p>
      </div>
    </div>
  );
}
```

## Files Modified

1. ✅ frontend/src/context/AuthContext.jsx - Handles role from backend
2. ✅ frontend/src/pages/Class.jsx - Uses useAuth() to get real role
3. ✅ frontend/src/components/class/ClassStudents.tsx - Role check implemented
4. ✅ frontend/src/components/class/ClassManagement.tsx - Role check implemented
5. ✅ frontend/src/components/class/ClassAssignmentCreator.tsx - Role check implemented

## Next Steps

1. Ensure backend users exist with correct roles
2. Test login flow with each role type
3. Verify tabs appear/disappear correctly
4. Test component visibility and functionality
5. Check API calls only work for authorized roles
