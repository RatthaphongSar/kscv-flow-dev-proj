// ADVANCED CHAT SCROLL SYSTEM - IMPLEMENTATION NOTES
/**
 * This document explains the complete scroll system architecture
 * and how to implement it in your existing codebase.
 */

// ============================================================================
// 1. ARCHITECTURE OVERVIEW
// ============================================================================
/*
 * The system consists of 4 main layers:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Chat.jsx / ChatPage (State Management)                       │
 * │ - messages: ChatMessage[]                                    │
 * │ - loadingMoreMessages: boolean                               │
 * │ - hasMoreMessages: boolean                                   │
 * │ - handleLoadMoreMessages(beforeMessageId): Promise           │
 * └────────────┬────────────────────────────────────────────────┘
 *              │ props
 * ┌────────────▼────────────────────────────────────────────────┐
 * │ ChatConversationWithInfiniteScroll (Container)               │
 * │ - Manages scroll state via useChatScroll hook                │
 * │ - Detects scroll position (at bottom, at top)                │
 * │ - Triggers infinite scroll when at top                       │
 * │ - Shows "new messages" button when scrolled up               │
 * └────────────┬────────────────────────────────────────────────┘
 *              │ children
 * ┌────────────▼────────────────────────────────────────────────┐
 * │ MessageBubble[] (Message List)                               │
 * │ - Individual message rendering                               │
 * │ - flex-col-reverse layout                                    │
 * └────────────┬────────────────────────────────────────────────┘
 *              │ ref
 * ┌────────────▼────────────────────────────────────────────────┐
 * │ useChatScroll Hook (Scroll Logic)                            │
 * │ - Calculates scroll position                                 │
 * │ - Provides scrollToBottom() function                         │
 * │ - Handles scroll position preservation                       │
 * └─────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// 2. KEY CONCEPTS
// ============================================================================

// 2.1 FLEX-COL-REVERSE LAYOUT
/*
 * Your messages container uses flex-col-reverse, which means:
 * - DOM order: oldest message at top → newest message at bottom
 * - Visual order (reversed): newest message at BOTTOM → oldest at TOP
 * - Scroll semantics: scrollTop=0 means at BOTTOM, scrollTop=large means at TOP
 * 
 * This is important for scroll calculations!
 */

// 2.2 MESSAGE ARRAY ORDER
/*
 * Convention used throughout:
 * - Backend returns messages in ASC order (id1, id2, id3...) 
 * - Frontend converts to DESC (id3, id2, id1...)
 * - New messages: appended to end of DESC array
 * - Old messages: prepended to start of DESC array
 * 
 * Example:
 * Initial: [msg5, msg4, msg3, msg2, msg1] (DESC)
 * User scrolls up, loads 3 older messages
 * Result: [msg0, msg-1, msg-2, msg5, msg4, msg3, msg2, msg1] (DESC)
 */

// 2.3 SCROLL POSITION PRESERVATION
/*
 * When prepending old messages, scroll position must be adjusted:
 * 
 * BEFORE:
 * - scrollHeight = 1000px
 * - scrollTop = 200px
 * - User seeing messages at ~200px from top
 * 
 * AFTER adding 3 new messages (assume 100px each):
 * - scrollHeight = 1300px (1000 + 300)
 * - If we don't adjust: scrollTop still 200px, user sees different messages!
 * - Solution: scrollTop = 200 + 300 = 500px (same messages now at 500px)
 * 
 * This is what preserveScrollPosition + restoreScrollPosition do.
 */

// 2.4 SCROLL DETECTION THRESHOLDS
/*
 * The useChatScroll hook uses configurable thresholds:
 * 
 * bottomThreshold (default: 100px):
 * - isAtBottom = scrollTop < 100
 * - Means: user is within 100px of the bottom
 * - When true: auto-scroll new messages
 * 
 * topThreshold (default: 150px):
 * - isAtTop = (scrollHeight - scrollTop - clientHeight) < 150
 * - Means: user is within 150px of the top
 * - When true: trigger loading older messages
 * 
 * You can adjust these based on your UX needs:
 * useChatScroll({ bottomThreshold: 150, topThreshold: 200 })
 */

