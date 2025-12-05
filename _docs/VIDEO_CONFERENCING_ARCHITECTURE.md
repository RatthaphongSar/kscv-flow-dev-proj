# 🎥 Video Conferencing System (Microsoft Teams-like) - Architecture & Implementation Plan

## 📋 System Overview

Building a complete video conferencing system for KVC WebApp with:
- ✅ Real-time video/audio streaming (WebRTC)
- ✅ Screen sharing for presentations
- ✅ Participant management
- ✅ Meeting recording capability
- ✅ Chat in video call
- ✅ Hand raise functionality
- ✅ Camera/Microphone controls

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  VideoConferenceRoom Component                       │  │
│  │  ├── Camera/Mic Toggle                              │  │
│  │  ├── ParticipantGrid (RTCPeerConnection)           │  │
│  │  ├── ScreenShareViewer                              │  │
│  │  ├── ChatPanel (Socket.io)                          │  │
│  │  └── ParticipantList with Hand Raise               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕ (Socket.io + HTTP)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Meeting Room Server (Socket.io Namespace)           │  │
│  │  ├── Join/Leave handling                             │  │
│  │  ├── WebRTC Signaling (offer/answer/ice-candidate)  │  │
│  │  ├── Screen Share Signaling                          │  │
│  │  └── Participant State Management                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST APIs                                            │  │
│  │  ├── /api/meetings/:id/recording (start/stop)       │  │
│  │  ├── /api/meetings/:id/transcription                │  │
│  │  └── /api/meetings/:id/stats                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                           │
│  ├── Meeting (updated with recording URLs)                  │
│  ├── VideoSession (call recordings, metadata)              │
│  ├── ScreenShareSession (presenter, timestamps)            │
│  ├── CallStats (quality metrics, duration)                 │
│  └── ChatMessage (preserved from meeting)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

### Updated Meeting Model
```prisma
model Meeting {
  // ... existing fields ...
  
  // Video call features
  recordingStartedAt   DateTime?
  recordingStoppedAt   DateTime?
  recordingUrl         String?        // S3/storage URL
  recordingDuration    Int?           // in seconds
  hasTranscription     Boolean        @default(false)
  transcriptionUrl     String?
  
  // Relations
  videoSessions        VideoSession[]
  screenSessions       ScreenShareSession[]
  callStats           CallStats[]
  chatMessages        ChatMessage[]
}
```

### New VideoSession Model
```prisma
model VideoSession {
  id              String    @id @default(cuid())
  status          String    // active | completed | failed
  startedAt       DateTime  @default(now())
  endedAt         DateTime?
  recordingUrl    String?   // S3 storage
  recordingSize   Int?      // bytes
  duration        Int?      // seconds
  
  // Relations
  meeting         Meeting   @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  meetingId       String
  participants    VideoParticipant[]
  stats          CallStats[]
  
  @@index([meetingId, startedAt])
}
```

### New VideoParticipant Model
```prisma
model VideoParticipant {
  id              String    @id @default(cuid())
  userId          String
  joinedAt        DateTime  @default(now())
  leftAt          DateTime?
  
  // Video quality metrics
  videoEnabled    Boolean   @default(true)
  audioEnabled    Boolean   @default(true)
  screenShared    Boolean   @default(false)
  
  // Stats
  videoQuality    String?   // HD, SD, LOW
  audioQuality    String?   // excellent, good, fair, poor
  jitterMs        Int?      // milliseconds
  packetLoss      Float?    // percentage
  
  // Relations
  user            User      @relation("VideoParticipant", fields: [userId], references: [id], onDelete: Cascade)
  session         VideoSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId       String
  
  @@unique([sessionId, userId])
  @@index([sessionId])
}
```

### New ScreenShareSession Model
```prisma
model ScreenShareSession {
  id              String    @id @default(cuid())
  presenterId     String
  screenUrl       String?   // Recording of screen
  startedAt       DateTime  @default(now())
  stoppedAt       DateTime?
  duration        Int?
  
  // Relations
  presenter       User      @relation("ScreenPresenter", fields: [presenterId], references: [id], onDelete: Cascade)
  meeting         Meeting   @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  meetingId       String
  
  @@index([meetingId, startedAt])
}
```

### New CallStats Model
```prisma
model CallStats {
  id              String    @id @default(cuid())
  
  // Video metrics
  videoBitrate    Int?      // kbps
  videoFramerate  Int?      // fps
  videoResolution String?   // 1920x1080, 1280x720, etc
  
  // Audio metrics
  audioBitrate    Int?      // kbps
  audioLevel      Int?      // 0-100
  
  // Network metrics
  latencyMs       Int?      // round trip time
  jitterMs        Int?      // variation
  packetLossPercent Float?
  bandwidth       Int?      // kbps available
  
  recordedAt      DateTime  @default(now())
  
  // Relations
  session         VideoSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId       String
  
  @@index([sessionId, recordedAt])
}
```

