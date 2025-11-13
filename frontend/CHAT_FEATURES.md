# Chat Page Enhanced Features

## New Features Added

### 1. **@mention Functionality** 
Users can mention others by typing `@` followed by their name.

**How it works:**
- Type `@` in the message input to trigger the mention dropdown
- The dropdown filters available users based on what you type
- Click to select a user from the list
- Mentioned users appear highlighted in yellow with their name in bold blue
- The mention data is stored with each message for future notifications

**Features:**
- Search/autocomplete as you type
- User role shown in dropdown (Student, Teacher, etc.)
- Keyboard or mouse selection
- Mentions highlighted in message bubbles

**Example:**
```
Type: "Hey @Mohammad Ali, can you check this?"
Display: "Hey @Mohammad Ali, can you check this?"
```

### 2. **File & Image Attachments**
Users can attach files and images to messages with automatic preview.

**Supported file types:**
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`

**Features:**
- Click the attachment button (paperclip icon) to open file picker
- File preview shown before sending
- Easy remove/replace attachments
- File size and type displayed in preview
- Images show thumbnail preview
- Documents show file icon

**Constraints:**
- Maximum file size: **10MB**
- File types are validated on selection
- Size checked against limit
- Clear error message if file invalid

**Display:**
- Sending: Shows attachment preview with filename and size
- Receiving: Shows attachment in message bubble
  - Images: Full-width thumbnail
  - Documents: Downloadable file preview with size info

### 3. **File Size Limits**
Strict file size validation to maintain performance and storage standards.

**Standards:**
- **Maximum file size:** 10MB (10,485,760 bytes)
- **Real-time validation:** User notified immediately if file exceeds limit
- **Error handling:** Clear error message showing actual file size

**Error Message Example:**
```
"File size exceeds 10MB limit. (15.32MB)"
```

## Message Enhancement

### New Message Interface

```typescript
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  createdAt: string;
  type?: MessageType;
  attachment?: Attachment | null;
  mentions?: Mention[];  // NEW: Array of @mentions
}

export interface Mention {
  id: string;
  index: number;      // Position in text
  length: number;     // Length of mention text
  userId: string;     // ID of mentioned user
  name: string;       // Name of mentioned user
}
```

## UI Components Updated

### MessageInput.tsx (Enhanced)
- **@mention detection** with autocomplete dropdown
- **File upload** button with file picker
- **Attachment preview** before sending
- **Error handling** with user-friendly messages
- **Helper text** with keyboard shortcuts
- **Enter to send** (Shift+Enter for new line)

**Props:**
```typescript
interface MessageInputProps {
  onSend: (text: string, attachment?: Attachment | null) => void;
}
```

### MessageBubble.tsx (Enhanced)
- **@mention rendering** with highlight styling
- **Attachment display** with preview/download
- **File/image differentiation**

**Styling:**
- Mentions: Yellow highlight background + blue bold text
- Images: Full-width preview in bubble
- Documents: Gray box with icon and file info

## Usage Examples

### Sending a Message with Mention
```
1. Type: "Hey @Mohammad Ali"
2. See dropdown with "Mohammad Ali (Student)"
3. Click to insert: "@Mohammad Ali "
4. Continue typing: "Hey @Mohammad Ali can you help?"
5. Press Enter to send
```

### Sending an Image
```
1. Click attachment button 📎
2. Select image file (.jpg, .png, etc.)
3. Image preview shows before sending
4. Click Send
5. Message appears with image in bubble
```

### Sending a Document
```
1. Click attachment button 📎
2. Select PDF or Word document
3. Preview shows with file icon, name, and size
4. Click Send
5. Recipient can see file preview with download link
```

### Keyboard Shortcuts
- **Enter** — Send message
- **Shift + Enter** — New line in message
- **Type @** — Trigger mention dropdown
- **Esc** — Close mention dropdown (future)

## Technical Implementation

### Constants
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
```

### State Management
- `text` — Current message text
- `attachment` — File + preview URL
- `mentions` — List of matching users
- `showMentions` — Dropdown visibility
- `mentionQuery` — Current @ query text
- `mentionStart` — Position of @ in text
- `error` — Validation errors

### Functions
- `handleTextChange()` — Detects @ and triggers autocomplete
- `insertMention()` — Replaces @ with user mention
- `handleFileSelect()` — Validates and stores file
- `removeAttachment()` — Clears file + revokes preview URL
- `submit()` — Sends message + attachment

## Future Enhancements

Planned features:
- [ ] Emoji picker
- [ ] Typing indicators
- [ ] Message reactions (😀👍❤️ etc.)
- [ ] Edit/delete sent messages
- [ ] Message search
- [ ] Real-time Socket.io integration
- [ ] Mention notifications
- [ ] Media gallery view
- [ ] Voice message recording
- [ ] Message pinning
- [ ] Multi-user mentions in group chats

## API Integration Notes

When connecting to backend, replace mock data with API calls:

```typescript
// Mock → Real API
const handleSend = async (text: string, attachment?: File) => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('conversationId', activeId);
  if (attachment) formData.append('file', attachment.file);
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    body: formData
  });
  
  const newMessage = await response.json();
  setAllMessages(prev => [...prev, newMessage]);
};
```

## Styling Reference

**Colors:**
- Primary Blue: `#0A4DAD`
- Light Background: `#F5F9FF`
- Mention Highlight: `#FEFCE8` (yellow-50)
- Mention Text: `#1E40AF` (blue-700)

**Tailwind Classes:**
- Message bubble: `rounded-2xl px-3 py-2`
- Mention: `bg-yellow-100 font-semibold text-blue-700 px-1 rounded`
- Attachment preview: `w-40 bg-gray-200 p-2 rounded`

---

**Version:** 1.0.0  
**Last Updated:** November 13, 2025  
**Status:** ✅ Implemented with mock data