// ============================================================================
// 3. IMPLEMENTATION STEPS
// ============================================================================

// STEP 1: Install the hook
// - Copy useChatScroll.ts to src/hooks/
// - This provides scroll state management

// STEP 2: Create enhanced component
// - Copy ChatConversationWithInfiniteScroll.tsx to src/components/chat/
// - This provides the UI and infinite scroll logic

// STEP 3: Update ChatAPI
// - Add listMessagesBefore() method to ChatAPI
// - This fetches older messages for pagination

// STEP 4: Update Chat.jsx
// - Add state: loadingMoreMessages, hasMoreMessages
// - Add handler: handleLoadMoreMessages()
// - Replace ChatConversation with ChatConversationWithInfiniteScroll
// - See ChatWithAdvancedScroll.example.jsx for reference

// STEP 5: Update Backend (if needed)
// - Ensure listMessages returns ASC order
// - Add support for ?before=messageId parameter
// - Return enough messages to determine hasMore

// ============================================================================
// 4. SCROLL BEHAVIOR FLOWCHART
// ============================================================================

/*
 * INITIAL LOAD:
 * 1. User opens room
 * 2. Chat.jsx calls ChatAPI.listMessages()
 * 3. Backend returns last 50 messages (ASC order)
 * 4. Frontend reverses to DESC, sets messages
 * 5. ChatConversationWithInfiniteScroll renders
 * 6. useEffect detects first render, calls scrollToBottom('auto')
 * 7. Messages scroll to bottom (newest visible)
 * ✓ User sees latest messages
 * 
 * NEW MESSAGE ARRIVES (while at bottom):
 * 1. Socket emits chatMessage event
 * 2. Chat.jsx appends to messages array
 * 3. messages state updated
 * 4. ChatConversationWithInfiniteScroll re-renders
 * 5. useEffect in component detects isAtBottom = true
 * 6. Calls scrollToBottom('smooth')
 * 7. Auto-scrolls to show new message
 * ✓ User sees new message without scrolling
 * 
 * NEW MESSAGE ARRIVES (while scrolled up):
 * 1. Socket emits chatMessage event
 * 2. Chat.jsx appends to messages array
 * 3. ChatConversationWithInfiniteScroll re-renders
 * 4. useEffect detects isAtBottom = false
 * 5. Sets hasUnreadBelow = true
 * 6. "⬇️ New messages" button appears
 * 7. User clicks button
 * 8. handleSkipToLatest() calls scrollToBottom('smooth')
 * ✓ User can manually jump to latest
 * 
 * USER SCROLLS TO TOP:
 * 1. handleScroll() in useChatScroll detects isAtTop = true
 * 2. useEffect in ChatConversationWithInfiniteScroll triggers
 * 3. Calls preserveScrollPosition() to save state
 * 4. Calls onLoadMoreMessages(oldestMessageId)
 * 5. Chat.jsx loads older messages via ChatAPI.listMessagesBefore()
 * 6. Backend returns messages before oldestMessageId (ASC order)
 * 7. Frontend reverses and prepends to messages array
 * 8. ChatConversationWithInfiniteScroll re-renders with new messages
 * 9. requestAnimationFrame waits for DOM update
 * 10. Calls restoreScrollPosition() to adjust scrollTop
 * ✓ Scroll position preserved, old messages visible at top
 */

// ============================================================================
// 5. COMMON ISSUES AND SOLUTIONS
// ============================================================================

