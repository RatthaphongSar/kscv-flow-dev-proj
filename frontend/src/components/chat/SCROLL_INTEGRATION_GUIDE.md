// INTEGRATION GUIDE: Advanced Chat Scroll System
/**
 * This file demonstrates how to integrate the new scroll system into your existing Chat.jsx
 * 
 * Key files:
 * - useChatScroll.ts: Custom hook for scroll state management
 * - ChatConversationWithInfiniteScroll.tsx: Enhanced component with infinite scroll
 * - ChatAPI: Updated with listMessagesBefore() for pagination
 * 
 * STEP 1: Add to Chat.jsx state
 * STEP 2: Update message loading logic
 * STEP 3: Replace ChatConversation with ChatConversationWithInfiniteScroll
 */

// ============= STEP 1: Add State for Infinite Scroll =============
// In your Chat.jsx, add these state variables:

/*
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
*/

// ============= STEP 2: Update Message Loading Logic =============
// Replace your current message loading with this pattern:

/*
  // Load initial messages when room changes
  useEffect(() => {
    if (!socket || !activeRoom) return

    let cancelled = false

    async function loadMessages() {
      setLoadingMessages(true)
      try {
        // Load latest 50 messages
        const oldMessages = await ChatAPI.listMessages(activeRoom.id, 50)
        if (!cancelled) {
          // Backend returns ASC (old → new)
          // Reverse to DESC (new → old) for flex-col-reverse layout
          const reversed = oldMessages ? [...oldMessages].reverse() : []
          setMessages(reversed)
          
          // Determine if there are more messages to load
          // If we got less than 50, no more messages
          setHasMoreMessages((oldMessages?.length || 0) >= 50)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }
    }

    loadMessages()

    // Join room for real-time updates
    socket.emit?.('joinRoom', { roomId: activeRoom.id })

    // Handle incoming messages
    const handleNewMessage = (msg) => {
      if (msg.roomId && msg.roomId !== activeRoom.id) return
      // New message comes as DESC (newest first)
      // Just append to end of array
      setMessages((prev) => [...prev, msg])
    }

    if (typeof socket.on === 'function') {
      socket.on('chatMessage', handleNewMessage)
    }

    return () => {
      cancelled = true
      socket.emit?.('leaveRoom', { roomId: activeRoom.id })
      safeOff('chatMessage', handleNewMessage)
    }
  }, [socket, activeRoom, user])
*/

// ============= STEP 2B: Handle Loading Older Messages =============
// Add this new effect to handle infinite scroll:

/*
  const handleLoadMoreMessages = useCallback(
    async (beforeMessageId) => {
      if (!activeRoom || loadingMoreMessages) return

      setLoadingMoreMessages(true)
      try {
        // Fetch older messages before the given messageId
        const olderMessages = await ChatAPI.listMessagesBefore(
          activeRoom.id,
          beforeMessageId,
          30 // Load 30 older messages at a time
        )
        
        if (olderMessages && olderMessages.length > 0) {
          // Backend returns ASC order
          // Reverse and prepend to messages array
          const reversed = [...olderMessages].reverse()
          setMessages((prev) => [...reversed, ...prev])
          
          // If we got less than 30, no more messages to load
          setHasMoreMessages(olderMessages.length >= 30)
        } else {
          // No more messages
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
*/

// ============= STEP 3: Update JSX =============
// Replace ChatConversation with ChatConversationWithInfiniteScroll:

/*
  import ChatConversationWithInfiniteScroll from '../components/chat/ChatConversationWithInfiniteScroll'

  // In your render:
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
      userId: '', // You may not have userId here, fill from your data
      username: info.username,
    }))}
  />
*/

// ============= BACKEND API NOTES =============
/*
 * The system expects:
 * 
 * 1. listMessages(roomId, limit):
 *    - Returns: Array of messages in ASC order (oldest first)
 *    - Example: GET /chat/rooms/:roomId/messages?limit=50
 * 
 * 2. listMessagesBefore(roomId, beforeMessageId, limit):
 *    - Returns: Messages with id < beforeMessageId in ASC order (oldest first)
 *    - Example: GET /chat/rooms/:roomId/messages?before=msgId123&limit=30
 *    - Should return approximately `limit` messages
 *    - Returns empty array if beforeMessageId is the oldest message
 * 
 * If your backend already supports pagination with cursor:
 * You can adapt listMessagesBefore to your existing API.
 */

// ============= SCROLL DETECTION LOGIC =============
/*
 * The useChatScroll hook detects scroll position using:
 * 
 * isAtBottom:
 *   - scrollTop < 100px from top (accounting for flex-col-reverse)
 *   - User is reading latest messages
 * 
 * isAtTop:
 *   - (scrollHeight - scrollTop - clientHeight) < 150px
 *   - User scrolled to load older messages
 * 
 * You can adjust these thresholds in the hook call:
 *   useChatScroll({ bottomThreshold: 100, topThreshold: 150 })
 */

// ============= TYPESCRIPT INTEGRATION =============
/*
 * If using TypeScript, add types for messages:
 * 
 * interface ChatMessage {
 *   id: string
 *   content: string
 *   text?: string
 *   userId: string
 *   user: { id: string; username: string }
 *   roomId: string
 *   createdAt: Date | string
 *   edited?: boolean
 *   editedAt?: Date | string
 *   replyTo?: {
 *     id: string
 *     content: string
 *     user: { username: string }
 *   } | null
 *   replyToId?: string | null
 * }
 */

export default {}