### New ChatMessage Model
```prisma
model ChatMessage {
  id              String    @id @default(cuid())
  content         String
  senderName      String
  createdAt       DateTime  @default(now())
  
  // Relations
  sender          User      @relation("ChatSender", fields: [senderId], references: [id], onDelete: Cascade)
  senderId        String
  meeting         Meeting   @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  meetingId       String
  
  @@index([meetingId, createdAt])
}
```

---

## 🔌 Backend APIs

### REST Endpoints

#### Meeting Recording
```
POST   /api/meetings/:id/recording/start   - Start recording
POST   /api/meetings/:id/recording/stop    - Stop recording
GET    /api/meetings/:id/recording/status  - Get recording status
GET    /api/meetings/:id/recording/download - Get recording file
```

#### Video Call Stats
```
GET    /api/meetings/:id/stats/participants   - Current participants
GET    /api/meetings/:id/stats/quality        - Network quality stats
POST   /api/meetings/:id/stats/log            - Log participant stats (from frontend)
```

#### Chat in Meeting
```
POST   /api/meetings/:id/chat/message   - Send message
GET    /api/meetings/:id/chat/history   - Get chat history
```

---

## 🌐 WebSocket Events (Socket.io)

### Namespace: `/meetings/:meetingId`

#### Connection Events
```javascript
// Client → Server
'join_video' → { userId, name, stream }
'leave_video' → { userId }

// Server → Clients
'user_joined' → { userId, name, timestamp }
'user_left' → { userId }
'participants_updated' → { list: [...participants] }
```

#### WebRTC Signaling
```javascript
// Client → Server
'offer' → { from, to, sdp }
'answer' → { from, to, sdp }
'ice-candidate' → { from, to, candidate }

// Server → Client
'offer' ← { from, sdp }
'answer' ← { from, sdp }
'ice-candidate' ← { from, candidate }
```

#### Screen Sharing
```javascript
// Client → Server
'start_screen_share' → { userId, screenStream }
'stop_screen_share' → { userId }

// Server → Clients
'screen_share_started' → { userId, timestamp }
'screen_share_stopped' → { userId }
'screen_data' ← binary stream
```

#### Participant Actions
```javascript
// Client → Server
'toggle_camera' → { enabled }
'toggle_audio' → { enabled }
'raise_hand' → {}
'lower_hand' → {}

// Server → Clients
'camera_toggled' → { userId, enabled }
'audio_toggled' → { userId, enabled }
'hand_raised' → { userId }
'hand_lowered' → { userId }
```

#### Chat
```javascript
// Client → Server
'chat_message' → { content, timestamp }

// Server → Clients
'chat_message' ← { userId, name, content, timestamp }
'chat_history' ← { messages: [...] }
```

---

## 🎨 Frontend Components Structure

### Main Components
```
VideoConferenceRoom.tsx (Main container)
├── VideoGrid.tsx (Participant video grid)
│   ├── VideoParticipant.tsx (Single participant video)
│   ├── LocalVideo.tsx (Own camera feed)
│   └── ScreenShareViewer.tsx (Presenter screen)
├── ControlBar.tsx (Camera/Mic/Share controls)
│   ├── CameraToggle
│   ├── MicToggle
│   ├── ScreenShareButton
│   ├── RecordingIndicator
│   ├── HandRaiseButton
│   └── EndCallButton
├── ParticipantPanel.tsx (List of participants)
│   ├── ParticipantItem.tsx
│   └── HandRaisedList
├── ChatPanel.tsx (In-call chat)
│   ├── ChatMessages
│   ├── ChatInput
│   └── ChatTimestamp
├── StatsPanel.tsx (Quality metrics - optional)
│   ├── NetworkStats
│   ├── VideoQuality
│   └── AudioLevel
└── ScreenSharePresenter.tsx (Presenter tools)
    ├── PausePresentation
    ├── PointerTool
    └── AnnotationTools
```

### Supporting Hooks
```javascript
useWebRTC()              // WebRTC connection management
useScreenShare()         // Screen sharing logic
useAudioVideo()          // Camera/Mic controls
useCallStats()           // Quality metrics
useSocketConnection()    // Socket.io management
useChatMessages()        // Chat state management
```

---

## 🔌 Technology Stack

### Backend
- **Express.js** - HTTP server
- **Socket.io** - Real-time WebSocket communication
- **WebRTC** (via browser) - Peer-to-peer video
- **Prisma** - Database ORM
- **node-media-server** (optional) - Video streaming/recording
- **ffmpeg** (optional) - Video transcoding

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **WebRTC API** - Video/audio streaming
- **Socket.io-client** - Real-time events
- **React-grid-layout** - Participant grid
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

### Third-party Services (Optional)
- **Agora.io** / **Twilio** - Managed video (simpler, more reliable)
- **Amazon S3** / **Google Cloud Storage** - Video recording storage
- **AssemblyAI** / **Google Cloud Speech** - Transcription

---

