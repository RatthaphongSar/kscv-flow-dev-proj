# ระบบจัดการตารางเรียนและคำขอเข้าร่วม - เอกสารการสร้าง

**วันที่:** 22 พฤศจิกายน 2568  
**สถานะ:** ✅ สร้างเสร็จแล้ว - พร้อมใช้งาน

---

## 📋 ภาพรวม

เพิ่มเติมสองคอมโพเนนต์ React ใหม่ที่ออกแบบมาเฉพาะสำหรับครู เพื่อจัดการตารางเรียนและการอนุมัติคำขอเข้าร่วมชั้นเรียน

### ✨ คุณสมบัติใหม่
1. **ClassScheduleManager** - ระบบจัดการตารางเรียนและแผนส่งงาน
2. **JoinRequestModal** - โมดัลสำหรับจัดการคำขอเข้าร่วมจากนักเรียน

---

## 🎯 ClassScheduleManager Component

### ตำแหน่งไฟล์
```
frontend/src/components/class/ClassScheduleManager.tsx
```

### ความสามารถ

#### 1. **ตารางเรียนรายสัปดาห์**
- ✅ เพิ่มตารางเรียน (วัน เวลา ห้อง อาคาร ประเภท)
- ✅ แก้ไขตารางเรียนที่มีอยู่
- ✅ ลบตารางเรียน
- ✅ ประเภท: บรรยาย (Lecture), ห้องปฏิบัติการ (Lab), ทำเนียบ (Tutorial)
- ✅ กำหนดเวลา: ชั่วโมงเริ่มต้น - ชั่วโมงสิ้นสุด

#### 2. **แผนส่งงาน (Assignment Planning)**
- ✅ เพิ่มแผนส่งงาน (ชื่อ วันที่ ประเภท คะแนน คำอธิบาย)
- ✅ แก้ไขแผนส่งงาน
- ✅ ลบแผนส่งงาน
- ✅ ประเภทงาน: การบ้าน, แบบทดสอบ, โครงงาน, สอบ
- ✅ คะแนนสูงสุดสำหรับแต่ละงาน
- ✅ ปฏิทินแสดงการส่งงาน (visual calendar)

#### 3. **ปฏิทินแสดงการส่งงาน**
- ✅ แสดงเดือนปัจจุบัน
- ✅ นำทางเดือนก่อน/ถัดไป
- ✅ เน้นวันที่มีการส่งงาน
- ✅ แสดงจำนวนงานแต่ละวัน

### Props
```typescript
interface ClassScheduleManagerProps {
  classId: string;    // ID ของชั้นเรียน
  className: string;  // ชื่อชั้นเรียน (ไม่บังคับ)
}
```

### API Integration
```typescript
// ตารางเรียน
classApi.getSchedule(classId)
classApi.createSchedule(classId, scheduleData)
classApi.updateSchedule(classId, scheduleId, updateData)
classApi.deleteSchedule(classId, scheduleId)

// แผนส่งงาน
classApi.getClassAssignments(classId)
classApi.createAssignmentPlan(classId, planData)
classApi.updateAssignmentPlan(classId, planId, updateData)
classApi.deleteAssignmentPlan(classId, planId)
```

### ตัวอย่างข้อมูล

**ตารางเรียน:**
```typescript
{
  dayOfWeek: 0,           // 0-6 (จันทร์-อาทิตย์)
  startTime: "09:00",     // HH:mm
  endTime: "10:30",       // HH:mm
  room: "302",
  building: "อาคาร A",
  type: "lecture"         // lecture | lab | tutorial
}
```

**แผนส่งงาน:**
```typescript
{
  title: "บันทึกการทดลอง",
  dueDate: "2568-11-28",
  assignmentType: "homework",  // homework | quiz | project | exam
  maxScore: 100,
  description: "บรรยายรายละเอียด..."
}
```

### UI Features
- ✅ Tabbed interface (ตารางเรียน vs แผนส่งงาน)
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Thai language support
- ✅ Dark theme compatible
- ✅ Responsive design

### สี Theme
- ปกติ: Slate (gray/dark)
- ชนิด: Violet (primary)
- บันทึก: Blue
- สอบ: Red
- โครงงาน: Green
- แบบทดสอบ: Purple

---

## 🎯 JoinRequestModal Component

### ตำแหน่งไฟล์
```
frontend/src/components/class/JoinRequestModal.tsx
```

### ความสามารถ

