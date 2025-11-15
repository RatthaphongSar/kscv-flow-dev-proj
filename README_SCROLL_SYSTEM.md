# Advanced Chat Scroll System - Complete Implementation Guide

## 📦 What You're Getting

This package includes a complete, production-ready scroll system for your React chat application with:

### ✅ Features Included
1. **Initial Load Scroll** - Auto-scroll to bottom when room first loads
2. **Auto-Scroll on New Messages** - Smooth scroll when user is at bottom
3. **"New Messages" Button** - Floating button when user scrolls up and new messages arrive
4. **Infinite Scroll** - Load older messages when scrolling to top
5. **Scroll Position Preservation** - Keep user's viewport stable when loading old messages
6. **Typing Indicators** - Show who's typing
7. **Reply Context** - Display reply information
8. **Loading States** - Spinners for initial load and loading older messages

## 📁 Files Created

### 1. **useChatScroll.ts** - Custom Hook
**Location:** `frontend/src/hooks/useChatScroll.ts`

**Purpose:** Low-level scroll state management and calculations

**Exports:**
```typescript
useChatScroll(options?): {
  scrollContainerRef: React.RefObject<HTMLDivElement>
  isAtBottom: boolean
  isAtTop: boolean
  scrollToBottom(behavior?: ScrollBehavior): void
  preserveScrollPosition(): void
  restoreScrollPosition(): void
}
```

**Key Methods:**
- `scrollToBottom()` - Smooth scroll to bottom (handles flex-col-reverse)
- `preserveScrollPosition()` - Save scroll state before prepending messages
- `restoreScrollPosition()` - Restore scroll position after DOM updates

**Configuration:**
```typescript
useChatScroll({
  bottomThreshold: 100,      // px from bottom for "at bottom" detection
  topThreshold: 150          // px from top for "at top" detection
})
```

### 2. **ChatConversationWithInfiniteScroll.tsx** - Component
**Location:** `frontend/src/components/chat/ChatConversationWithInfiniteScroll.tsx`

**Purpose:** High-level UI component with infinite scroll logic

**Props:**
```typescript
{
  roomId: string | null
  messages: ChatMessage[]
  currentUser: { id: string; username?: string } | null
  isLoadingMessages?: boolean           // Initial load state
  isLoadingMoreMessages?: boolean       // Infinite scroll loading
  hasMoreMessages?: boolean             // More messages available?
  onLoadMoreMessages?: (beforeMessageId: string) => void | Promise<void>
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onReplyMessage?: (messageId: string) => void
  typingUsers?: Array<{ username: string }>
}
```

**Features:**
- Initial scroll to bottom
- Auto-scroll detection
- "New messages" floating button
- Infinite scroll trigger
- Loading spinners
- Full message rendering

### 3. **chat.ts** - TypeScript Types
**Location:** `frontend/src/types/chat.ts`

**Provides:**
- `ChatUser` - User profile type
- `ChatMessage` - Message structure with reply support
- `ChatRoom` - Room type
- `ChatConversationProps` - Component props
- Socket event types

### 4. **Documentation Files**
- `SCROLL_INTEGRATION_GUIDE.md` - Step-by-step integration instructions
- `SCROLL_IMPLEMENTATION_NOTES.md` - Deep dive architecture and troubleshooting

### 5. **Example Implementation**
- `ChatWithAdvancedScroll.example.jsx` - Complete Chat.jsx example with integration

## 🚀 Quick Start Integration

### Step 1: Add Files
Copy these files to your project:
- ✅ `useChatScroll.ts` → `src/hooks/`
- ✅ `ChatConversationWithInfiniteScroll.tsx` → `src/components/chat/`
- ✅ `chat.ts` → `src/types/`

### Step 2: Update ChatAPI
Add pagination method to `src/services/chat.js`:
```javascript
listMessagesBefore: (roomId, beforeMessageId, limit = 30) =>
  api(`/chat/rooms/${roomId}/messages?before=${beforeMessageId}&limit=${limit}`, { 
    method: 'GET' 
  }),
```

### Step 3: Update Chat.jsx
Add new state:
```javascript
const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
const [hasMoreMessages, setHasMoreMessages] = useState(true)
```

Add handler:
```javascript
const handleLoadMoreMessages = useCallback(
  async (beforeMessageId) => {
    if (!activeRoom || loadingMoreMessages) return
    setLoadingMoreMessages(true)
    try {
      const olderMessages = await ChatAPI.listMessagesBefore(
        activeRoom.id,
        beforeMessageId,
        30
      )
      if (olderMessages && olderMessages.length > 0) {
        const reversed = [...olderMessages].reverse()
        setMessages((prev) => [...reversed, ...prev])
        setHasMoreMessages(olderMessages.length >= 30)
      } else {
        setHasMoreMessages(false)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setLoadingMoreMessages(false)
    }
  },
  [activeRoom, loadingMoreMessages]
)
```

Replace component:
```jsx
import ChatConversationWithInfiniteScroll from '../components/chat/ChatConversationWithInfiniteScroll'

// In JSX:
<ChatConversationWithInfiniteScroll
  roomId={activeRoom?.id || null}
  messages={messages}
  currentUser={user}
  isLoadingMessages={loadingMessages}
  isLoadingMoreMessages={loadingMoreMessages}
  hasMoreMessages={hasMoreMessages}
  onLoadMoreMessages={handleLoadMoreMessages}
  onDeleteMessage={handleDeleteMessage}
  onEditMessage={handleEditMessage}
  onReplyMessage={handleReplyMessage}
  typingUsers={Object.values(typingMap).map((info) => ({
    username: info.username,
  }))}
/>
```

