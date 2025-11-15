# Chat UI Features Implementation Guide

## Overview

Three new UI features have been implemented for the KVC WebApp chat system:

1. **Left Sidebar Filter Tabs** - Filter chat rooms by: All, Pinned, Unread
2. **Right Panel Tab Strip** - Switch between: Chat, Files, Notes
3. **Attachment Button** - File upload functionality in the input bar

All features follow the existing dark theme (#020617, #111827) and maintain clean component architecture.

---

## Feature 1: Left Sidebar Filter Tabs

### Component: `ChatSidebarTabs.tsx`

**Purpose**: Allow users to filter the room list with three options:
- **"ทั้งหมด"** (All) - Shows all rooms
- **"เก็บพูด"** (Pinned) - Shows only pinned/favorite rooms
- **"ยังไม่ได้อ่าน"** (Unread) - Shows only rooms with unread messages

**Component Props**:
```typescript
type ChatFilter = 'all' | 'pinned' | 'unread'

interface ChatSidebarTabsProps {
  value: ChatFilter          // Current active filter
  onChange: (next: ChatFilter) => void  // Called when user clicks a tab
}
```

**Styling**:
- Active tab: `bg-violet-600 text-white font-medium`
- Inactive tab: `bg-slate-800 text-slate-300 hover:bg-slate-700`
- Pill-shaped buttons with smooth transitions

### Integration in ChatSidebar

The `ChatSidebar.tsx` component was updated to:

1. **Add state management**:
```typescript
const [filter, setFilter] = useState<ChatFilter>('all')
```

2. **Apply filtering logic**:
```typescript
const filteredRooms = useMemo(() => {
  let result = rooms.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()),
  )
  
  if (filter === 'pinned') {
    result = result.filter(r => r.isPinned === true)
  } else if (filter === 'unread') {
    result = result.filter(r => (r.unreadCount ?? 0) > 0)
  }
  
  return result
}, [rooms, search, filter])
```

3. **Render the tabs component**:
```tsx
<ChatSidebarTabs value={filter} onChange={setFilter} />
```

### Room Interface Requirements

Ensure your room objects include:
```typescript
interface ChatRoom {
  id: string
  name: string
  lastMessagePreview: string
  unreadCount: number      // 0 or positive number
  isPinned?: boolean       // true or false
}
```

---

## Feature 2: Right Panel Tab Strip

### Components:

#### `ChatPanelTabs.tsx`
Tab navigation component with three tabs:
- **"แชท"** (Chat) - Message list view
- **"ไฟล์"** (Files) - Shared files list
- **"โน้ต"** (Notes) - Pinned notes

**Component Props**:
```typescript
type ChatPanelTab = 'chat' | 'files' | 'notes'

interface ChatPanelTabsProps {
  value: ChatPanelTab
  onChange: (next: ChatPanelTab) => void
}
```

**Styling**:
- Active tab: Underline bar with `border-violet-500`, text color `text-violet-300`
- Inactive tab: Muted text with hover underline effect

#### `ChatFilesPanel.tsx`
Displays shared files in a clean list format.

**Mock Data Structure**:
```typescript
interface ChatFileItem {
  id: string
  fileName: string
  fileSizeLabel: string    // e.g., "1.2 MB"
  uploadedBy: string       // User name
  uploadedAt: string       // Formatted date
}
```

**Features**:
- File icon placeholder
- Hover effects with transitions
- Download button (placeholder)
- Secondary info line: uploadedBy · uploadedAt · fileSize

#### `ChatNotesPanel.tsx`
Displays pinned notes as a grid of cards.

**Mock Data Structure**:
```typescript
interface ChatNote {
  id: string
  title: string
  content: string
  updatedAt: string
}
```

**Features**:
- Grid layout (1-2 columns)
- Truncated content with `line-clamp-3`
- Delete button on each note
- Hover border color change to violet

### Integration in ChatWindow

The `ChatWindow.tsx` component was updated to:

1. **Add state management**:
```typescript
const [activeTab, setActiveTab] = useState<ChatPanelTab>('chat')
```

2. **Render tabs header**:
```tsx
{activeRoom && (
  <div className="px-5 border-b border-[#374151] bg-[#020617] shrink-0">
    <ChatPanelTabs value={activeTab} onChange={setActiveTab} />
  </div>
)}
```

3. **Conditionally render panels**:
```tsx
{activeTab === 'chat' && <ChatConversation ... />}
{activeTab === 'files' && <ChatFilesPanel roomId={activeRoom.id} />}
{activeTab === 'notes' && <ChatNotesPanel roomId={activeRoom.id} />}
```

4. **Show input only in chat tab**:
```tsx
{activeRoom && activeTab === 'chat' && (
  <div className="border-t border-[#1f2937] bg-[#020617] px-4 py-3 shrink-0">
    <MessageInput ... onAttachFiles={onAttachFiles} />
  </div>
)}
```

---

## Feature 3: Attachment Button with File Upload

### Component: Updated `MessageInput.tsx`

Added file attachment functionality using a hidden file input.

**New Props**:
```typescript
interface MessageInputProps {
  // ... existing props
  onAttachFiles?: (files: FileList) => void  // Called when files selected
}
```

**Key Implementation Details**:

1. **Hidden file input reference**:
```typescript
const fileInputRef = useRef<HTMLInputElement>(null)
```

2. **Trigger file dialog**:
```typescript
const handleAttachClick = () => {
  fileInputRef.current?.click()  // Programmatically open file picker
}
```

3. **Handle file selection**:
```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && onAttachFiles) {
    onAttachFiles(e.target.files)
    // Clear input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
}
```

4. **Attachment button styling**:
```tsx
<button
  type="button"
  onClick={handleAttachClick}
  className="h-9 w-9 flex items-center justify-center rounded-md bg-slate-800 border border-slate-700
             text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-colors
             disabled:opacity-50 disabled:cursor-not-allowed"
  title="แนบไฟล์"
  disabled={isLoading}
>
  {/* SVG Paperclip Icon */}
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4" />
  </svg>
</button>
```

**Button Features**:
- Square icon button (w-9 h-9)
- Dark background with subtle border
- Hover state: slightly lighter background
- SVG paperclip icon (no external dependencies)
- Disabled when message is being sent

### Usage in ChatWindow

Updated `ChatWindow.tsx` to pass the attachment handler:

```tsx
<MessageInput 
  text={text} 
  setText={setText} 
  onSubmit={onSendMessage}
  isLoading={sendLoading}
  onAttachFiles={onAttachFiles}  // New prop
/>
```

Then in your parent Chat page/container, implement the handler:

```typescript
const handleAttachFiles = (files: FileList) => {
  // TODO: Implement file upload logic
  console.log('Files selected:', files)
  
  // Example: upload to server
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`File ${i}: ${file.name} (${file.size} bytes)`)
    // ... implement upload API call
  }
}
```

---

## Component Architecture

### Updated Components

```
ChatLayout
├── ChatSidebar (UPDATED)
│   ├── ChatSidebarTabs (NEW)
│   └── ConversationList
│
└── ChatWindow (UPDATED)
    ├── ChatPanelTabs (NEW)
    ├── ChatConversation (when activeTab === 'chat')
    ├── ChatFilesPanel (NEW - when activeTab === 'files')
    ├── ChatNotesPanel (NEW - when activeTab === 'notes')
    ├── MessageInput (UPDATED)
    │   └── Hidden file input
    └── AddStudentsModal
```

---

## Data Flow

### Sidebar Filter Flow
```
User clicks tab
  ↓
ChatSidebarTabs onChange fires
  ↓
ChatSidebar updates filter state
  ↓
useMemo recalculates filteredRooms
  ↓
ConversationList re-renders with filtered rooms
```

### Panel Tab Flow
```
User clicks chat/files/notes tab
  ↓
ChatPanelTabs onChange fires
  ↓
ChatWindow updates activeTab state
  ↓
Conditional rendering shows appropriate panel
```

### File Attachment Flow
```
User clicks paperclip button
  ↓
handleAttachClick triggers fileInputRef.click()
  ↓
Browser opens file picker dialog
  ↓
User selects file(s)
  ↓
handleFileChange fires
  ↓
onAttachFiles callback invoked with FileList
  ↓
Parent component handles upload logic
```

---

## Styling Reference

### Dark Theme Colors Used
- **Background**: `#020617` (bg-[#020617])
- **Secondary bg**: `#111827` (bg-[#111827])
- **Borders**: `#1f2937`, `#374151` (border-[#1f2937])
- **Primary accent**: `violet-600`, `violet-500` (active states)
- **Text**: `gray-100`, `slate-300`, `slate-400` (varying emphasis)

### Tailwind Classes Applied
- Pill buttons: `rounded-full px-3 py-1.5 transition-all`
- Tab underline: `border-b-2 relative` with absolute positioned bar
- Hover effects: `hover:bg-slate-700`, `hover:text-slate-300`
- Transitions: `transition-all duration-200`, `transition-colors`

---

## Testing Checklist

- [ ] Sidebar tabs filter rooms correctly
  - [ ] "ทั้งหมด" shows all rooms
  - [ ] "เก็บพูด" shows only rooms with isPinned=true
  - [ ] "ยังไม่ได้อ่าน" shows only rooms with unreadCount > 0
  
- [ ] Right panel tabs work
  - [ ] Tab styling matches current active tab
  - [ ] Switching tabs shows correct content
  - [ ] Chat tab shows message list
  - [ ] Files tab shows mock file list
  - [ ] Notes tab shows mock notes grid
  
- [ ] File attachment works
  - [ ] Paperclip button visible in input area
  - [ ] Clicking button opens file picker
  - [ ] Selected files trigger onAttachFiles callback
  - [ ] Same file can be selected multiple times
  - [ ] Button disabled during message send

---

## Future Enhancements

1. **Sidebar Filter**: 
   - Persist filter preference to localStorage
   - Add "Favorites" badge on tab

2. **File Panel**:
   - Replace mock data with API calls
   - Implement actual file download
   - Add file search/filter
   - Show file preview for images

3. **Notes Panel**:
   - Replace mock data with API calls
   - Implement add/edit/delete note UI
   - Add note search
   - Support markdown formatting

4. **File Upload**:
   - Show upload progress
   - Display uploaded files in Files tab
   - Support drag-and-drop
   - File type validation
   - File size limits

---

## API Integration Points

When you're ready to integrate with backend APIs:

### Sidebar Filter
The filtering logic is already client-side, but you may want to:
- Fetch room metadata (isPinned, unreadCount) from API
- Subscribe to updates via Socket.io

### File Panel
```typescript
// Replace mockFiles with API call:
const [files, setFiles] = useState<ChatFileItem[]>([])

useEffect(() => {
  if (roomId) {
    fetchRoomFiles(roomId).then(setFiles)
  }
}, [roomId])
```

### Notes Panel
```typescript
// Replace mockNotes with API call:
const [notes, setNotes] = useState<ChatNote[]>([])

useEffect(() => {
  if (roomId) {
    fetchRoomNotes(roomId).then(setNotes)
  }
}, [roomId])
```

### File Upload
```typescript
const handleAttachFiles = async (files: FileList) => {
  for (const file of Array.from(files)) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('roomId', activeRoom?.id)
    
    try {
      await uploadFile(formData)
      // Refresh file list
      const updated = await fetchRoomFiles(activeRoom?.id)
      setFiles(updated)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }
}
```

---

## TypeScript Types

All components are fully typed. Key types:

```typescript
// Sidebar filter
type ChatFilter = 'all' | 'pinned' | 'unread'

// Panel tabs
type ChatPanelTab = 'chat' | 'files' | 'notes'

// File item
interface ChatFileItem {
  id: string
  fileName: string
  fileSizeLabel: string
  uploadedBy: string
  uploadedAt: string
}

// Note item
interface ChatNote {
  id: string
  title: string
  content: string
  updatedAt: string
}

// Room item (required properties)
interface ChatRoom {
  id: string
  name: string
  unreadCount?: number
  isPinned?: boolean
}
```

---

## Summary

✅ **Implemented**:
- Sidebar filter tabs with client-side filtering
- Right panel tabs for chat/files/notes switching
- Placeholder panels with mock data (ready for API integration)
- Attachment button with file picker and callback

✅ **Features**:
- Clean component architecture
- Full TypeScript typing
- Dark theme consistency
- Smooth transitions and hover effects
- No additional UI library dependencies

✅ **Ready for**:
- Backend API integration
- Socket.io updates
- Real file upload implementation
- User preference persistence
