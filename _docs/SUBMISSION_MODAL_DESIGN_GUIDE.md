# 🎨 Submission Confirmation Modal - Visual Design Guide

## Component Overview

### Modal Structure
```
┌──────────────────────────────────────────────────────────────────┐
│ ยืนยันการส่งงาน                                    [X] Close      │
│ 📤 กรุณาตรวจสอบข้อมูลก่อนส่งงาน                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ✓ สถานะปัจจุบัน: [ส่งแล้ว] [ได้รับการให้คะแนน] [ขอให้ส่งซ้ำ]   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Assignment Information:                                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ชื่องาน                                                    │ │
│ │ "Introduction to Database Systems"                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ คำอธิบาย                                                    │ │
│ │ "Design a normalized database schema for an e-commerce..." │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│ │ ส่งก่อน                    │  │ คะแนนเต็ม                    │ │
│ │ 25 พย 2568               │  │ 100 คะแนน                   │ │
│ │ ⚠️ งานนี้ส่งช้าแล้ว         │  │                              │ │
│ └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ เนื้อหาที่จะส่ง:                                                  │
│                                                                  │
│ 📝 เนื้อหาข้อความ:                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ CREATE TABLE customers (                                   │ │
│ │   id INT PRIMARY KEY,                                      │ │
│ │   name VARCHAR(100) NOT NULL,                             │ │
│ │   email VARCHAR(100) UNIQUE                               │ │
│ │ );                                                         │ │
│ │                                                            │ │
│ │ CREATE TABLE orders (                                      │ │
│ │   order_id INT PRIMARY KEY,                               │ │
│ │   customer_id INT FOREIGN KEY...                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 📎 ไฟล์ที่อัพโหลด:                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 📄 database_schema.pdf                                     │ │
│ │    อัพโหลดแล้ว                                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ [ยกเลิก]                          [ยืนยันการส่ง] 📤 (Loading...) │
│                                                                  │
│ 💡 หลังจากส่งงาน คุณสามารถตรวจสอบสถานะและให้อาจารย์ให้คะแนน    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Color Scheme & Status Badges

### Status Badges
```
Not Submitted:        Gray Badge
Submitted:            Blue Badge - "รอตรวจสอบ"
Graded:               Green Badge - "ได้รับการให้คะแนน"
Requested Resubmit:   Yellow Badge - "ขอให้ส่งซ้ำ"
Late:                 Red Badge - "ส่งล่าช้า"
```

### Theme Colors
```
Primary: Blue (#0A4DAD) - For submit button
Background: Dark Slate (#1f2937 / #0f172a)
Border: Subtle transparency (#374151/50)
Text: White / Light Gray
Success: Emerald Green
Warning: Amber/Yellow
Error: Red
```

---

## Component Props

```typescript
interface SubmissionConfirmationModalProps {
  isOpen: boolean;                          // Control modal visibility
  onClose: () => void;                      // Close handler
  assignment: {
    id: string;                             // Assignment ID
    title: string;                          // Assignment title
    description?: string;                   // Assignment description
    dueDate?: string;                       // ISO date string
    maxScore?: number;                      // Maximum score
  };
  submissionData: {
    content?: string;                       // Text content
    fileUrl?: string;                       // File URL/path
    fileName?: string;                      // Original filename
  };
  currentStatus?: 'not_submitted' | 
                  'submitted' | 
                  'graded' | 
                  'late' | 
                  'requested_resubmit' | 
                  null;
  isSubmitting?: boolean;                   // Loading state
  onConfirm: () => Promise<void>;           // Submission handler
}
```

---

## Interactive States

### 1. Normal State (Default)
- Both text and file previewed
- Submit button enabled
- All information visible

### 2. Loading State
- Button shows: 🔄 "กำลังส่ง..."
- Button disabled
- All interaction disabled
- Spinner animation

### 3. No Content Warning
- Submit button disabled
- Warning message shown
- "ไม่มีเนื้อหาหรือไฟล์ที่จะส่ง กรุณาเพิ่มข้อมูล"

### 4. Error State
- Red error box appears
- Error message displayed
- Submit button remains enabled
- User can try again

### 5. Late Submission State
- Red border on due date section
- "⚠️ งานนี้ส่งช้าแล้ว" message
- Still allows submission
- Teacher will see late flag

---

## Modal Sections

### Header Section
- 📤 Icon (Send icon)
- Title: "ยืนยันการส่งงาน"
- Subtitle: "กรุณาตรวจสอบข้อมูลก่อนส่งงาน"
- Close button (X)

### Status Section (Optional)
- Only shows if currentStatus exists
- Blue border-left accent
- Colored badge with status text
- "สถานะปัจจุบัน" label

### Assignment Details Section
- Title with label
- Description with line-clamp (max 3 lines)
- Due date with formatting
- Max score information
- Grid layout on desktop, stacked on mobile

### Submission Content Section
- Title: "เนื้อหาที่จะส่ง"
- Text content box:
  - File text icon
  - Label: "เนื้อหาข้อความ"
  - Pre-formatted text with wrapping
  - Max height with scrolling
- File attachment box:
  - File icon
  - Label: "ไฟล์ที่อัพโหลด"
  - Filename display
  - Status: "อัพโหลดแล้ว"
- Warning box (if no content):
  - Alert icon
  - Message in amber

### Error Message Section
- Shows only if error exists
- Red background with transparency
- Alert icon
- Error text

### Action Buttons
- Cancel button (secondary - slate)
- Confirm button (primary - blue gradient)
- Disabled state when no content
- Loading spinner on confirm button

### Footer
- Small hint text
- Translucent styling
- Information about next steps

---

## Responsive Behavior

### Desktop (1024px+)
- Max width: 900px
- Padding: 24px
- Full grid layout for dates/scores
- Max height with overflow scroll

### Tablet (640px - 1023px)
- Max width: 90vw
- Padding: 20px
- 2-column grid becomes stacked
- Slightly smaller fonts

### Mobile (< 640px)
- Full width with margin
- Single column layout
- Padding: 16px
- Close button repositioned
- Scroll friendly

---

## Typography

### Headings
- Modal title: Bold, 20px, white
- Section titles: Semibold, 14px, gray
- Labels: Tiny, uppercase, gray-400

### Body Text
- Assignment title: Bold, 16px, white
- Description: Regular, 14px, gray-300
- Content preview: Monospace, 12px (for code)
- Status badge: Bold, 14px, colored

### Button Text
- Semibold, 16px
- Uppercase tracking on labels
- Icons paired with text

---

## Accessibility Features

- ✅ Semantic HTML
- ✅ ARIA labels on icons
- ✅ Keyboard navigation (Tab through buttons)
- ✅ Focus states on buttons
- ✅ Sufficient color contrast
- ✅ Thai language support
- ✅ Disabled state visual feedback
- ✅ Loading state indication

---

## Animation & Transitions

```css
/* Modal Entry */
.modal {
  animation: fadeInScale 0.3s ease-out;
}

/* Backdrop */
.backdrop {
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(4px);
}

/* Button Hover */
.button:hover:not(:disabled) {
  transition: all 200ms ease;
  /* bg/shadow change */
}

/* Loading State */
.spinner {
  animation: spin 1s linear infinite;
}

/* Content Fade */
.content-section {
  animation: slideUp 0.3s ease-out;
}
```

---

## Error States

### File Not Selected
```
⚠️ Alert Icon
Message: "ไม่มีเนื้อหาหรือไฟล์ที่จะส่ง กรุณาเพิ่มข้อมูล"
Button: Disabled
Background: Amber-500/10
Border: Amber-500/30
```

### Submission Error
```
⚠️ Alert Icon
Message: "[Error from server - e.g., 'Submission already exists']"
Button: Enabled (user can retry)
Background: Red-500/10
Border: Red-500/30
```

### File Upload Failed
```
⚠️ Alert Icon
Message: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์"
Background: Red-500/10
Border: Red-500/30
```

---

## Example Usage in StudentAssignmentSubmission

```tsx
<SubmissionConfirmationModal
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  assignment={{
    id: "cmialb3ao0005vhusrqopfhnq",
    title: "Database Schema Design",
    description: "Design a normalized database...",
    dueDate: "2025-11-25T23:59:00",
    maxScore: 100
  }}
  submissionData={{
    content: "CREATE TABLE...",
    fileUrl: "/uploads/schema.pdf",
    fileName: "database_schema.pdf"
  }}
  currentStatus="submitted"
  isSubmitting={false}
  onConfirm={handleConfirmSubmit}
/>
```

---

## Performance Optimizations

- ✅ Lazy load modal (only render when open)
- ✅ No unnecessary re-renders
- ✅ Memoized status badge logic
- ✅ Smooth scroll on overflow
- ✅ Efficient truncation with CSS (line-clamp)

---

**Design Complete** ✅
Ready for integration and testing
