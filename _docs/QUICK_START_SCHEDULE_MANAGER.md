# 🚀 Quick Start - Schedule Manager Features

## 📌 What's New?

Two new features for teachers in the Class page:

### 1. **จัดการตารางเรียน** (Manage Schedule)
- Set weekly class schedule
- Plan assignments with dates
- View calendar of assignments

### 2. **คำขอเข้าร่วม** (Join Requests)
- Approve/reject student requests
- View student information
- Filter by status

---

## 🎯 How to Access

### Step 1: Login as Teacher
```
Email: teacher-demo@example.com
Password: 123456
```

### Step 2: Go to Classes
```
Menu → Classes → Select a class
```

### Step 3: Find New Tabs
Look at the tab bar - you'll see:
- **จัดการตารางเรียน** (New schedule management tab)
- **คำขอเข้าร่วม** (New join request button)

---

## 📋 Quick Tasks

### Add a Class Schedule
```
1. Click "จัดการตารางเรียน" tab
2. Click "เพิ่มตารางเรียน" button
3. Select day, time, room, building
4. Click "เพิ่ม"
```

### Plan Assignment
```
1. Stay in "จัดการตารางเรียน" tab
2. Click "แผนส่งงาน" sub-tab
3. Click "เพิ่มแผนส่งงาน"
4. Fill in: title, type, score, due date
5. Click "เพิ่ม"
```

### Approve Student Request
```
1. Click "คำขอเข้าร่วม" button
2. Modal window opens
3. Click "อนุมัติ" for student you want to approve
4. Status changes to "อนุมัติแล้ว"
```

---

## 🎨 Visual Guide

### Schedule Manager Tab
```
┌──────────────────────────────────────┐
│ ✓ ตารางเรียน | แผนส่งงาน             │
├──────────────────────────────────────┤
│ [+ เพิ่มตารางเรียน]                   │
├──────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐     │
│ │ อังคาร      │  │ อังคาร      │     │
│ │ 09:00-10:30 │  │ 09:00-10:30 │     │
│ │ ห้อง 302    │  │ ห้อง 302    │     │
│ │ [แก้ไข][ลบ] │  │ [แก้ไข][ลบ] │     │
│ └─────────────┘  └─────────────┘     │
└──────────────────────────────────────┘
```

### Join Request Modal
```
┌─────────────────────────────────────────┐
│ ✕ คำขอเข้าร่วมชั้นเรียน                 │
├─────────────────────────────────────────┤
│ 5 รอ | 3 อนุมัติ | 1 ปฏิเสธ | ทั้งหมด  │
├─────────────────────────────────────────┤
│ [ส] สมชาย สมหวัง                        │
│     somchai@email.com                  │
│     วิศวะคอมพิวเตอร์                    │
│                   [รอการอนุมัติ]        │
│ ┌──────────────────────────────────────┐
│ │    [ปฏิเสธ]           [อนุมัติ]      │
│ └──────────────────────────────────────┘
└─────────────────────────────────────────┘
```

---

## ⚡ Key Features

### Schedule Manager
- ✅ Add/Edit/Delete schedules
- ✅ Set day, time, room, building, type
- ✅ Add assignments with due dates
- ✅ Calendar view of assignments
- ✅ Month navigation (← →)
- ✅ All in Thai

### Join Request Modal
- ✅ See all student requests
- ✅ Filter by status
- ✅ View student info (name, email, major)
- ✅ Approve with one click
- ✅ Reject with one click
- ✅ Request timestamp shown

---

## 🎓 Assignment Types
```
✓ การบ้าน      (Homework)      - Blue
✓ แบบทดสอบ     (Quiz)          - Purple
✓ โครงงาน      (Project)       - Green
✓ สอบ          (Exam)          - Red
```

---

## 📅 Schedule Types
```
✓ บรรยาย       (Lecture)       - Regular class
✓ ห้องปฏิบัติการ (Lab)          - Hands-on session
✓ ทำเนียบ      (Tutorial)      - Problem solving
```

