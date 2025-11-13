# Chat API Integration Guide

## Overview
The Chat page now supports three advanced features that require backend integration:
1. **@Mention System** — Tag users in messages
2. **File Attachments** — Upload and share files (images, PDFs, docs)
3. **File Size Validation** — Enforce 10MB limit

## API Endpoints Required

### 1. Send Message with Mention & Attachments

**POST** `/api/messages`

#### Request
```typescript
Content-Type: multipart/form-data

{
  conversationId: string;      // Conversation ID
  text: string;                // Message text
  mentions?: Mention[];        // Array of @mentions
  file?: File;                 // Optional attachment
}
```

#### Mention Object
```typescript
interface Mention {
  id: string;           // Unique ID
  userId: string;       // User being mentioned
  name: string;         // User's display name
  index: number;        // Position in text where @mention starts
  length: number;       // Length of mention text
}
```

#### Response
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  type: 'text' | 'file';
  attachment?: {
    id: string;
    filename: string;
    size: string;        // "1.2MB" format
    type: string;        // "pdf", "doc", "jpg", etc.
    url?: string;        // Download URL
  };
  mentions?: Mention[];
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "conversationId=c1" \
  -F "text=Hey @Mohammad Ali, check this doc!" \
  -F "file=@/path/to/document.pdf" \
  -F "mentions=[{\"id\":\"m1\",\"userId\":\"u1\",\"name\":\"Mohammad Ali\",\"index\":4,\"length\":13}]"
```

#### JavaScript/Fetch Example
```javascript
async function sendMessageWithMention(conversationId, text, mentions, file) {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('text', text);
  formData.append('mentions', JSON.stringify(mentions));
  
  if (file) {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    formData.append('file', file);
  }
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
}
```

### 2. Get Users for @mention Autocomplete

**GET** `/api/users?search=query`

#### Query Parameters
```
search (optional) - Filter users by name
limit (optional)  - Max results (default: 10)
```

#### Response
```typescript
{
  users: User[]
}