/*
 * ISSUE 1: Scroll jumps when loading old messages
 * CAUSE: Not calling preserveScrollPosition() before fetch
 * SOLUTION: Component already does this - if issue persists, check:
 *   - Is onLoadMoreMessages being called?
 *   - Is DOM updating after the promise resolves?
 *   - Try increasing timeout in restoreScrollPosition: setTimeout(..., 100)
 * 
 * ISSUE 2: "New messages" button doesn't appear
 * CAUSE: isAtBottom calculation is wrong
 * SOLUTION:
 *   - Check bottomThreshold value (maybe increase it)
 *   - Verify scrollTop is being calculated correctly
 *   - Try useChatScroll({ bottomThreshold: 200 })
 * 
 * ISSUE 3: Infinite scroll triggers too often
 * CAUSE: topThreshold is too large
 * SOLUTION:
 *   - Decrease topThreshold in useChatScroll
 *   - Or increase the px distance user needs to scroll to trigger
 *   - Try useChatScroll({ topThreshold: 100 })
 * 
 * ISSUE 4: Messages flicker or appear in wrong order
 * CAUSE: Message array order is inconsistent
 * SOLUTION:
 *   - Always reverse backend ASC → frontend DESC
 *   - Append new messages to end (not beginning)
 *   - Prepend old messages to start (not end)
 *   - Check ChatWithAdvancedScroll.example.jsx for correct patterns
 * 
 * ISSUE 5: Old messages load but scroll doesn't restore
 * CAUSE: scrollHeightBeforeRef not capturing value correctly
 * SOLUTION:
 *   - Check that preserveScrollPosition() is called BEFORE state update
 *   - Check that restoreScrollPosition() is called AFTER DOM renders
 *   - The component already handles this with requestAnimationFrame
 */

// ============================================================================
// 6. PERFORMANCE OPTIMIZATION TIPS
// ============================================================================

/*
 * 1. Message virtualization (for very long conversations)
 *    - Consider using react-virtual or similar
 *    - Render only visible messages, not all
 *    - Can combine with infinite scroll for better perf
 * 
 * 2. Debounce scroll events
 *    - Current implementation listens to every scroll
 *    - Can debounce to reduce re-renders
 *    - useCallback already prevents unnecessary re-renders
 * 
 * 3. Memoize MessageBubble components
 *    - Use React.memo() to prevent re-rendering unchanged messages
 *    - Especially important with many messages
 * 
 * 4. Pagination page size
 *    - 50 messages for initial load: good balance
 *    - 30 messages for each "load more": adjust based on avg message size
 *    - Increase if your messages are small (< 100 chars average)
 *    - Decrease if your messages are large (> 500 chars average)
 * 
 * 5. Socket batching
 *    - If many messages arrive rapidly, batch updates
 *    - Can debounce socket message handler to batch updates
 */

// ============================================================================
// 7. BACKEND API REQUIREMENTS
// ============================================================================

/*
 * Your backend needs to support:
 * 
 * 1. GET /chat/rooms/:roomId/messages?limit=50
 *    - Returns: Array of messages in ASC order (oldest first)
 *    - Response: [msg1(old), msg2, msg3, ..., msg50(newer)]
 *    - Should return AT MOST limit messages
 *    - If fewer returned → no more messages available
 * 
 * 2. GET /chat/rooms/:roomId/messages?before=messageId&limit=30
 *    - Returns: Messages with id < beforeMessageId in ASC order
 *    - Response: [msgX(very old), msgX+1, ..., msgId-1]
 *    - beforeMessageId should NOT be in response
 *    - Should return AT MOST limit messages
 *    - If fewer returned → no more messages before this ID
 * 
 * Both endpoints should include:
 * - message.id
 * - message.content (or text)
 * - message.userId
 * - message.user { id, username }
 * - message.createdAt
 * - message.edited, message.editedAt (optional)
 * - message.replyTo { id, content, user { username } } (if replying)
 * - message.replyToId (if replying)
 */

// ============================================================================
// 8. TESTING CHECKLIST
// ============================================================================

/*
 * ☐ Initial load scrolls to bottom
 * ☐ New message auto-scrolls when at bottom
 * ☐ New message shows button when scrolled up
 * ☐ Click button scrolls to bottom and hides button
 * ☐ Scroll to top triggers loading
 * ☐ Loading spinner appears at top while fetching
 * ☐ Old messages prepend correctly
 * ☐ Scroll position preserved when loading old
 * ☐ No double-loading of messages
 * ☐ Messages appear in correct order (newest at bottom)
 * ☐ Typing indicator works
 * ☐ Reply context displays correctly
 * ☐ Edit/delete work in combination with scroll
 * ☐ No console errors
 * ☐ Performance acceptable with 500+ messages
 * ☐ Works on mobile (small viewport)
 * ☐ Socket reconnect handles messages correctly
 */

export default {}
