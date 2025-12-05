# ระบบการเข้าเรียน - Visual Guide

## 🎬 UI Mockup

### 1. Attendance Tab (Teacher View)

```
┌──────────────────────────────────────────────────────┐
│ 📍 Attendance                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📋 การเข้าเรียน                                 │
│  │ ตั้งค่าช่วงเรียน สอบ หรือเก็บคะแนน              │
│  │                         [⚙️  ตั้งค่า]           │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [วันที่ selector ..................] [Mark attendance] │
│                                                      │
│  ┌─────┬─────┬─────┬──────┬───────┐              │
│  │Name │Present│Absent│Late │Excuse │              │
│  ├─────┼─────┼─────┼──────┼───────┤              │
│  │ Student 1   │[●] │[ ] │[ ]  │[ ]   │              │
│  │ Student 2   │[ ] │[●] │[ ]  │[ ]   │              │
│  │ Student 3   │[ ] │[ ] │[●]  │[ ]   │              │
│  └─────┴─────┴─────┴──────┴───────┘              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. Settings Modal (Opening)

```
┌─────────────────────────────────────────────────────┐
│ 📋 การเข้าเรียน                                [×]  │
│ ตั้งค่าช่วงเรียน สอบ หรือเก็บคะแนน                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ⚫ ยังไม่มีการเข้าเรียน                              │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [➕ เพิ่มการเข้าเรียน]           [ปิด]            │
└─────────────────────────────────────────────────────┘
```

### 3. Add Form (Expanded)

```
┌─────────────────────────────────────────────────────┐
│ 📋 การเข้าเรียน                                [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │ ชื่อหัวข้อ *           │ ประเภท *             │  │
│ │ [สอบกลางภาค........] │ [เรียน........]      │  │
│ │                       │                      │  │
│ │ วันเริ่มต้น *         │ วันสิ้นสุด           │  │
│ │ [2567-11-24] │ [2567-11-25] │  │
│ │                       │                      │  │
│ │ หมายเหตุ                                     │  │
│ │ [สอบ 1.5 ชั่วโมง...]                        │  │
│ │                       │                      │  │
│ │                [บันทึก]    [ยกเลิก]         │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ 🟢 เรียน                                            │
│ วันที่: 24-11-2567                                │
│ 👥 นักเรียนเข้าแล้ว: 25 คน                        │
│    [✏️] [🗑️]                                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [➕ เพิ่มการเข้าเรียน]           [ปิด]            │
└─────────────────────────────────────────────────────┘
```

### 4. List View (Multiple Sessions)

```
┌─────────────────────────────────────────────────────┐
│ 📋 การเข้าเรียน                                [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔵 เรียน                                            │
│ Lesson 1: Introduce Grammar                        │
│ 📅 22-11-2567                                      │
│ Grammar introduction class                         │
│ 👥 นักเรียนเข้าแล้ว: 28 คน                        │
│    [✏️] [🗑️]                                       │
│                                                     │
│ 🟠 สอบกลางภาค                                      │
│ Midterm Exam                                       │
│ 📅 24-11-2567 - 25-11-2567                       │
│ 👥 นักเรียนเข้าแล้ว: 26 คน                        │
│    [✏️] [🗑️]                                       │
│                                                     │
│ 🟢 เก็บคะแนน                                        │
│ Attendance Check                                    │
│ 📅 23-11-2567 - 30-11-2567                       │
│ Checking attendance                                │
│ 👥 นักเรียนเข้าแล้ว: 15 คน                        │
│    [✏️] [🗑️]                                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [➕ เพิ่มการเข้าเรียน]           [ปิด]            │
└─────────────────────────────────────────────────────┘
```

### 5. Delete Confirmation

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  ลบการเข้าเรียน                          [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  คุณแน่ใจว่าต้องการลบการเข้าเรียนนี้หรือไม่?       │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│          [ยกเลิก]        [🗑️ ลบ]               │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Color System

```
Type             Color    Hex        Usage
────────────────────────────────────────────
Lesson (เรียน)    🔵 Blue  #3B82F6    Regular classes
Midterm           🟠 Orange #F97316    Mid-semester exam
Final             🔴 Red   #EF4444    End-semester exam
Quiz              🟣 Purple #A855F7    Short tests
Collection        🟢 Green  #22C55E    Attendance/points
```

---

## 📱 Responsive Design

### Desktop (1280px+)
```
┌─────────────────────────────────────┐
│  (Full width modal, 2 columns)      │
│  Subject | Type                     │
│  Start   | End                      │
│  Description (full width)           │
└─────────────────────────────────────┘
```

### Tablet (768px - 1279px)
```
┌────────────────────────┐
│  (2xl max-width modal) │
│  Subject | Type        │
│  Start   | End         │
└────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│ (Full width) │
│ Subject      │
│ Type         │
│ Start        │
│ End          │
│ Description  │
└──────────────┘
```

---

## 🎯 User Flow

### Teacher Adding Session

```
1. Click "Attendance" Tab
   ↓
2. Click "ตั้งค่า" Button
   ↓
3. Modal Opens
   ↓
4. Click "เพิ่มการเข้าเรียน"
   ↓
5. Form Appears
   ↓
6. Fill Required Fields
   ├─ Subject *
   ├─ Type *
   └─ Start Date *
   ↓
7. (Optional) Fill Extra Fields
   ├─ End Date
   └─ Description
   ↓
8. Click "บันทึก"
   ↓
9. Appear in List
   ↓
10. Close Modal
```

### Editing Session

```
1. Find Session in List
   ↓
2. Click ✏️ Icon
   ↓
3. Form appears with data
   ↓
4. Edit Fields
   ↓
5. Click "บันทึก"
   ↓
6. Update in List
```

### Deleting Session

```
1. Find Session in List
   ↓
2. Click 🗑️ Icon
   ↓
3. Confirmation Modal appears
   ↓
4. Click "ลบ"
   ↓
5. Remove from List
   ↓
6. Confirmation message
```

---

## 📊 Data Display

### Per Session Card

```
┌─────────────────────────────────┐
│ [🔵 Type Label]                 │
│ Subject Name                    │
│ 📅 Start Date - End Date        │
│ Description (if any)            │
│ 👥 นักเรียนเข้าแล้ว: X คน       │
│              [✏️] [🗑️]          │
└─────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────┐
│ [████████░░░░░░░░░░] Loading... │
└─────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────┐
│      ⚫ ยังไม่มีการเข้าเรียน     │
└─────────────────────────────────┘
```

---

## 🔄 State Diagram

```
               ┌─────────────────────┐
               │  Modal Closed       │
               └──────────┬──────────┘
                          │
                   Click "ตั้งค่า"
                          ↓
               ┌─────────────────────┐
               │  Modal Open         │
               │  Show Session List  │
               └──────────┬──────────┘
                          │
                   Click "เพิ่ม"
                          ↓
               ┌─────────────────────┐
               │  Show Form          │
               │  Type: Create       │
               └──────────┬──────────┘
                    │         │
               ไม่บันทึก    บันทึก
                    │         │
               Cancel    Loading
                    │         │
                    │         ↓
                    │  ┌─────────────────────┐
                    │  │  API Call           │
                    │  └──────────┬──────────┘
                    │             │
                    │        Success/Error
                    │             │
                    │             ↓
                    │  ┌─────────────────────┐
                    │  │  Update List        │
                    │  └──────────┬──────────┘
                    │             │
                    └──────┬──────┘
                           │
                  Show Updated List
                           │
                           ↓
                    Ready for Next Action
```

---

## ⌨️ Keyboard Navigation

- **Tab**: Move between fields
- **Enter**: Submit form
- **Esc**: Close modal
- **Delete**: Focus delete button
- **Space**: Toggle dropdown

---

## 🎬 Animation Timing

```
Action              Duration   Easing
───────────────────────────────────────
Modal Enter         300ms      ease-out
Modal Exit          200ms      ease-in
Button Hover        150ms      ease-out
Loading Spin        2000ms     linear
Form Transition     200ms      ease-in-out
```

---

## 📐 Spacing

```
Modal Padding:        16px (p-4)
Card Padding:         12px (p-3)
Form Gap:             12px (gap-3)
Input Padding:        8px-12px
Button Padding:       8px-12px
Border Radius:        8px (rounded-lg)
```

---

## 🎯 Focus States

```
Input Focus:
  Border: #3B82F6
  Outline: 1px solid #3B82F6
  Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

Button Focus:
  Outline: 2px solid #3B82F6
  Offset: 2px

Modal Focus:
  Backdrop blur: 4px
```

---

## ✨ Hover States

```
Button Hover:       Darker shade + smooth transition
Card Hover:         Border change + shadow
Icon Hover:         Color change (gray → blue/red)
Link Hover:         Underline + color change
```

---

## 🌙 Dark Mode Support

All components have dark mode variants:
- ✅ Background colors
- ✅ Text colors
- ✅ Border colors
- ✅ Hover states
- ✅ Focus states

---

## 📋 Accessibility

```
✅ Semantic HTML
✅ ARIA labels
✅ Keyboard navigation
✅ Focus indicators
✅ Color contrast (WCAG AA)
✅ Screen reader support
✅ Form labels
✅ Error announcements
```

---

**Design System**: Tailwind CSS
**Component Library**: Lucide React Icons
**Framework**: React 18 + TypeScript
**Status**: ✅ Production Ready
