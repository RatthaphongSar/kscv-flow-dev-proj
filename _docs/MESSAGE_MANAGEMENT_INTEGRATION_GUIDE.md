# Message Management Integration Guide - Chat Page

## Overview
This guide explains how to integrate the new message management components and features into the Chat page, following the current architecture.

---

## 1. Import New Components and Services

**File**: `frontend/src/pages/Chat.jsx`

```javascript
// Add these imports
import ChatMessageItem from '../components/ChatMessageItem'
import ReplyInput from '../components/ReplyInput'
import { ChatAPI } from '../services/chat'
```

---

## 2. Add New State Management

In the ChatPage component, add state for message management:

```javascript
// Message action states
const [replyingToMessage, setReplyingToMessage] = useState(null) // Full message object
const [editingMessageId, setEditingMessageId] = useState(null) // ID of message being edited
const [pinnedMessages, setPinnedMessages] = useState([]) // List of pinned messages
```

---

## 3. Message Action Handlers

Add these handlers to handle user actions:

```javascript
// Delete message (with mode: 'me' or 'everyone')
const handleDeleteMessage = async (roomId, messageId, mode = 'me') => {
  try {
    await ChatAPI.deleteMessageEnhanced(roomId, messageId, mode)
    // Message will be removed via socket event
    // If mode='me', message stays in chat but marked as deleted for user
    // If mode='everyone', socket event will remove it from all clients
  } catch (err) {
    console.error('Delete message error:', err)
    // Show error toast
  }
}

// Edit message
const handleEditMessage = async (roomId, messageId, newContent) => {
  try {
    const updated = await ChatAPI.editMessageEnhanced(roomId, messageId, newContent)
    // Update local message state with new content and editedAt
    setMessages(messages.map(m => m.id === messageId ? updated : m))
    setEditingMessageId(null)
  } catch (err) {
    console.error('Edit message error:', err)
  }
}

// Reply to message
const handleReplyMessage = async (message) => {
  setReplyingToMessage(message)
  // Set focus to text input
  document.querySelector('input[placeholder*="ข้อความ"]')?.focus()
}

// Send reply
const handleSendReply = async (content, files = null) => {
  if (!replyingToMessage || !activeRoom) return
  
  try {
    const formData = new FormData()
    formData.append('content', content)
    if (files && files.length > 0) {
      formData.append('files', files[0])
    }
    
    const reply = await ChatAPI.replyToMessage(
      activeRoom.id,
      replyingToMessage.id,
      content,
      files
    )
    
    // Add reply to messages
    setMessages([...messages, reply])
    setReplyingToMessage(null)
    setText('')
  } catch (err) {
    console.error('Send reply error:', err)
  }
}

// Pin message (admin only)
const handlePinMessage = async (roomId, messageId) => {
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) {
    alert('Only admins can pin messages')
    return
  }
  
  try {
    await ChatAPI.pinMessage(roomId, messageId)
    // Update UI via socket event
  } catch (err) {
    console.error('Pin message error:', err)
  }
}

// Unpin message
const handleUnpinMessage = async (roomId, messageId) => {
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) {
    return
  }
  
  try {
    await ChatAPI.unpinMessage(roomId, messageId)
    // Update UI via socket event
  } catch (err) {
    console.error('Unpin message error:', err)
  }
}

// Load pinned messages
const loadPinnedMessages = async (roomId) => {
  try {
    const pins = await ChatAPI.getPinnedMessages(roomId)
    setPinnedMessages(pins || [])
  } catch (err) {
    console.error('Load pinned messages error:', err)
  }
}
```

---

## 4. Socket.io Event Listeners

Add these socket event handlers to handle real-time updates:

```javascript
// Inside the socket setup effect
if (socket) {
  // Message deleted for current user
  socket.on('messageDeletedForUser', ({ messageId, userId }) => {
    if (userId === user?.id) {
      setMessages(messages => messages.filter(m => m.id !== messageId))
    }
  })

  // Message deleted for everyone
  socket.on('messageDeletedForEveryone', ({ messageId }) => {
    setMessages(messages => messages.map(m => 
      m.id === messageId ? { ...m, deletedForEveryone: true } : m
    ))
  })

  // Message edited
  socket.on('messageEdited', (updatedMessage) => {
    setMessages(messages => messages.map(m => 
      m.id === updatedMessage.id ? updatedMessage : m
    ))
  })

  // Message replied to
  socket.on('messageReplied', (reply) => {
    setMessages(messages => [...messages, reply])
  })

  // Message pinned
  socket.on('messagePinned', (pinnedMessage) => {
    setPinnedMessages(pins => [...pins, pinnedMessage])
  })

  // Message unpinned
  socket.on('messageUnpinned', ({ messageId }) => {
    setPinnedMessages(pins => pins.filter(p => p.messageId !== messageId))
  })

  // Cleanup listeners
  return () => {
    safeOff('messageDeletedForUser', null)
    safeOff('messageDeletedForEveryone', null)
    safeOff('messageEdited', null)
    safeOff('messageReplied', null)
    safeOff('messagePinned', null)
    safeOff('messageUnpinned', null)
  }
}
```

---

## 5. Update ChatConversation Component

The ChatConversation component now receives:

```javascript
<ChatConversation
  roomId={activeRoom?.id || null}
  messages={messages}
  currentUser={user}
  onDeleteMessage={handleDeleteMessage}
  onEditMessage={handleEditMessage}
  onReplyMessage={handleReplyMessage}
/>
```

---

## 6. Integration with Message Input

Update the message sending logic to handle replies:

```javascript
const handleSendMessage = async (e) => {
  e?.preventDefault()
  
  if (!text.trim() && selectedFiles.length === 0) {
    return
  }
  
  if (!activeRoom) return
  
  setSendLoading(true)
  setSendError('')

  try {
    let formData = null
    
    if (selectedFiles.length > 0) {
      formData = new FormData()
      formData.append('content', text)
      formData.append('replyToId', replyingToMessage?.id || null)
      selectedFiles.forEach(file => {
        formData.append('files', file.blob)
      })
    }

    const message = await ChatAPI.sendMessage(
      activeRoom.id,
      user?.id,
      text,
      replyingToMessage?.id || null,
      formData
    )

    // Add message to list
    setMessages([...messages, message])
    setText('')
    setSelectedFiles([])
    setReplyingToMessage(null)

  } catch (err) {
    console.error('Send message error:', err)
    setSendError(err.message || 'ไม่สามารถส่งข้อความได้')
  } finally {
    setSendLoading(false)
  }
}
```

---

## 7. Update ChatLayout

Pass new handlers to ChatLayout:

```javascript
<ChatLayout
  rooms={rooms}
  activeRoom={activeRoom}
  onSelectRoom={setActiveRoom}
  messages={messages}
  currentUser={user}
  text={text}
  setText={setText}
  onSendMessage={handleSendMessage}
  canCreateRoom={canCreateRoom}
  onCreateRoom={handleCreateRoom}
  sendLoading={sendLoading}
  sendError={sendError}
  onDeleteMessage={handleDeleteMessage}      // NEW
  onEditMessage={handleEditMessage}          // NEW
  onReplyMessage={handleReplyMessage}        // NEW
  replyingTo={replyingToMessage}             // NEW
  onCancelReply={() => setReplyingToMessage(null)} // NEW
  pinnedRooms={pinnedRooms}
  onTogglePin={togglePin}
  selectedFiles={selectedFiles}
  onAttachFiles={handleAttachFiles}
  onRemoveFile={handleRemoveFile}
  onClearFiles={() => setSelectedFiles([])}
/>
```

---

## 8. Update ChatWindow

Add reply input display above message input:

```javascript
{/* Reply Input */}
{replyingTo && (
  <ReplyInput
    message={replyingTo}
    onCancel={onCancelReply}
  />
)}

{/* Message Input */}
{activeRoom && activeTab === 'chat' && (
  <div className="border-t border-[#1f2937] bg-[#020617] px-4 py-3 shrink-0">
    {/* ... existing code ... */}
  </div>
)}
```

---

## 9. Activity Flow Diagram