---

## 🔄 Workflow Example

### Monday - Teacher Setup
```
1. Add schedule: Monday 09:00-10:30 Lecture
2. Plan assignment: "Homework #1" due Friday
3. Wait for student requests
```

### Wednesday - Student Request
```
1. Student clicks "Join Class"
2. Request appears in your modal
```

### Wednesday - Approve
```
1. Click "คำขอเข้าร่วม" button
2. See student request
3. Click "อนุมัติ"
4. Student is now enrolled
```

---

## 💡 Pro Tips

### Schedule Planning
- Add all schedules for the semester upfront
- Use calendar to see assignment deadlines
- Plan major assignments well in advance
- Avoid overlapping schedules

### Join Requests
- Check regularly for new requests
- Approve serious students immediately
- Reject if student info is incomplete
- Use refresh button to see latest

### Best Practices
- Keep schedule consistent each week
- Space out major assignments
- Communicate schedule to students early
- Review join requests frequently

---

## 🐛 Troubleshooting

### "Button not working?"
```
→ Refresh page (F5)
→ Clear cache (Ctrl+Shift+Del)
→ Try different browser
```

### "Modal won't close?"
```
→ Click X button or backdrop
→ Refresh if stuck
```

### "Data not saving?"
```
→ Check internet connection
→ Verify backend is running
→ Check browser console (F12)
→ Try again or refresh
```

### "Can't see new schedule?"
```
→ Close and reopen modal
→ Click refresh button
→ Clear cache
→ Restart browser
```

---

## 📊 Data You Can Manage

### Schedule Information
```
- Day of week (Monday-Sunday)
- Start time (HH:mm format)
- End time (HH:mm format)
- Building name
- Room number
- Session type (lecture/lab/tutorial)
```

### Assignment Information
```
- Title (name of assignment)
- Description (details)
- Type (homework/quiz/project/exam)
- Max score (points possible)
- Due date (deadline)
```

### Student Information
```
- Name (from system)
- Email (from system)
- Major (optional, if available)
- Request date/time
- Current status
```

---

## 🔐 Permissions

### Teachers Can:
- ✅ View all schedules
- ✅ Create schedules
- ✅ Edit schedules
- ✅ Delete schedules
- ✅ View all assignments
- ✅ Create assignments
- ✅ Edit assignments
- ✅ Delete assignments
- ✅ View join requests
- ✅ Approve join requests
- ✅ Reject join requests

### Students Cannot:
- ❌ Access schedule manager
- ❌ View calendar
- ❌ Approve/reject requests
- ✅ View their own schedule (different UI)
- ✅ Send join request
- ✅ View assignments

---

## 📞 Need Help?

### Check Documentation
```
File: SCHEDULE_MANAGER_USER_GUIDE.md
Path: Root of project
Details: Step-by-step guide with examples
```

### Check API Docs
```
File: SCHEDULE_MANAGER_API_INTEGRATION.md
Path: Root of project
Details: Technical API information
```

### Check Implementation
```
File: SCHEDULE_MANAGER_IMPLEMENTATION.md
Path: Root of project
Details: Component details and architecture
```

---

## ⏱️ Typical Usage Times

### First Time Setup
- 5-10 minutes to add all schedules
- 5 minutes to plan assignments

### Weekly Maintenance
- 2 minutes to check join requests
- 1 minute to answer questions

### Monthly Review
- 5 minutes to review calendar
- Update assignments as needed

---

## 🎉 You're All Set!

**That's it!** You now have:
- ✅ Schedule management system
- ✅ Assignment calendar
- ✅ Join request approval workflow
- ✅ Full Thai language support

### Next Steps:
1. Add your class schedules
2. Plan your assignments
3. Wait for student requests
4. Approve students

---

**Enjoy the new features!** 🚀

For detailed information, see the comprehensive guides in the project root.
