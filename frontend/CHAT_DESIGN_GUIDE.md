# Chat UI Design Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Chat Page - Modern Messenger-Style Design                              │
├─────────────────┬───────────────────────────┬────────────────────────────┤
│                 │                           │                            │
│  Conversations  │  Conversation View        │  Details Panel (NEW)       │
│  List (Left)    │  (Middle)                 │  (Right - 320px)           │
│                 │                           │                            │
│  • Recent       │  ┌───────────────────┐   │  ┌──────────────────────┐  │
│  • Pinned       │  │ Messages          │   │  │  [👤] Avatar (80px)  │  │
│  • Archived     │  │                   │   │  │                      │  │
│                 │  │ [User]            │   │  │   John Smith         │  │
│                 │  │ Hello! How are    │   │  │   @ Student          │  │
│                 │  │ you? I wanted to  │   │  │   🟢 Online          │  │
│                 │  │ discuss the       │   │  │                      │  │
│                 │  │ project...        │   │  │  [💬][☎️][🎥][ⓘ]   │  │
│                 │  │                   │   │  ├──────────────────────┤  │
│                 │  │        [Me]       │   │  │ 🔍 Search messages   │  │
│                 │  │ That sounds       │   │  ├──────────────────────┤  │
│                 │  │ great! Let's      │   │  │ ▼ Attachments (3)    │  │
│                 │  │ start soon.       │   │  │ ├─ 📄 Report.pdf     │  │
│                 │  │                   │   │  │ │  12.5 MB   [⬇️]    │  │
│                 │  │ [User]            │   │  │ ├─ 📄 Notes.docx     │  │
│                 │  │ [📄 Project.pdf]  │   │  │ │  2.3 MB    [⬇️]    │  │
│                 │  │                   │   │  │ └─ 🖼️ Screenshot.jpg │  │
│                 │  │ ├─────────────────┤   │  │    1.8 MB    [⬇️]    │  │
│                 │  │ │ Message Input   │   │  ├──────────────────────┤  │
│                 │  │ │ Type message... │   │  │ ▼ Notes (2)          │  │
│                 │  │ │ [📎][😊][📤]   │   │  │ ├─ Follow up on      │  │
│                 │  │ │ @mention helper │   │  │ │  deadline          │  │
│                 │  │ └─────────────────┘   │  │ └─ Confirm next      │  │
│                 │  │ 14:32                  │  │    meeting time      │  │
│                 │  └───────────────────┘   │  │ [+ Add note]         │  │
│                 │                           │  ├──────────────────────┤  │
│                 │                           │  │ ▼ Tasks (4)          │  │
│                 │                           │  │ ✓ Review proposal    │  │
│                 │                           │  │ ☐ Send feedback      │  │
│                 │                           │  │ ☐ Schedule meeting   │  │
│                 │                           │  │ ☐ Update timeline    │  │
│                 │                           │  │ [+ Add task]         │  │
│                 │                           │  └──────────────────────┘  │
│                 │                           │                            │
└─────────────────┴───────────────────────────┴────────────────────────────┘
```

## Component Details

### ChatDetailsPanel (Right Sidebar)
```
Width: 320px (w-80)
Background: White (#FFFFFF)
Border: Left 1px solid #E5E7EB

┌─ User Header (6 units padding, centered)
│  ├─ Avatar Circle
│  │  └─ Size: 80x80px (w-20 h-20)
│  │  └─ Background: Gradient blue (#0A4DAD to #0863a8)
│  │  └─ Font: Initials in bold white
│  │  └─ Margin-bottom: 12px
│  ├─ User Name
│  │  └─ Font: lg, semibold, text-gray-900
│  ├─ Role Badge
│  │  └─ Font: sm, text-gray-500
│  │  └─ Prefix: "@"
│  ├─ Status Indicator
│  │  └─ Dot: 2.5x2.5px, green-500 (online)
│  │  └─ Text: xs, capitalized, text-gray-600
│  └─ Action Buttons (4 buttons, center aligned, gap-2)
│     └─ Size: 8x8 (32x32px)
│     └─ Background: Light blue (#F5F9FF)
│     └─ Border: none
│     └─ Hover: Darker blue (#E8F1FF)
│     └─ Emoji: 💬 ☎️ 🎥 ⓘ
│
├─ Search Section
│  ├─ Border-bottom: 1px solid #E5E7EB
│  └─ Input box
│     └─ Placeholder: "Search messages..."
│     └─ Padding: px-3 py-2
│     └─ Border: gray-300
│     └─ Focus: Border #0A4DAD
│
├─ Collapsible Sections (Repeat pattern)
│  ├─ Header Bar (py-3 px-4)
│  │  ├─ Section Title (text-sm, font-medium, gray-900)
│  │  ├─ Count Badge (text-xs, bg-gray-200, px-2 py-0.5, rounded-full)
│  │  └─ Chevron Icon (rotates on open)
│  │
│  ├─ Content Area (px-4 pb-3, bg-gray-50, space-y-2)
│  │  └─ Items (text-sm)
│  │
│  └─ Border-bottom between sections
│
├─ Attachments Section
│  ├─ List items with:
│  │  ├─ Icon: 📎 (text-lg)
│  │  ├─ Filename (text-sm, font-medium, truncated)
│  │  ├─ File size (text-xs, gray-500)
│  │  └─ Download button (⬇️, visible on hover)
│  └─ Hover effect: bg-gray-50
│
├─ Notes Section
│  ├─ Note items with:
│  │  ├─ Left border (2px, yellow-300)
│  │  ├─ Background: white
│  │  ├─ Text: sm, gray-700
│  │  └─ Padding: p-2
│  └─ Add note button (blue text, border)
│
└─ Tasks Section
   ├─ Checkbox items with:
   │  ├─ Checkbox (w-4 h-4, rounded, blue theme)
   │  ├─ Task text (sm)
   │  ├─ Strikethrough for completed
   │  └─ Hover: bg-white
   └─ Add task button (blue text, border)
```

### MessageBubble Styling
```
Sent Message (from current user):
┌─────────────────────────────────┐
│ Message text here...            │  ← Right aligned
│ Color: white on #0A4DAD         │
│ Shadow: md (box-shadow)         │
│ Padding: px-4 py-2.5           │
│ Border-radius: rounded-2xl      │
└─────────────────────────────────┘
                            14:32  ← Small blue timestamp

Received Message (from other user):
┌─────────────────────────────────┐
│ Message text here...            │  ← Left aligned
│ Color: gray-900 on #E8F1FF      │
│ Shadow: sm                      │
│ Padding: px-4 py-2.5           │
│ Border-radius: rounded-2xl      │
└─────────────────────────────────┘
14:31  ← Small gray timestamp

Attachment Preview:
┌─────────────────────────────────┐
│ 📄 filename.pdf                 │
│ 12.5 MB                    [⬇️] │
│ (Gradient gray background)      │
└─────────────────────────────────┘

Image Attachment:
┌─────────────────────────────────┐
│ [Full-width image preview]       │
│ Rounded corners, shadow          │
└─────────────────────────────────┘

Mention Highlighting:
Text: "Hello @John Smith let's meet"
Display: "Hello [yellow-gradient]@John Smith[/gradient] let's meet"
- Background gradient: yellow-200 to yellow-100
- Text color: yellow-900
- Padding: px-1.5 py-0.5
- Border-radius: rounded-md
```

## Color System

### Primary Colors
- **Brand Blue**: `#0A4DAD` (buttons, links, highlights)
- **Light Blue**: `#F5F9FF` (backgrounds)
- **Secondary Blue**: `#E8F1FF` (received bubbles)

### Neutral Colors
- **Gray-50**: `#F9FAFB` (section backgrounds)
- **Gray-100**: `#F3F4F6` (hover states)
- **Gray-300**: `#D1D5DB` (borders)
- **Gray-500**: `#6B7280` (secondary text)
- **Gray-900**: `#111827` (primary text)

### Semantic Colors
- **Green-500**: `#22C55E` (online status)
- **Yellow-100 to Yellow-200**: Mention highlights
- **Red**: Error states (not shown in basic flow)

## Typography

### Font Stack
- **Family**: Poppins (globally applied in main.jsx)
- **Font-weight**:
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

### Text Sizes
- **Avatar Initials**: text-3xl (font-bold)
- **User Name**: text-lg (font-semibold)
- **Section Headers**: text-sm (font-medium)
- **Message Text**: text-sm
- **Details/Timestamps**: text-xs

## Spacing System

### Padding
- **Large**: p-6 (24px) - User header section
- **Medium**: p-4 (16px) - Standard section padding
- **Small**: p-3 (12px) - Message items
- **Tiny**: p-2 (8px) - Input fields

### Gap/Margins
- **Large**: gap-4 (16px) - Section spacing
- **Medium**: gap-2 (8px) - Item spacing
- **Small**: gap-1 (4px) - Icon spacing
- **Tiny**: mb-1 (4px) - Inline spacing

## Interactions

### Hover States
- **Buttons**: Darken background, scale transform
- **Attachments**: bg-gray-50, opacity animation on download button
- **Messages**: Subtle shadow enhancement
- **Checkbox**: Focus ring added

### Focus States
- **Input fields**: Border color changes to #0A4DAD
- **Buttons**: Outline ring
- **Links**: Color highlight

### Transitions
- **Duration**: 200ms
- **Easing**: ease-in-out
- **Properties**: color, background, shadow, transform

## Responsive Behavior

### Desktop (1200px+)
- Full layout with 3 columns
- Details panel always visible
- Max message width: 70%

### Tablet (768px - 1199px)
- Details panel may collapse/slide
- Message width: 80%
- Details panel: 280px

### Mobile (<768px)
- Stacked layout
- Full-width messages
- Details panel: full-width overlay or bottom sheet
- Message input: sticky bottom

---

## Component Imports

```typescript
import ChatDetailsPanel from '@/components/chat/ChatDetailsPanel';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';

// Usage in ChatConversation or ChatLayout
<ChatDetailsPanel 
  user={selectedUser}
  attachments={attachments}
  notes={notes}
  tasks={tasks}
/>

<MessageBubble 
  msg={message}
  isMe={message.senderId === currentUser.id}
/>
```

## Accessibility Features
- ✅ Semantic HTML (buttons, labels, inputs)
- ✅ ARIA labels on action buttons
- ✅ Focus states visible
- ✅ Color not only indicator (status has text)
- ✅ Keyboard navigation support
- ✅ High contrast text (WCAG AA)