### Delete Message Flow:
```
User clicks "ลบ" in popup menu
  ↓
Shows delete confirmation (me / everyone)
  ↓
Calls handleDeleteMessage(roomId, messageId, mode)
  ↓
API.deleteMessageEnhanced(roomId, messageId, mode)
  ↓
Backend deletes or marks deleted
  ↓
Socket event emitted
  ↓
UI updates (message removed or marked)
```

### Reply Flow:
```
User clicks "ตอบกลับ" in popup menu
  ↓
setReplyingToMessage(message)
  ↓
ReplyInput appears above message input
  ↓
User types reply in input
  ↓
Calls handleSendReply(content, files)
  ↓
API.replyToMessage(roomId, messageId, content)
  ↓
Backend creates reply with replyToId
  ↓
Socket event emitted
  ↓
Message appears with reply context (ReplyPreview)
```

### Pin Message Flow:
```
User (admin) clicks "ปักหมุด" in popup menu
  ↓
Calls handlePinMessage(roomId, messageId)
  ↓
API.pinMessage(roomId, messageId)
  ↓
Backend creates PinnedMessage record
  ↓
Socket event emitted
  ↓
PinnedSection updates list
  ↓
Pin indicator appears on message
```

---

## 10. TypeScript Types (for future migration)

```typescript
interface Message {
  id: string
  content?: string
  authorId: string
  author: { id: string; username: string }
  roomId: string
  createdAt: Date
  editedAt?: Date
  deletedForEveryone: boolean
  deletedForUsers: Array<{ userId: string; deletedAt: Date }>
  replyToId?: string
  replyTo?: Message
  file?: ChatFile
  pinnedIn: Array<{ messageId: string; roomId: string; pinnedAt: Date }>
}

interface ChatFile {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  url: string
  width?: number
  height?: number
}

interface PinnedMessage {
  messageId: string
  roomId: string
  pinnedAt: Date
  pinnedBy: User
  message: Message
}
```

---

## 11. Error Handling

**Common Errors to Handle**:

| Error | Cause | Handler |
|-------|-------|---------|
| 401 Unauthorized | Not logged in | Redirect to login |
| 403 Forbidden | Not author/admin | Show permission denied toast |
| 404 Not Found | Message deleted | Remove from UI |
| 400 Bad Request | Invalid input | Show validation error |
| 500 Server Error | Backend crash | Show generic error, retry |

---

## 12. Performance Optimization

**Considerations**:

1. **Pagination**: Load first 50 messages, then lazy-load older on scroll
2. **Filtering**: Don't show deleted-for-everyone messages unless admin
3. **Socket Throttling**: Debounce multiple rapid edits
4. **Memo Components**: Use React.memo for MessageItem to prevent re-renders
5. **Virtual List**: For rooms with 1000+ messages, use react-window

---

## 13. Testing Utilities

```javascript
// Mock data for testing
const mockMessage = {
  id: 'msg1',
  content: 'Test message',
  authorId: 'user1',
  author: { id: 'user1', username: 'John' },
  roomId: 'room1',
  createdAt: new Date(),
  editedAt: null,
  deletedForEveryone: false,
  deletedForUsers: [],
  replyToId: null,
  replyTo: null,
  file: null,
  pinnedIn: [],
}

// Test delete
test('Delete message calls API with correct mode', async () => {
  await handleDeleteMessage('room1', 'msg1', 'me')
  expect(ChatAPI.deleteMessageEnhanced).toHaveBeenCalledWith('room1', 'msg1', 'me')
})

// Test pin
test('Pin message shows in PinnedSection', async () => {
  await handlePinMessage('room1', 'msg1')
  expect(pinnedMessages).toContainEqual(expect.objectContaining({ messageId: 'msg1' }))
})
```

---

## Summary

By following this guide, you'll have a complete, production-ready message management system with:

✅ Delete (per-user and for everyone)
✅ Edit with timestamps
✅ Reply with context
✅ Pin with dedicated UI section
✅ Real-time updates via Socket.io
✅ Full authorization checks
✅ Responsive design
✅ Thai language support

The system is designed to be extensible for future features like emoji reactions, message search, and message expiration.