interface User {
  id: string;
  name: string;
  role?: string;        // "Student", "Teacher", etc.
  avatar?: string;      // Avatar URL
  status?: 'online' | 'offline' | 'away';
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:3000/api/users?search=mohamma" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Upload Attachment

**POST** `/api/attachments`

#### Request
```
Content-Type: multipart/form-data

{
  file: File;
  conversationId: string;
}
```

#### Response
```typescript
{
  id: string;
  filename: string;
  size: string;          // "1.2MB"
  type: string;          // "pdf", "jpg", etc.
  url: string;           // Download URL
  uploadedAt: string;
}
```

---

## Frontend Implementation (Mock → Real API)

### Current Mock Implementation
```typescript
// frontend/src/components/chat/ChatLayout.tsx
function handleSend(text: string, attachment?: AttachmentData | null){
  const m: Message = { 
    id: 'm_'+Date.now(), 
    conversationId: activeId, 
    senderId: 'me', 
    text, 
    createdAt: new Date().toISOString(), 
    type: attachment ? 'file' : 'text',
    attachment: attachment ? {
      id: 'a_'+Date.now(),
      filename: attachment.file.name,
      size: (attachment.file.size / 1024 / 1024).toFixed(2) + 'MB',
      type: attachment.file.type.split('/')[1] || 'file'
    } : null,
    mentions: []
  };
  setAllMessages(prev=>[...prev, m]);
}
```

### Real API Implementation
```typescript
// Replace with actual API call
import { parseMentions } from '@/utils/mentions';

async function handleSend(text: string, attachment?: AttachmentData | null) {
  try {
    // Parse @mentions from text
    const mentions = parseMentions(text);
    
    const formData = new FormData();
    formData.append('conversationId', activeId);
    formData.append('text', text);
    formData.append('mentions', JSON.stringify(mentions));
    
    if (attachment) {
      // Validate file size (backend also validates)
      if (attachment.file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      formData.append('file', attachment.file);
    }
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to send message');
    
    const newMessage = await response.json();
    setAllMessages(prev => [...prev, newMessage]);
    
  } catch (err) {
    setError(err.message);
  }
}
```

---

## Backend Implementation Requirements

### Middleware
1. **Authentication** — Verify JWT token
2. **File Upload** — Handle multipart/form-data
3. **Size Validation** — Enforce 10MB limit
4. **MIME Type Check** — Validate file types

### Validation Rules
```javascript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`File size (${file.size} bytes) exceeds 10MB limit`);
  }
}
```

### Database Schema (Prisma)

```prisma
model Message {
  id                String   @id @default(cuid())
  conversationId    String
  conversation      Conversation @relation(fields: [conversationId], references: [id])
  senderId          String
  sender            User     @relation(fields: [senderId], references: [id])
  text              String?
  type              String   @default("text") // "text" or "file"
  
  // Mentions
  mentions          Mention[]
  
  // Attachment
  attachmentId      String?
  attachment        Attachment? @relation(fields: [attachmentId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([conversationId])
  @@index([senderId])
}

model Mention {
  id                String   @id @default(cuid())
  messageId         String
  message           Message  @relation(fields: [messageId], references: [id])
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  name              String
  index             Int      // Position in text
  length            Int      // Length of mention
  
  createdAt         DateTime @default(now())
  
  @@index([messageId])
  @@index([userId])
}

model Attachment {
  id                String   @id @default(cuid())
  filename          String
  originalName      String
  mimeType          String
  size              Int
  url               String   // Storage URL (S3, local, etc.)
  
  // Link to messages
  messages          Message[]
  
  uploadedBy        String
  uploadedByUser    User     @relation(fields: [uploadedBy], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## File Storage Strategies

### Option 1: Local Storage
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', ...];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### Option 2: AWS S3
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function uploadToS3(file) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
}
```

---

## Error Handling

### Common Errors
```typescript
// File size exceeded
{
  status: 413,
  error: 'File size exceeds 10MB limit',
  details: { size: '15.32MB' }
}

// Invalid file type
{
  status: 415,
  error: 'File type not allowed',
  details: { type: 'application/exe' }
}

// User not found (for mention)
{
  status: 404,
  error: 'User not found',
  details: { userId: 'u_invalid' }
}

// Unauthorized
{
  status: 401,
  error: 'Unauthorized'
}
```

---

## Rate Limiting (Recommended)

```javascript
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 10,                     // 10 messages per minute
  message: 'Too many messages sent'
});

app.post('/api/messages', messageLimiter, handleSendMessage);
```

---

## Notification System (Future)

When user is mentioned:
```typescript
// Trigger notification event
io.to(mentionedUserId).emit('mentioned', {
  message: newMessage,
  mentionedBy: senderName,
  conversationTitle: conversationTitle
});
```

---

## Testing Examples

### Test 1: Send message with mention
```bash
# Request
POST /api/messages
Content-Type: multipart/form-data

conversationId=c1
text=Hey @Mohammad Ali, are you ready?
mentions=[{"userId":"u1","name":"Mohammad Ali","index":4,"length":13}]

# Expected Response
Status: 200
{
  "id": "m_123",
  "text": "Hey @Mohammad Ali, are you ready?",
  "mentions": [{"userId":"u1","name":"Mohammad Ali",...}]
}
```

### Test 2: Send message with file attachment
```bash
# Request
POST /api/messages
Content-Type: multipart/form-data

conversationId=c1
text=Check out this homework
file=<binary PDF data>

# Expected Response
Status: 200
{
  "id": "m_124",
  "text": "Check out this homework",
  "attachment": {
    "id": "a_456",
    "filename": "homework.pdf",
    "size": "2.5MB",
    "type": "pdf",
    "url": "/uploads/homework.pdf"
  }
}
```

### Test 3: File size validation
```bash
# Request (11MB file - exceeds limit)
POST /api/messages
File: huge_video.mp4 (11MB)

# Expected Response
Status: 413
{
  "error": "File size exceeds 10MB limit",
  "details": {"size": "11.2MB"}
}
```

---

## Deployment Checklist

- [ ] CORS configured for file uploads
- [ ] File storage (local or S3) set up
- [ ] Database migrations run (Mention, Attachment tables)
- [ ] Rate limiting configured
- [ ] File size validation middleware added
- [ ] MIME type validation implemented
- [ ] Virus scanning (optional) configured
- [ ] File cleanup job for old/unused attachments
- [ ] Tests written for all endpoints
- [ ] Documentation updated

---

**Frontend Status:** ✅ Ready (mock data)  
**Backend Status:** ⏳ Ready for implementation  
**Last Updated:** November 13, 2025
