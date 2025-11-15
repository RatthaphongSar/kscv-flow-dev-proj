// backend/prisma/schema.prisma.example
// ============================================
// ADD THESE FIELDS TO YOUR EXISTING SCHEMA
// ============================================

// ============================================
// 1. ADD TO Message MODEL
// ============================================

model Message {
  id        String   @id @default(cuid())
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  content   String
  
  // ✅ NEW FIELDS FOR STATUS TRACKING
  status    String   @default("sent") // pending | sent | delivered | seen
  seenBy    String[] @default([]) // Array of userId who have seen this message
  
  // ✅ FOR REPLY SYSTEM
  replyToId String?
  replyTo   Message? @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies   Message[] @relation("MessageReplies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([roomId])
  @@index([senderId])
}

// ============================================
// 2. ADD UnreadCount MODEL (NEW)
// ============================================

model UnreadCount {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  count     Int      @default(0) // Number of unread messages
  lastReadMessageId String? // ID of last message user has read
  
  updatedAt DateTime @updatedAt
  
  @@unique([userId, roomId])
  @@index([userId])
  @@index([roomId])
}

// ============================================
// 3. ADD TO Room MODEL (Optional, for read status)
// ============================================

model Room {
  id        String   @id @default(cuid())
  name      String
  members   String[] // Array of user IDs
  
  // Messages relation
  messages  Message[]
  
  // ✅ NEW: Track unread counts per member
  unreadCounts UnreadCount[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================
// 4. MIGRATION COMMANDS
// ============================================

/*
After updating schema.prisma:

1. Create migration:
   npx prisma migrate dev --name "add-message-status-unread-tracking"

2. Apply migration:
   npx prisma db push

3. Regenerate client:
   npx prisma generate

4. (Optional) Seed existing messages:
   
   // Mark all existing messages as 'delivered'
   UPDATE "Message" SET status = 'delivered' WHERE status = 'sent';
*/

// ============================================
// 5. API ENDPOINTS NEEDED
// ============================================

/*

POST /api/messages/:id/seen
├─ Purpose: Mark message and all previous as seen by user
├─ Body: { roomId }
├─ Response: { success, seenMessageIds[], unreadCount }
└─ Socket: Emit 'message:seen' to room

GET /api/rooms/:id/unread
├─ Purpose: Get unread count for current user in this room
├─ Response: { unreadCount, lastReadMessageId }
└─ Used on room load

GET /api/messages/:roomId
├─ Include in response: 
│  ├─ message.status
│  ├─ message.seenBy[]
│  ├─ message.replyTo (for replies)
│  └─ user.unreadCount for this room
└─ Used for initial load

WEBSOCKET: message:delivered
├─ From: Server
├─ To: Sender
├─ Payload: { messageId, timestamp }
└─ Used when message saved to DB

WEBSOCKET: message:seen
├─ From: Server
├─ To: All in room
├─ Payload: { messageId, seenByUserId, roomId, timestamp }
└─ Used when user marks message seen

WEBSOCKET: room:unreadCountUpdated
├─ From: Server
├─ To: User
├─ Payload: { roomId, unreadCount }
└─ Used when unread count changes

*/
