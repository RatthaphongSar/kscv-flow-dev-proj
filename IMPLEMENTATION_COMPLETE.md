# ระบบแชท - Teacher & Student Management ✅ เสร็จสิ้น

## 📋 สรุปการแก้ไข & สร้าง

### 1️⃣ **Backend - Authorization & APIs**

#### ✅ `scripts/seed-teacher.js` (NEW)
```bash
# สร้าง Teacher user ใหม่
node scripts/seed-teacher.js test-aj-123 123456
```
**Output:**
```
✅ Teacher user created: test-aj-123 (ID: cmhzxfnd00000vh44y6omfjsg)
```

#### ✅ `src/controllers/chat.js`
เพิ่มฟังก์ชัน 3 ตัว:

1. **getStudents()** - ดึงรายชื่อนักเรียนทั้งหมด
   - ✅ Authorization: เฉพาะ TEACHER/ADMIN
   - ✅ Return: Array ของ students with username, email, year, major
   - 📍 Route: `GET /chat/students`

2. **addMembersToRoom()** - เพิ่มนักเรียนเข้าห้อง
   - ✅ Authorization: เฉพาะ TEACHER/ADMIN
   - ✅ Validation: memberIds must be array & exist in DB
   - ✅ Duplicate prevention: ใช้ upsert
   - 📍 Route: `POST /chat/rooms/:roomId/add-members`

3. **createRoom()** - (ตรวจสอบแล้ว)
   - ✅ Authorization: เฉพาะ TEACHER/ADMIN
   - ✅ Auto-add all STUDENT ถ้าไม่ส่ง memberIds
   - ✅ Deduplication: ต้องไม่มีซ้ำ

#### ✅ `src/routes/chat.js`
```javascript
// เพิ่มสองเส้นทางใหม่
GET /chat/students                    // ดึง student list
POST /chat/rooms/:roomId/add-members  // เพิ่มสมาชิก
```

---

### 2️⃣ **Frontend - Services & Components**

#### ✅ `src/services/chat.js`
```javascript
// เพิ่ม 2 API methods
getStudents()              // ดึงรายชื่อนักเรียน
addMembersToRoom()         // เพิ่มสมาชิกเข้าห้อง
```

#### ✅ `src/components/chat/AddStudentsModal.tsx` (NEW)
- ✅ Search students by username/email
- ✅ Multi-select checkbox
- ✅ Loading/error handling
- ✅ Success callback
- 🎨 Tailwind styling (dark theme)

```tsx
<AddStudentsModal
  roomId={activeRoom.id}
  isOpen={showAddStudents}
  onClose={() => setShowAddStudents(false)}
  onSuccess={() => { /* refresh */ }}
/>
```

#### ✅ `src/components/chat/ChatWindow.tsx`
- ✅ เพิ่มปุ่ม "➕ เพิ่มสมาชิก" สำหรับ TEACHER/ADMIN
- ✅ Display เฉพาะ isTeacher condition
- ✅ Open AddStudentsModal เมื่อกดปุ่ม
- ✅ Pass currentUser.role ให้ UI render ถูกต้อง

#### ✅ `src/pages/Chat.jsx`
- ✅ ส่ง `currentUser={user}` ไปยัง ChatLayout
- ✅ canCreateRoom logic ตรวจสอบ user.role

---

## 🎯 Workflows

### **Scenario 1: Teacher สร้างห้องและเพิ่มนักเรียน**

```
1. Teacher login (test-aj-123 / 123456)
   ↓
2. ขึ้น ChatSidebar → เห็นปุ่ม "+" สร้างห้องใหม่
   ↓
3. ใส่ชื่อห้อง → "IT Class 2024"
   ↓
4. Backend: ดึง ALL STUDENT → เพิ่มเข้าห้อง
   ↓
5. ห้องสร้างเสร็จ ทั้ง Teacher + All Students เป็นสมาชิก
   ↓
6. Teacher เห็นปุ่ม "➕ เพิ่มสมาชิก" ที่ header
   ↓
7. กด → AddStudentsModal เปิดขึ้น
   ↓
8. ค้นหา + เลือก students
   ↓
9. กด "เพิ่มเข้าห้อง"
   ↓
10. Backend: ตรวจ authorization → เพิ่ม members
    ↓
11. Success! ✅
```

### **Scenario 2: Student เข้าห้องแชท**

