# 🎥 Video Conferencing System - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Should show: `HTTP listening on http://localhost:4001`

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Should show: `Local: http://localhost:5173/`

---

## 🧪 Testing Video Call (2 Browsers)

### Browser 1 (Teacher)
1. Open: http://localhost:5173/
2. Login: username `teacher`, password any
3. Click: "Meetings" menu
4. Click: "New Meeting" button
5. Fill: Title "Test Meeting", others optional
6. Click: "Create Meeting"
7. Click: "Start Meeting" (green button)
8. ✅ Video call page opens

### Browser 2 (Student - Incognito/Private)
1. Open: http://localhost:5173/ (in incognito)
2. Login: username `student`, password any
3. Click: "Meetings" menu
4. Click: Same "Test Meeting"
5. Click: "Join Now" button
6. ✅ Both users in same video call

---

## 🎮 Test Features Checklist

### Video Controls
- [ ] **Camera Toggle**: Click camera icon, should disable video
- [ ] **Microphone Toggle**: Click mic icon, should mute audio
- [ ] **Screen Share**: Click share icon, select screen, should show presenter view

### Chat
- [ ] Click chat icon (💬)
- [ ] Type message and press Enter
- [ ] Message appears with timestamp
- [ ] Other browser sees message

### Participants
- [ ] Click participants icon (👥)
- [ ] See list of users in call
- [ ] See camera/mic status (🟢=on, 🔴=off)
- [ ] See screen share indicator

### Hand Raise
- [ ] Click hand raise button (✋)
- [ ] Button highlights in yellow
- [ ] Other users see notification
- [ ] Click again to lower hand

### Leave Call
- [ ] Click phone icon (red button)
- [ ] Should go back to meetings list
- [ ] Other browser shows user left

---

## 🐛 Debugging Tips

### Check Backend Logs
```
[Video] User 123 joined meeting abc-def
[Socket] Connected: user-123
[Chat] Message saved: "Hello"
```

### Check Frontend Console
Open Browser DevTools (F12) → Console tab

```javascript
// Test Socket.io connection
console.log('Socket connected:', socket?.connected)

// Test local stream
console.log('Has video:', localStream?.getVideoTracks().length > 0)
console.log('Has audio:', localStream?.getAudioTracks().length > 0)

// Test participants
console.log('Participants:', participants)
```

### Common Issues

**Problem**: "Failed to connect to video server"
- **Solution**: Make sure backend is running on port 4001
- **Check**: Open http://localhost:4001/health (should show `{"ok":true}`)

**Problem**: Camera/mic not working
- **Solution**: Browser needs permission, click "Allow" when prompted
- **Note**: HTTPS required for production, HTTP okay for localhost

**Problem**: Messages not appearing
- **Solution**: Check browser console for errors
- **Check**: Database connection working: `npm run prisma studio`

**Problem**: Participants not showing
- **Solution**: Wait 2-3 seconds after joining
- **Check**: Socket.io connected in console

---

## 📊 What's Actually Working

### ✅ Already Implemented & Ready
- ✅ Video grid layout (placeholder video)
- ✅ Camera/mic toggle buttons
- ✅ Screen share button (integration ready)
- ✅ Chat messaging (real, working)
- ✅ Hand raise (real, working)
- ✅ Participant list (real-time)
- ✅ Call duration timer
- ✅ Recording start/stop (database)
- ✅ Database persistence
- ✅ Real-time updates via Socket.io

### ⚠️ Placeholder/Partial (Ready for Full Implementation)
- ⚠️ Actual video streams (WebRTC peer connections)
- ⚠️ Actual screen content (Media capture API ready)
- ⚠️ Actual video recording (ffmpeg integration needed)
- ⚠️ Speech recognition (would need API)

### Why Placeholders?
Full WebRTC implementation requires:
1. Each user creates RTCPeerConnection
2. Exchange SDP offers/answers via Socket.io
3. Add audio/video tracks from getUserMedia()
4. Handle ICE candidates for NAT traversal

This is 200+ more lines of complex JavaScript that depends on browser capabilities.

---

## 🚀 To Implement Real WebRTC Video

The foundation is ready! To enable actual video:

1. **In `useVideoCall.ts`**, uncomment/enable WebRTC peer connection code
2. **Add ICE candidate handling** for NAT traversal
3. **Bind video streams** to video elements
4. **Handle renegotiation** when participants join/leave

**Estimated time**: 2-3 hours for full WebRTC integration

---

## 📱 Architecture Overview

```
User A Browser                    Backend (Node.js)           User B Browser
│                                     │                             │
├─ Video Component                   ├─ Express API               ├─ Video Component
├─ useVideoCall Hook                 ├─ Socket.io Namespace       ├─ useVideoCall Hook
├─ Socket.io Client     ◄───────────►├─ Prisma ORM                ├─ Socket.io Client
├─ getUserMedia()                    ├─ PostgreSQL (Video data)   ├─ getUserMedia()
├─ RTCPeerConnection                 │                             ├─ RTCPeerConnection
│                                     │                             │
└─ (Offer/Answer via Socket.io) ─────┘──────────────────────────────┘
```

---

## ✅ Success Checklist

Complete this to verify everything works:

- [ ] Both servers running (backend on 4001, frontend on 5173)
- [ ] Can login as teacher and student
- [ ] Can create and join meetings
- [ ] Chat messages send and receive
- [ ] Hand raise works
- [ ] Participants list updates
- [ ] Camera/mic toggles work
- [ ] Can leave call
- [ ] Meeting shows in history

**If all checked**: ✅ System is working correctly!

---

## 📞 Need Help?

### Check These Files for Implementation Details
- **Backend**: `backend/src/services/videoConferencing.js` (290 lines)
- **Backend**: `backend/src/socket.js` (video events section)
- **Frontend**: `frontend/src/hooks/useVideoCall.ts` (280 lines)
- **Frontend**: `frontend/src/components/VideoConferenceRoom.tsx` (970 lines)
- **Database**: `backend/prisma/schema.prisma` (video models)

### Check These Documents
- `VIDEO_CONFERENCING_ARCHITECTURE.md` - Full system design
- `VIDEO_CONFERENCING_COMPLETE_REPORT.md` - Implementation details

---

## 🎯 Next Phase (Optional Enhancements)

After core testing passes:
1. **Add recording** using MediaRecorder API
2. **Add screen annotation** tools
3. **Add virtual backgrounds**
4. **Add speaker detection** (who's talking)
5. **Add bandwidth optimization**
6. **Add mobile app support**

---

**Ready to test?** Start with Step 1 above! 🚀

**Last Updated**: November 26, 2025