## 🚀 Implementation Phases

### Phase 1: Core Video (Week 1)
- [ ] Database models (VideoSession, VideoParticipant, etc.)
- [ ] Socket.io namespace setup
- [ ] WebRTC signaling (offer/answer/ICE)
- [ ] Basic participant grid
- [ ] Camera/Mic controls
- [ ] Join/Leave functionality

### Phase 2: Screen Sharing (Week 2)
- [ ] Screen capture API
- [ ] Screen share signaling
- [ ] Screen share display
- [ ] Presenter controls
- [ ] Switch between camera and screen

### Phase 3: Features (Week 3)
- [ ] Chat in meeting
- [ ] Hand raise
- [ ] Recording (local or server)
- [ ] Call statistics
- [ ] Participant list

### Phase 4: Polish & Testing (Week 4)
- [ ] Error handling
- [ ] Network quality detection
- [ ] Fallback to audio-only
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## 🔐 Security Considerations

1. **WebRTC Encryption**
   - DTLS-SRTP for encrypted media
   - Secure signaling via Socket.io with JWT

2. **Access Control**
   - Only enrolled students can join
   - Only teacher can start meeting
   - Only creator can control recording

3. **Data Protection**
   - Encrypt stored recordings
   - Secure S3 URLs with expiration
   - Clear recordings after retention period

4. **Rate Limiting**
   - Limit socket connections per user
   - Rate limit chat messages
   - Prevent spam/DoS

---

## 📝 Implementation Checklist

### Database
- [ ] Add VideoSession model
- [ ] Add VideoParticipant model
- [ ] Add ScreenShareSession model
- [ ] Add CallStats model
- [ ] Add ChatMessage model
- [ ] Update Meeting model with recording fields
- [ ] Add User relation for screen sharing
- [ ] Create migration
- [ ] Test queries

### Backend APIs
- [ ] Recording start/stop endpoints
- [ ] Stats logging endpoint
- [ ] Chat message API
- [ ] Set up Socket.io namespace
- [ ] Implement WebRTC signaling
- [ ] Implement screen share signaling
- [ ] Participant state management
- [ ] Error handling & validation

### Frontend Components
- [ ] VideoConferenceRoom component
- [ ] VideoGrid component
- [ ] Participant video component
- [ ] Local video component
- [ ] Control bar with all controls
- [ ] Chat panel
- [ ] Participant list
- [ ] Screen share viewer
- [ ] Stats display (optional)

### Features
- [ ] Camera toggle
- [ ] Microphone toggle
- [ ] Screen sharing
- [ ] Chat messaging
- [ ] Hand raise
- [ ] Participant count
- [ ] Call duration timer
- [ ] Recording indicator

### Testing
- [ ] Join/leave flow
- [ ] Video quality
- [ ] Audio quality
- [ ] Screen sharing
- [ ] Chat in meeting
- [ ] Multiple participants
- [ ] Network disconnection handling
- [ ] Browser compatibility

---

## 📦 Dependencies to Add

### Backend
```json
{
  "socket.io": "^4.7.0",
  "node-media-server": "^2.4.0",
  "fluent-ffmpeg": "^2.1.2"
}
```

### Frontend
```json
{
  "react-grid-layout": "^1.3.4",
  "simple-peer": "^9.11.1",
  "socket.io-client": "^4.7.0"
}
```

---

## 🎯 Success Criteria

- ✅ Multiple users can video conference simultaneously
- ✅ Screen sharing works without lag
- ✅ Chat in-call is functional
- ✅ Recording stores video properly
- ✅ No mock data - all real integration
- ✅ Handles network interruptions gracefully
- ✅ Mobile responsive design
- ✅ < 300ms latency for video
- ✅ Clear UI with intuitive controls
- ✅ 95%+ test coverage

---

## 📅 Timeline

**Estimated: 4 weeks** for full implementation from scratch

Current Progress:
- ✅ Week 0: Meeting system foundation (COMPLETE)
- ⏳ Week 1: Video conferencing core
- ⏳ Week 2: Screen sharing
- ⏳ Week 3: Features & chat
- ⏳ Week 4: Testing & optimization

---

## 💡 Alternative Approaches

### Option 1: Custom WebRTC (Current Plan)
- **Pros**: Full control, lower cost
- **Cons**: More complex, requires careful optimization
- **Effort**: 4 weeks

### Option 2: Use Managed Service (Agora/Twilio)
- **Pros**: Easy integration, highly reliable, built-in recording
- **Cons**: Monthly costs, less control
- **Effort**: 1 week

### Option 3: Hybrid (WebRTC + CDN)
- **Pros**: Scalable, good video quality
- **Cons**: Complex setup
- **Effort**: 3 weeks

**Recommendation**: Start with Option 1 (custom WebRTC) for learning and full control. Can migrate to Option 2 later if needed.

---

**Status**: Ready to start implementation
**Branch**: meeting-schedule-system
**Next**: Create database models and start Phase 1