```
1. Student login (student-001 / password)
   ↓
2. เห็นห้อง "IT Class 2024" ที่ ChatSidebar
   ↓
3. ไม่มีปุ่ม "➕ เพิ่มสมาชิก" (เพราะ role = STUDENT)
   ↓
4. แชทได้ปกติ ✅
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|------------------|
| **Role Check** | ✅ `getStudents()`: TEACHER/ADMIN only |
| **Role Check** | ✅ `addMembersToRoom()`: TEACHER/ADMIN only |
| **Role Check** | ✅ `createRoom()`: TEACHER/ADMIN only |
| **User Validation** | ✅ Check memberIds exist in DB |
| **Duplicate Prevention** | ✅ Use upsert + unique constraint |
| **Authorization** | ✅ JWT via req.user |
| **Input Validation** | ✅ body/param validation |

---

## 📊 Database Relations

```
User (role: STUDENT | TEACHER | ADMIN)
  ↓
RoomMember (roomId, userId)
  ↓
Room (name, type)
  ↓
Message (content, userId, roomId)
```

**Unique Constraint:** `RoomMember(roomId, userId)` → no duplicate members

---

## 🧪 Test Accounts

### Teacher
```
Username: test-aj-123
Password: 123456
Role: TEACHER
```

### Students (Exist in DB)
```
student-001, student-002, ... (created by seed scripts)
Role: STUDENT
```

---

## 📝 API Documentation

### **1. GET /chat/students**
```http
GET /chat/students
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "user-id",
    "username": "student-001",
    "email": "student@school.com",
    "year": 1,
    "major": "IT"
  }
]

Response 403:
{ "error": "Only teacher or admin can view students" }
```

### **2. POST /chat/rooms**
```http
POST /chat/rooms
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Class Name",
  "memberIds": ["user-id-1", "user-id-2"]  // optional
}

Response 201:
{
  "id": "room-id",
  "name": "Class Name",
  "type": "manual",
  "members": [
    { "id": "member-id", "user": {...} }
  ]
}

Response 403:
{ "error": "Only teacher or admin can create rooms" }
```

### **3. POST /chat/rooms/:roomId/add-members**
```http
POST /chat/rooms/room-id/add-members
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "memberIds": ["user-id-1", "user-id-2", "user-id-3"]
}

Response 200:
{
  "message": "Members added successfully",
  "count": 3,
  "members": [...]
}

Response 403:
{ "error": "Only teacher or admin can add members to room" }
```

---

## ✨ Features Implemented

| # | Feature | Status |
|---|---------|--------|
| 1 | Create room (Teacher only) | ✅ |
| 2 | Auto-add all students to room | ✅ |
| 3 | Get students list | ✅ |
| 4 | Add members to existing room | ✅ |
| 5 | Role-based authorization | ✅ |
| 6 | Frontend modal for member selection | ✅ |
| 7 | Search students by name/email | ✅ |
| 8 | Multi-select students | ✅ |
| 9 | Test teacher account created | ✅ |
| 10 | Scroll fix for chat | ✅ (previous) |

---

## 🚀 How to Use

### **1. Backend Setup**
```bash
cd backend

# Create test teacher
node scripts/seed-teacher.js test-aj-123 123456

# Run server
npm run dev
```

### **2. Frontend Setup**
```bash
cd frontend

# Install & run
npm install
npm run dev
```

### **3. Test Flow**
1. Open browser → http://localhost:5173
2. Login as test-aj-123 / 123456
3. Click "+" to create room
4. Room auto-adds all students
5. Click "➕ เพิ่มสมาชิก" to add more (if needed)
6. Select students → "เพิ่มเข้าห้อง"
7. ✅ Members added!

---

## 📂 Files Changed/Created

### New Files
- ✅ `backend/scripts/seed-teacher.js`
- ✅ `frontend/src/components/chat/AddStudentsModal.tsx`

### Modified Files
- ✅ `backend/src/controllers/chat.js` (+2 functions)
- ✅ `backend/src/routes/chat.js` (+2 routes)
- ✅ `frontend/src/services/chat.js` (+2 methods)
- ✅ `frontend/src/components/chat/ChatWindow.tsx` (+modal integration)
- ✅ `frontend/src/pages/Chat.jsx` (+currentUser prop)

---

## ✅ Validation Checklist

- [x] Teacher can create room
- [x] Student cannot create room (403)
- [x] All students auto-added to room
- [x] GET /students returns student list
- [x] POST /add-members works
- [x] Authorization checks on all endpoints
- [x] Frontend modal displays correctly
- [x] Search functionality works
- [x] Multi-select works
- [x] Test account created successfully

---

**Status: 🟢 COMPLETE & READY TO USE**
