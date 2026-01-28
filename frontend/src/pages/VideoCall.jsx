// frontend/src/pages/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Monitor,
  MessageSquare,
  Settings,
} from 'lucide-react'

// ICE Configuration
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
}

export default function VideoCall() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [localStream, setLocalStream] = useState(null)
  const [participants, setParticipants] = useState([]) // { userId, username, ... }
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting') // connecting, connected, disconnected

  // Refs
  const socketRef = useRef(null)
  const localVideoRef = useRef(null)
  const peersRef = useRef(new Map()) // userId -> RTCPeerConnection
  const remoteVideoRefs = useRef(new Map()) // userId -> HTMLVideoElement

  // Initialize Call
  useEffect(() => {
    if (!user || !meetingId) return

    const init = async () => {
      try {
        // 1. Get Local Stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // 2. Connect Socket
        // Use the same URL as the API (assumed from .env or window.location)
        const socketUrl = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:4000'
        
        socketRef.current = io(socketUrl, {
          path: '/socket.io',
          auth: {
            token: localStorage.getItem('access_token'),
          },
          transports: ['websocket'], // Force WebSocket for better performance
        })

        const socket = socketRef.current

        // Socket Events
        socket.on('connect', () => {
          console.log('[Video] Socket connected')
          setConnectionStatus('connected')
          
          // Join Video Room
          socket.emit('video:join', {
            meetingId
          })
        })

        socket.on('error', (err) => {
          console.error('[Video] Socket error:', err)
          setError(err.message || 'Connection error')
        })

        // Handle existing participants (Joiner logic: Initiate Offers)
        socket.on('video:participants-list', async ({ participants: existingUsers }) => {
          console.log('[Video] Participants list:', existingUsers)
          setParticipants(prev => {
            // Merge unique
            const map = new Map(prev.map(p => [p.userId, p]))
            existingUsers.forEach(p => map.set(p.userId, p))
            return Array.from(map.values())
          })

          // Create Offer for each existing user
          for (const remoteUser of existingUsers) {
            if (remoteUser.userId === user.id) continue
            await createPeerConnection(remoteUser.userId, true, stream)
          }
        })

        // Handle new user joined (Receiver logic: Wait for Offer)
        socket.on('video:user-joined', ({ userId, username }) => {
          console.log('[Video] User joined:', username)
          setParticipants(prev => {
            if (prev.find(p => p.userId === userId)) return prev
            return [...prev, { userId, username }]
          })
          // We don't create offer here; we wait for them to offer (Mesh convention varies, but let's stick to Joiner-Offers)
          // Wait... if we stick to Joiner-Offers, then we just wait.
          // BUT: we need to prepare to receive.
        })

        // Handle Offer
        socket.on('video:offer', async ({ from, sdp }) => {
          console.log('[Video] Received offer from:', from)
          const pc = await createPeerConnection(from, false, stream)
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('video:answer', {
            meetingId,
            to: from,
            sdp: pc.localDescription,
          })
        })

        // Handle Answer
        socket.on('video:answer', async ({ from, sdp }) => {
          console.log('[Video] Received answer from:', from)
          const pc = peersRef.current.get(from)
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          }
        })

        // Handle ICE Candidate
        socket.on('video:ice-candidate', async ({ from, candidate }) => {
          const pc = peersRef.current.get(from)
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          }
        })

        // Handle User Left
        socket.on('video:user-left', ({ userId }) => {
          console.log('[Video] User left:', userId)
          setParticipants(prev => prev.filter(p => p.userId !== userId))
          const pc = peersRef.current.get(userId)
          if (pc) {
            pc.close()
            peersRef.current.delete(userId)
          }
          remoteVideoRefs.current.delete(userId)
        })

      } catch (err) {
        console.error('[Video] Init error:', err)
        setError('Failed to access camera/microphone')
      }
    }

    init()

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (socketRef.current) {
        socketRef.current.emit('video:leave', { meetingId })
        socketRef.current.disconnect()
      }
      peersRef.current.forEach(pc => pc.close())
    }
  }, [meetingId, user])

  // Helper: Create Peer Connection
  const createPeerConnection = async (remoteUserId, isInitiator, stream) => {
    if (peersRef.current.has(remoteUserId)) return peersRef.current.get(remoteUserId)

    console.log(`[Video] Creating PC for ${remoteUserId} (Initiator: ${isInitiator})`)
    const pc = new RTCPeerConnection(RTC_CONFIG)
    peersRef.current.set(remoteUserId, pc)

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('video:ice-candidate', {
          meetingId,
          to: remoteUserId,
          candidate: event.candidate,
        })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log(`[Video] Received track from ${remoteUserId}`)
      const remoteVideo = remoteVideoRefs.current.get(remoteUserId)
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0]
      }
    }

    if (isInitiator) {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socketRef.current.emit('video:offer', {
        meetingId,
        to: remoteUserId,
        sdp: pc.localDescription,
      })
    }

    return pc
  }

  // Toggle Mute
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !micEnabled)
      setMicEnabled(!micEnabled)
    }
  }

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !cameraEnabled)
      setCameraEnabled(!cameraEnabled)
    }
  }

  // Leave Call
  const handleLeave = () => {
    navigate('/meeting')
  }

  // Render
  return (
    <div className="h-screen bg-neutral-900 flex flex-col text-white">
      {/* Header */}
      <div className="h-16 bg-neutral-800 flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600 rounded-lg">
            <Video size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Meeting Room</h1>
            <p className="text-xs text-gray-400">ID: {meetingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700 rounded-full text-sm">
            <Users size={16} className="text-gray-400" />
            <span>{participants.length + 1}</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr h-full">
          
          {/* Local User */}
          <div className="relative bg-neutral-800 rounded-xl overflow-hidden aspect-video shadow-lg border-2 border-violet-500/50">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] ${!cameraEnabled ? 'hidden' : ''}`}
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              You {micEnabled ? '' : '(Muted)'}
            </div>
          </div>

          {/* Remote Users */}
          {participants.map(p => (
            <div key={p.userId} className="relative bg-neutral-800 rounded-xl overflow-hidden aspect-video shadow-lg">
              <video
                ref={el => {
                  if (el) remoteVideoRefs.current.set(p.userId, el)
                  else remoteVideoRefs.current.delete(p.userId)
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {p.username}
              </div>
            </div>
          ))}
          
          {/* Waiting Placeholder */}
          {participants.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-gray-500 h-64">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <p>Waiting for others to join...</p>
            </div>
          )}

        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-xl backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Controls Bar */}
      <div className="h-20 bg-neutral-800 flex items-center justify-center gap-4 px-6 pb-safe">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all duration-200 ${
            micEnabled ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
          }`}
        >
          {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all duration-200 ${
            cameraEnabled ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
          }`}
        >
          {cameraEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-600 text-gray-400 cursor-not-allowed"
          title="Screen Share (Coming Soon)"
        >
          <Monitor size={24} />
        </button>

        <button
          className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-600 text-gray-400 cursor-not-allowed"
          title="Chat (Coming Soon)"
        >
          <MessageSquare size={24} />
        </button>

        <div className="w-px h-10 bg-neutral-700 mx-2" />

        <button
          onClick={handleLeave}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
        >
          <PhoneOff size={20} />
          Leave
        </button>
      </div>
    </div>
  )
}