#### 1. **แสดงคำขอเข้าร่วม**
- ✅ ฟิลเตอร์ตามสถานะ (รอ อนุมัติ ปฏิเสธ ทั้งหมด)
- ✅ สรุปสถิติ (จำนวนคำขอแต่ละประเภท)
- ✅ ข้อมูลนักเรียน (ชื่อ เมล สาขาวิชา)
- ✅ วันที่ขอเข้าร่วม

#### 2. **การอนุมัติคำขอ**
- ✅ ปุ่มอนุมัติ (สีเขียว)
- ✅ ปุ่มปฏิเสธ (สีแดง)
- ✅ ก่อนหน้านี้จะปิดปุ่มหลังจากอนุมัติ/ปฏิเสธ
- ✅ Loading states สำหรับแต่ละปุ่ม

#### 3. **UI Elements**
- ✅ โมดัล backdrop ที่สามารถปิดได้
- ✅ ปุ่มปิดโมดัล (X)
- ✅ ปุ่มรีเฟรช เพื่อโหลดข้อมูลใหม่
- ✅ Scrollable content
- ✅ Status badges (สี-coded)

### Props
```typescript
interface JoinRequestModalProps {
  isOpen: boolean;              // แสดง/ซ่อน โมดัล
  onClose: () => void;          // ปิดโมดัล callback
  classId: string;              // ID ของชั้นเรียน
  className: string;            // ชื่อชั้นเรียน
}
```

### API Integration
```typescript
classApi.getJoinRequests(classId)           // ดึงคำขอ
classApi.approveJoinRequest(requestId)      // อนุมัติ
classApi.rejectJoinRequest(requestId)       // ปฏิเสธ
```

### ตัวอย่างข้อมูล

**JoinRequest:**
```typescript
{
  id: "req-123",
  studentId: "st-001",
  studentName: "สมชาย สมหวัง",
  studentEmail: "somchai@email.com",
  studentMajor: "วิทยาศาสตร์คอมพิวเตอร์",
  classId: "cls-001",
  status: "pending",              // pending | approved | rejected
  requestedAt: "2568-11-22T10:30:00Z"
}
```

### สี Status
- **รอการอนุมัติ (Pending)**: สีเหลือง
  - ✅ แสดงปุ่มอนุมัติ/ปฏิเสธ
- **อนุมัติแล้ว (Approved)**: สีเขียว
  - ❌ ปิดปุ่มดำเนิน
- **ปฏิเสธแล้ว (Rejected)**: สีแดง
  - ❌ ปิดปุ่มดำเนิน

---

## 🔗 Integration with Class.jsx

### Import
```typescript
import ClassScheduleManager from "../components/class/ClassScheduleManager";
import JoinRequestModal from "../components/class/JoinRequestModal";
```

### State
```typescript
const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
```

### Tabs Added
```typescript
{/* ตารางเรียน - Teacher only */}
<button onClick={() => setActiveTab("scheduleManager")}>
  จัดการตารางเรียน
</button>

{/* คำขอเข้าร่วม - Teacher only */}
<button onClick={() => setIsJoinRequestModalOpen(true)}>
  คำขอเข้าร่วม
</button>
```

### Render
```typescript
{/* Schedule Manager Tab */}
{activeTab === "scheduleManager" && userRole === "TEACHER" && (
  <ClassScheduleManager classId={selectedId} className={selectedClass?.name} />
)}

{/* Join Request Modal */}
<JoinRequestModal 
  isOpen={isJoinRequestModalOpen} 
  onClose={() => setIsJoinRequestModalOpen(false)} 
  classId={selectedId}
  className={selectedClass?.name}
/>
```

---

## 🔧 API Methods Added to classApi.ts

```typescript
// Schedule Management
createSchedule(classId: string, scheduleData: any)
updateSchedule(classId: string, scheduleId: string, updateData: any)
deleteSchedule(classId: string, scheduleId: string)

// Assignment Planning
createAssignmentPlan(classId: string, planData: any)
updateAssignmentPlan(classId: string, planId: string, updateData: any)
deleteAssignmentPlan(classId: string, planId: string)
```

---

## 🎨 UI/UX Details

### Dark Theme
- ✅ Slate-800 background
- ✅ Slate-700 borders
- ✅ Violet-600 primary buttons
- ✅ Color-coded status indicators
- ✅ Hover states for all interactive elements

### Responsive Design
- ✅ Mobile-first approach
- ✅ Grid layouts
- ✅ Scrollable on small screens
- ✅ Touch-friendly buttons

### Accessibility
- ✅ Semantic HTML
- ✅ Clear labels
- ✅ Descriptive buttons
- ✅ Loading states
- ✅ Error messages

---

## 📝 Thai Language Support

ทั้งสองคอมโพเนนต์รองรับภาษาไทยเต็มรูปแบบ:

**ClassScheduleManager:**
- จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์, อาทิตย์
- บรรยาย, ห้องปฏิบัติการ, ทำเนียบ
- การบ้าน, แบบทดสอบ, โครงงาน, สอบ
- ปฏิทินแสดงการส่งงาน

**JoinRequestModal:**
- คำขอเข้าร่วมชั้นเรียน
- สถานะการอนุมัติ
- ปุ่มการกระทำ
- ข้อมูลนักเรียน

---

## ✅ ทดสอบ (Manual Testing Checklist)

### ClassScheduleManager
- [ ] เพิ่มตารางเรียนใหม่
- [ ] แก้ไขตารางเรียนที่มีอยู่
- [ ] ลบตารางเรียน
- [ ] เพิ่มแผนส่งงาน
- [ ] แก้ไขแผนส่งงาน
- [ ] ลบแผนส่งงาน
- [ ] ปฏิทินแสดงการส่งงานอย่างถูกต้อง
- [ ] นำทางเดือนในปฏิทิน
- [ ] Loading state ทำงาน
- [ ] Error handling ทำงาน

### JoinRequestModal
- [ ] เปิดโมดัล
- [ ] ฟิลเตอร์ตามสถานะ
- [ ] อนุมัติคำขอ
- [ ] ปฏิเสธคำขอ
- [ ] รีเฟรชข้อมูล
- [ ] ปิดโมดัล
- [ ] Status badges แสดงถูก
- [ ] Loading states ทำงาน

---

## 🚀 การใช้งาน

### สำหรับครู

1. **เข้าสู่ชั้นเรียน**
   - ไปที่เมนูหลัก เลือกชั้นเรียน

2. **จัดการตารางเรียน**
   - คลิกแท็บ "จัดการตารางเรียน"
   - เลือกแท็บ "ตารางเรียน"
   - เพิ่ม/แก้ไข/ลบตารางเรียน

3. **วางแผนส่งงาน**
   - ยังคงอยู่ในแท็บ "จัดการตารางเรียน"
   - คลิกแท็บ "แผนส่งงาน"
   - เพิ่ม/แก้ไข/ลบแผนส่งงาน
   - ดูปฏิทินการส่งงาน

4. **อนุมัติคำขอเข้าร่วม**
   - คลิกปุ่ม "คำขอเข้าร่วม" ในแท็บ
   - ดูคำขอที่รอการอนุมัติ
   - คลิก "อนุมัติ" หรือ "ปฏิเสธ"

---

## 🔐 ความปลอดภัย

- ✅ ก่อนหน้านี้เฉพาะครูเท่านั้นที่สามารถเข้าถึงแท็บนี้
- ✅ API calls ใช้ JWT authentication
- ✅ Role-based access control (TEACHER only)
- ✅ CORS enabled สำหรับ credentials

---

## 📦 Dependencies

ไม่มี dependencies ภายนอกใหม่ (ใช้ existing dependencies):
- React
- Lucide icons
- Tailwind CSS
- TypeScript

---

## 🐛 Known Issues / Future Improvements

### ปัจจุบัน
- [ ] API endpoints ยังไม่สมบูรณ์ (mock data ใช้ได้)
- [ ] ไม่มี notification ของ real-time updates
- [ ] ไม่มี undo/redo functionality

### ข้อเสนอในอนาคต
- [ ] เพิ่ม drag-and-drop สำหรับตารางเรียน
- [ ] เพิ่ม bulk operations (นำเข้า/ส่งออก CSV)
- [ ] เพิ่ม notifications ในแล้ว
- [ ] Integrate กับ Google Calendar
- [ ] Schedule templates ที่เตรียมไว้ล่วงหน้า

---

## 📊 Git Commit

```
commit 4c6ed10
Author: GitHub Copilot
Date:   Nov 22, 2025

    feat: Add ClassScheduleManager and JoinRequestModal components with calendar and request management

    - Create ClassScheduleManager.tsx with schedule and assignment planning
    - Create JoinRequestModal.tsx with join request management
    - Add new API methods to classApi.ts
    - Integrate components into Class.jsx
    - Add support for Thai language UI
    - Support dark theme and responsive design
```

---

## 📚 References

- **Frontend**: `frontend/src/pages/Class.jsx`
- **API Client**: `frontend/src/api/classApi.ts`
- **Components**: `frontend/src/components/class/`
- **Styles**: Tailwind CSS (no separate stylesheets)

---

**สถานะ**: ✅ พร้อมใช้งาน  
**วันสิ้นสุด**: 22 พฤศจิกายน 2568  
**ผู้สร้าง**: GitHub Copilot