### Step 4: Backend Support
Ensure your backend supports:
- `GET /chat/rooms/:roomId/messages?limit=50` - Latest messages (ASC order)
- `GET /chat/rooms/:roomId/messages?before=messageId&limit=30` - Older messages (ASC order)

## 🔄 Message Flow Architecture

```
┌─────────────────────────────────────────┐
│ Chat.jsx (State & API)                  │
│ - messages: ChatMessage[]               │
│ - loadingMoreMessages, hasMoreMessages  │
│ - handleLoadMoreMessages()              │
└────────────┬────────────────────────────┘
             │ props
┌────────────▼────────────────────────────┐
│ ChatConversationWithInfiniteScroll      │
│ - Manages scroll state                  │
│ - Triggers infinite scroll              │
│ - Shows/hides "New messages" button     │
└────────────┬────────────────────────────┘
             │ children
┌────────────▼────────────────────────────┐
│ MessageBubble[] + Typing Indicator      │
│ - Individual message rendering          │
└────────────┬────────────────────────────┘
             │ ref
┌────────────▼────────────────────────────┐
│ useChatScroll Hook                      │
│ - Scroll position detection             │
│ - scrollToBottom()                      │
│ - preserveScrollPosition()              │
│ - restoreScrollPosition()               │
└─────────────────────────────────────────┘
```

## 📊 Scroll Detection Logic

### At Bottom Detection
```
isAtBottom = scrollTop < bottomThreshold (default: 100px)
- User is within 100px of bottom
- Auto-scroll enabled for new messages
```

### At Top Detection
```
isAtTop = (scrollHeight - scrollTop - clientHeight) < topThreshold (default: 150px)
- User is within 150px of top
- Trigger loading older messages
```

## 🎯 Behavior Flows

### Initial Load
1. User opens room → Chat.jsx fetches latest messages
2. Messages render → useChatScroll detects it's first render
3. Calls `scrollToBottom('auto')` → Scrolls to bottom
4. ✅ Latest messages visible

### New Message (User at Bottom)
1. Socket emits new message → appended to array
2. Component re-renders with new message
3. `isAtBottom = true` → calls `scrollToBottom('smooth')`
4. ✅ Smooth auto-scroll to show new message

### New Message (User Scrolled Up)
1. Socket emits new message → appended to array
2. Component re-renders with new message
3. `isAtBottom = false` → shows "⬇️ New messages" button
4. User clicks button → calls `scrollToBottom('smooth')`
5. ✅ Manual jump to latest

### Scroll to Top (Infinite Scroll)
1. User scrolls to top → `isAtTop = true`
2. Component calls `preserveScrollPosition()`
3. Calls `onLoadMoreMessages(oldestMessageId)`
4. Chat.jsx fetches older messages via API
5. Reverses messages and prepends to array
6. Component calls `restoreScrollPosition()`
7. ScrollTop adjusted to keep viewport content stable
8. ✅ Old messages visible, scroll position preserved

## 🔧 Customization

### Adjust Scroll Thresholds
```typescript
useChatScroll({
  bottomThreshold: 150,   // Increase to scroll to bottom more aggressively
  topThreshold: 200       // Increase to trigger infinite scroll earlier
})
```

### Change Loading Indicators
Edit `ChatConversationWithInfiniteScroll.tsx` to customize:
- Spinner appearance
- Loading text
- Button style
- Error states

### Adjust Message Page Size
```javascript
// In handleLoadMoreMessages:
onLoadMoreMessages?.(beforeMessageId)  // Currently uses 30 messages

// Change to:
ChatAPI.listMessagesBefore(activeRoom.id, beforeMessageId, 50)  // Load 50 at a time
```

## ✅ Testing Checklist

- [ ] Initial load scrolls to bottom
- [ ] New message auto-scrolls when at bottom
- [ ] New message shows button when scrolled up
- [ ] Button click scrolls to bottom smoothly
- [ ] Scroll to top triggers loading spinner
- [ ] Old messages appear at top
- [ ] Scroll position preserved when loading old
- [ ] No double-loading of messages
- [ ] Messages in correct order (newest at bottom)
- [ ] Typing indicators work
- [ ] Reply context displays correctly
- [ ] Edit/delete work correctly
- [ ] No console errors
- [ ] Performance acceptable with 500+ messages

## 🚨 Common Issues

### Scroll jumps when loading old messages
- Check that `preserveScrollPosition()` called before fetch
- Increase timeout in `restoreScrollPosition()` from 0 to 50-100ms

### "New messages" button doesn't appear
- Increase `bottomThreshold` to 200px
- Check that `isAtBottom` is false when scrolled up

### Infinite scroll triggers too often
- Decrease `topThreshold` from 150 to 100px

### Messages appear in wrong order
- Verify backend returns ASC order
- Check frontend always reverses to DESC
- Ensure new messages append to end, old prepend to start

## 📚 Additional Resources

- See `SCROLL_INTEGRATION_GUIDE.md` for step-by-step instructions
- See `SCROLL_IMPLEMENTATION_NOTES.md` for architecture deep dive
- See `ChatWithAdvancedScroll.example.jsx` for complete working example

## 🎁 Bonus Features Included

1. **Typing Indicators** - Shows who's currently typing
2. **Reply Context** - Displays when replying to a message
3. **Edit Tracking** - Shows "(แก้ไข)" badge on edited messages
4. **Message Actions** - Copy, reply, edit, delete with menu
5. **Loading States** - Proper spinners for initial and infinite scroll
6. **Error Handling** - Graceful error states and fallbacks

## 📝 Notes

- All code is TypeScript-ready (or plain JS compatible)
- Uses only React hooks, no external scroll libraries
- Compatible with flex-col-reverse layout
- Tailwind CSS for styling (can be customized)
- Socket.io integration ready
- Full reply system support

---

**Ready to implement?** Start with Step 1-4 in "Quick Start Integration" above!
