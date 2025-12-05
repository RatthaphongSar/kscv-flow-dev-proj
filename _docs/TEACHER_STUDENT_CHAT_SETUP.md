# ระบบแชท - Teacher & Student Management

## ✅ ฟีเจอร์ที่เพิ่มเติม

### 1. **Authorization: เฉพาะ Teacher สร้างห้องได้**
- ✅ `POST /chat/rooms` - ตรวจสอบ `role === 'TEACHER' || role === 'ADMIN'`
- ❌ Student ห้ามสร้างห้อง
- 📋 Return 403 Forbidden ถ้าไม่ใช่ Teacher/Admin

### 2. **Create Room แบบต่างๆ**

#### A. สร้างห้องและเพิ่ม All Students (ค่าเริ่มต้น)
```javascript
// ถ้าไม่ส่ง memberIds หรือส่งว่าง → backend ดึงนักเรียนทั้งหมด
POST /chat/rooms
{
  "name": "IT Year 1 Class 2024"
  // memberIds ว่าง → backend จะดึง role='STUDENT' ทั้งหมด
}
```

#### B. สร้างห้องกับ Students เฉพาะคน
```javascript
POST /chat/rooms
{
  "name": "Project Group A",
  "memberIds": ["user-id-1", "user-id-2", "user-id-3"]
}
```

### 3. **API ดึง Students (ใหม่)**
```
GET /chat/students
Authorization: Bearer <teacher-token>

Response:
[
  {
    "id": "student-id-1",
    "username": "student-001",
    "email": "student1@school.com",
    "year": 1,
    "major": "IT"
  },
  {
    "id": "student-id-2",
    "username": "student-002",
    "email": "student2@school.com",
    "year": 1,
    "major": "IT"
  }
]
```

### 4. **API เพิ่ม Students เข้าห้องที่มีอยู่ (ใหม่)**
```
POST /chat/rooms/:roomId/add-members
Authorization: Bearer <teacher-token>

Body:
{
  "memberIds": ["student-id-1", "student-id-2", "student-id-3"]
}

Response:
{
  "message": "Members added successfully",
  "count": 3,
  "members": [
    { "id": "member-id", "user": {...}, "roomId": "room-id", "userId": "student-id-1" },
    ...
  ]
}
```

## 📝 Test User ที่สร้างแล้ว

### Teacher Account
| Username | Password | Email |
|----------|----------|-------|
| test-aj-123 | 123456 | (optional) |

### การลอง
```bash
1. Login dengan test-aj-123 / 123456
2. ควรเห็น option "สร้างห้องแชท" ใน UI
3. สามารถดึง student list และเพิ่มเข้าห้องได้
```

## 📁 ไฟล์ที่สร้าง/แก้ไข

### Backend

#### 1. ✅ `scripts/seed-teacher.js` (NEW)
- สร้าง seed script สำหรับสร้าง Teacher user
- Usage: `node scripts/seed-teacher.js <username> <password> [email]`

#### 2. ✅ `src/controllers/chat.js`
- เพิ่ม `getStudents()` - ดึงรายชื่อนักเรียนทั้งหมด
- เพิ่ม `addMembersToRoom()` - เพิ่มนักเรียนเข้าห้อง
- ✅ `createRoom()` - ตรวจสอบ role (TEACHER/ADMIN)

#### 3. ✅ `src/routes/chat.js`
- เพิ่ม `GET /students` - ดึง student list
- เพิ่ม `POST /rooms/:roomId/add-members` - เพิ่มสมาชิก

### Frontend

#### 1. ✅ `src/services/chat.js`
- เพิ่ม `getStudents()` - call backend ดึง student list
- เพิ่ม `addMembersToRoom()` - call backend เพิ่มสมาชิก

## 🔒 Security & Validation

### Authorization Checks
- ✅ `getStudents()` - เฉพาะ TEACHER/ADMIN
- ✅ `addMembersToRoom()` - เฉพาะ TEACHER/ADMIN + ต้องเป็นสมาชิกห้องแล้ว
- ✅ `createRoom()` - เฉพาะ TEACHER/ADMIN

### Input Validation
- ✅ Room name required & non-empty
- ✅ memberIds must be array of valid user IDs
- ✅ ตรวจว่า user IDs มีอยู่จริงในฐานข้อมูล

## 🎯 Workflow สำหรับ Teacher

1. **Login** as Teacher (test-aj-123 / 123456)
2. **สร้างห้อง** "Class 2024 - IT" (auto add all students)
3. **ดูรายชื่อนักเรียน** via GET /chat/students
4. **เพิ่มนักเรียน** เข้าห้องที่มีอยู่ via POST /rooms/:roomId/add-members
5. **แชทได้เลย** ทั้ง Teacher และ Students

## 🚀 Next Steps (Optional)

1. **Frontend UI** - แสดง student picker เมื่อสร้าง/แก้ไขห้อง
2. **Student Management** - ลบนักเรียนออกจากห้อง (remove members)
3. **Notifications** - แจ้งเตือนเมื่อเพิ่มเข้าห้องใหม่
4. **Room Settings** - ให้ Teacher แก้ไขชื่อห้อง description ฯลฯ

---

## Database Schema
```
User
  - id (unique)
  - username (unique)
  - passwordHash
  - role: STUDENT | TEACHER | ADMIN
  - year
  - major

Room
  - id (unique)
  - name (unique)
  - type: 'manual' | 'auto'

RoomMember
  - roomId (FK)
  - userId (FK)
  - unique(roomId, userId)

Message
  - id (unique)
  - content
  - userId (FK)
  - roomId (FK)
  - createdAt
```

✅ **เสร็จเรียบร้อย!**
