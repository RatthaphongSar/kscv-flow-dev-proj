# Advanced Chat Scroll System - Quick Reference

## 🎯 What This System Does

| Feature | Description | Triggered |
|---------|-------------|-----------|
| **Initial Scroll** | Scroll to bottom when room opens | First render of messages |
| **Auto-Scroll** | Smooth scroll when new message arrives | User at bottom + message received |
| **Jump Button** | "⬇️ New messages" button | User scrolled up + new message received |
| **Infinite Scroll** | Load older messages when scroll to top | User scrolls near top + messages exist |
| **Position Preservation** | Keep user's viewport stable during load | After old messages loaded |

## 📦 Files to Copy

```
frontend/
├── src/
│   ├── hooks/
│   │   └── useChatScroll.ts                          ← NEW
│   ├── components/chat/
│   │   ├── ChatConversationWithInfiniteScroll.tsx    ← NEW
│   │   ├── SCROLL_INTEGRATION_GUIDE.md               ← NEW (reference)
│   │   └── SCROLL_IMPLEMENTATION_NOTES.md            ← NEW (reference)
│   ├── types/
│   │   └── chat.ts                                   ← UPDATE (add types)
│   ├── pages/
│   │   └── ChatWithAdvancedScroll.example.jsx        ← NEW (reference)
│   └── services/
│       └── chat.js                                   ← UPDATE (add listMessagesBefore)
└── README_SCROLL_SYSTEM.md                           ← NEW (full guide)
```

## 🔧 Integration Checklist

- [ ] Copy `useChatScroll.ts` to `src/hooks/`
- [ ] Copy `ChatConversationWithInfiniteScroll.tsx` to `src/components/chat/`
- [ ] Add `listMessagesBefore()` method to `src/services/chat.js`
- [ ] Add types to `src/types/chat.ts`
- [ ] Add state to `Chat.jsx`:
  - `[loadingMoreMessages, setLoadingMoreMessages]`
  - `[hasMoreMessages, setHasMoreMessages]`
- [ ] Add handler `handleLoadMoreMessages()` to `Chat.jsx`
- [ ] Replace `ChatConversation` with `ChatConversationWithInfiniteScroll` in JSX
- [ ] Update ChatAPI call in message loading effect
- [ ] Test in browser

## 📍 Key Code Snippets

### Add to Chat.jsx State
```javascript
const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
const [hasMoreMessages, setHasMoreMessages] = useState(true)
```

### Add to Chat.jsx Handler
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
      if (olderMessages?.length > 0) {
        const reversed = [...olderMessages].reverse()
        setMessages(prev => [...reversed, ...prev])
        setHasMoreMessages(olderMessages.length >= 30)
      } else {
        setHasMoreMessages(false)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingMoreMessages(false)
    }
  },
  [activeRoom, loadingMoreMessages]
)
```

### Add to services/chat.js
```javascript
listMessagesBefore: (roomId, beforeMessageId, limit = 30) =>
  api(`/chat/rooms/${roomId}/messages?before=${beforeMessageId}&limit=${limit}`, { 
    method: 'GET' 
  }),
```

### Use in JSX
```jsx
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
  typingUsers={Object.values(typingMap).map(info => ({
    username: info.username
  }))}
/>
```

## 🎮 Hook API

```typescript
const {
  scrollContainerRef,        // Ref to attach to container
  isAtBottom,               // Is user at bottom?
  isAtTop,                  // Is user at top?
  scrollToBottom,           // Scroll to bottom function
  preserveScrollPosition,   // Save scroll state
  restoreScrollPosition     // Restore after DOM update
} = useChatScroll({
  bottomThreshold: 100,     // px from bottom for detection
  topThreshold: 150         // px from top for detection
})
```

## 🧪 Testing

```javascript
// Test initial scroll
1. Open room → should scroll to bottom automatically

// Test auto-scroll
1. At bottom → new message arrives → should auto-scroll
2. Scrolled up → new message arrives → should show button

// Test infinite scroll
1. Scroll to top → should load spinner
2. Older messages should appear at top
3. Scroll position should stay stable

// Test scroll preservation
1. Mid-conversation, scroll to top
2. Load older messages
3. Your scroll position shouldn't jump
```

## ⚡ Performance Tips

1. **Load fewer messages initially:**
   ```javascript
   ChatAPI.listMessages(roomId, 30)  // Instead of 50
   ```

2. **Increase batch size for infinite scroll:**
   ```javascript
   onLoadMoreMessages?.(...limit = 50)  // Instead of 30
   ```

3. **Memoize MessageBubble:**
   ```typescript
   const MessageBubble = React.memo(MessageBubbleComponent)
   ```

4. **Use virtualization for 500+ messages:**
   ```typescript
   // Consider react-virtual or similar
   // Render only visible messages
   ```

## 🚨 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Scroll jumps when loading old | scrollPosition not preserved | Already handled - check timing |
| Button doesn't appear | bottomThreshold too small | Increase to 150-200px |
| Infinite scroll triggers repeatedly | Already loading | Check loadingMoreMessages flag |
| Messages in wrong order | Frontend reversal missing | Verify: DESC array, append new, prepend old |
| Auto-scroll too fast/slow | behavior param | Change 'smooth' to 'auto' or vice versa |

## 📋 Backend Requirements

**GET /chat/rooms/:roomId/messages?limit=50**
- Returns: Array of messages (ASC order: old → new)
- Include: id, content, userId, user.username, createdAt, replyTo, edited

**GET /chat/rooms/:roomId/messages?before=messageId&limit=30**
- Returns: Messages before messageId (ASC order: old → new)
- Must support: before parameter and limit parameter
- Should return empty array if no more old messages

## 🎨 Styling Customization

**Thresholds** in useChatScroll:
- `bottomThreshold: 100` → How close to bottom for auto-scroll
- `topThreshold: 150` → How close to top for infinite scroll

**Colors/styling** in ChatConversationWithInfiniteScroll:
- Change loading spinner colors
- Change button colors
- Change text strings (English/Thai)

**Default tailwind classes:**
```
Loading spinner: "w-3 h-3 border-2 border-violet-500"
Button: "bg-violet-600 hover:bg-violet-500"
Button text: "text-white text-[11px]"
```

## 💾 State Management

```
Chat.jsx (Page):
  ├── messages[]
  ├── loadingMoreMessages
  ├── hasMoreMessages
  └── handleLoadMoreMessages()
      │
      └─→ ChatAPI.listMessagesBefore()
          │
          └─→ Backend API
              │
              └─→ Return older messages

ChatConversationWithInfiniteScroll:
  ├── useChatScroll()
  │   ├── scrollContainerRef
  │   ├── isAtBottom
  │   ├── isAtTop
  │   └── scroll functions
  │
  └─→ Render messages
      └─→ MessageBubble[]
```

## 📚 Reference Files

1. **useChatScroll.ts** - Hook implementation (copy this)
2. **ChatConversationWithInfiniteScroll.tsx** - Component implementation (copy this)
3. **ChatWithAdvancedScroll.example.jsx** - Complete example (reference this)
4. **SCROLL_INTEGRATION_GUIDE.md** - Step-by-step guide (read this)
5. **SCROLL_IMPLEMENTATION_NOTES.md** - Architecture deep dive (read this)

---

**Status:** ✅ All files created and compiled successfully
**Build:** ✅ 2501 modules transformed, 8.44s
**Ready to:** Copy files → Update Chat.jsx → Test in browser
