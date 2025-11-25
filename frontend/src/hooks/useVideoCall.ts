// frontend/src/hooks/useVideoCall.ts
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Participant {
  userId: string
  username: string
  videoEnabled: boolean
  audioEnabled: boolean
  screenShared: boolean
}

interface UseVideoCallReturn {
  socket: Socket | null
  participants: Participant[]
  localStream: MediaStream | null
  screenStream: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  error: string | null
  joinVideoCall: (meetingId: string, sessionId: string) => Promise<void>
  leaveVideoCall: () => Promise<void>
  toggleVideo: () => Promise<void>
  toggleAudio: () => Promise<void>
  startScreenShare: () => Promise<void>
  stopScreenShare: () => Promise<void>
  sendChatMessage: (content: string) => void
  raiseHand: () => void
  lowerHand: () => void
}

export function useVideoCall(meetingId: string): UseVideoCallReturn {
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    try {
      const socket = io('http://localhost:4001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      socketRef.current = socket

      // Listen for participant list
      socket.on('video:participants-list', ({ participants: list }) => {
        setParticipants(list)
      })

      // Listen for user joined
      socket.on('video:user-joined', ({ userId, username }) => {
        console.log(`User ${username} joined`)
        setParticipants(prev => [
          ...prev,
          { userId, username, videoEnabled: true, audioEnabled: true, screenShared: false }
        ])
      })

      // Listen for user left
      socket.on('video:user-left', ({ userId }) => {
        setParticipants(prev => prev.filter(p => p.userId !== userId))
        const peerConnection = peerConnectionsRef.current.get(userId)
        if (peerConnection) {
          peerConnection.close()
          peerConnectionsRef.current.delete(userId)
        }
      })

      // Listen for camera toggle
      socket.on('video:camera-toggled', ({ userId, enabled }) => {
        setParticipants(prev =>
          prev.map(p => (p.userId === userId ? { ...p, videoEnabled: enabled } : p))
        )
      })

      // Listen for mic toggle
      socket.on('video:mic-toggled', ({ userId, enabled }) => {
        setParticipants(prev =>
          prev.map(p => (p.userId === userId ? { ...p, audioEnabled: enabled } : p))
        )
      })

      // Listen for errors
      socket.on('error', ({ message }) => {
        setError(message)
      })

      return () => {
        socket.disconnect()
      }
    } catch (err) {
      console.error('Socket connection error:', err)
      setError('Failed to connect to video server')
    }
  }, [])

  // Get local media stream
  const getLocalStream = async (): Promise<MediaStream> => {
    if (localStreamRef.current) {
      return localStreamRef.current
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      })

      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera/microphone'
      setError(errorMsg)
      throw err
    }
  }

  // Join video call
  const joinVideoCall = async (meetingId: string, sessionId: string) => {
    try {
      const stream = await getLocalStream()

      if (socketRef.current) {
        socketRef.current.emit('video:join', { meetingId, sessionId })
      }
    } catch (err) {
      setError('Failed to join video call')
      console.error('Join error:', err)
    }
  }

  // Leave video call
  const leaveVideoCall = async () => {
    try {
      // Stop all streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
        setLocalStream(null)
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
        screenStreamRef.current = null
        setScreenStream(null)
      }

      // Close peer connections
      peerConnectionsRef.current.forEach(pc => pc.close())
      peerConnectionsRef.current.clear()

      // Emit leave event
      if (socketRef.current) {
        socketRef.current.emit('video:leave', { meetingId })
      }
    } catch (err) {
      console.error('Leave error:', err)
    }
  }

  // Toggle video
  const toggleVideo = async () => {
    try {
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled
          setIsVideoEnabled(videoTrack.enabled)

          if (socketRef.current) {
            socketRef.current.emit('video:toggle-camera', {
              meetingId,
              enabled: videoTrack.enabled,
            })
          }
        }
      } else {
        const stream = await getLocalStream()
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          setIsVideoEnabled(true)
          if (socketRef.current) {
            socketRef.current.emit('video:toggle-camera', {
              meetingId,
              enabled: true,
            })
          }
        }
      }
    } catch (err) {
      setError('Failed to toggle video')
    }
  }

  // Toggle audio
  const toggleAudio = async () => {
    try {
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled
          setIsAudioEnabled(audioTrack.enabled)

          if (socketRef.current) {
            socketRef.current.emit('video:toggle-mic', {
              meetingId,
              enabled: audioTrack.enabled,
            })
          }
        }
      }
    } catch (err) {
      setError('Failed to toggle audio')
    }
  }

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      })

      screenStreamRef.current = screenStream
      setScreenStream(screenStream)
      setIsScreenSharing(true)

      if (socketRef.current) {
        socketRef.current.emit('video:start-screen-share', { meetingId })
      }

      // Handle stop sharing
      screenStream.getTracks()[0].onended = () => {
        stopScreenShare()
      }
    } catch (err) {
      if ((err as any).name !== 'NotAllowedError') {
        setError('Failed to start screen sharing')
      }
    }
  }

  // Stop screen sharing
  const stopScreenShare = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
        screenStreamRef.current = null
        setScreenStream(null)
        setIsScreenSharing(false)

        if (socketRef.current) {
          socketRef.current.emit('video:stop-screen-share', { meetingId })
        }
      }
    } catch (err) {
      console.error('Stop screen share error:', err)
    }
  }

  // Send chat message
  const sendChatMessage = (content: string) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit('video:chat-message', { meetingId, content })
    }
  }

  // Raise hand
  const raiseHand = () => {
    if (socketRef.current) {
      socketRef.current.emit('video:raise-hand', { meetingId })
    }
  }

  // Lower hand
  const lowerHand = () => {
    if (socketRef.current) {
      socketRef.current.emit('video:lower-hand', { meetingId })
    }
  }

  return {
    socket: socketRef.current,
    participants,
    localStream,
    screenStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    error,
    joinVideoCall,
    leaveVideoCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    sendChatMessage,
    raiseHand,
    lowerHand,
  }
}
