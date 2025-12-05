// frontend/src/components/VideoConferenceRoom.tsx
import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Eye,
  Hand,
  MessageCircle,
  Users,
  X,
  Send,
  Phone,
} from 'lucide-react'
import { useVideoCall } from '../hooks/useVideoCall'

interface VideoConferenceRoomProps {
  meetingId: string
  sessionId: string
  userName: string
  onLeave: () => void
}

export function VideoConferenceRoom({
  meetingId,
  sessionId,
  userName,
  onLeave,
}: VideoConferenceRoomProps) {
  const {
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
  } = useVideoCall(meetingId)

  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [handsRaised, setHandsRaised] = useState<Set<string>>(new Set())
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)

  // Initialize video call
  useEffect(() => {
    joinVideoCall(meetingId, sessionId)
    return () => {
      leaveVideoCall()
    }
  }, [meetingId, sessionId])

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set screen share stream
  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream
    }
  }, [screenStream])

  // Update call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  // Handle chat message
  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput)
      setChatMessages(prev => [
        ...prev,
        { userId: 'you', username: userName, content: chatInput, timestamp: new Date() },
      ])
      setChatInput('')
    }
  }

  // Handle leave
  const handleLeave = async () => {
    await leaveVideoCall()
    onLeave()
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 p-4 bg-gray-950 overflow-auto pt-20">
          {isScreenSharing ? (
            // Screen share view
            <div className="grid grid-cols-4 gap-4 h-full">
              <div className="col-span-3 bg-black rounded-lg overflow-hidden">
                <video
                  ref={screenShareRef}
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Participant thumbnails on right */}
              <div className="flex flex-col gap-2 overflow-y-auto">
                {/* Own video */}
                <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    {userName} (You)
                  </div>
                </div>

                {/* Other participants */}
                {participants.map(participant => (
                  <div key={participant.userId} className="bg-gray-800 rounded-lg overflow-hidden aspect-video relative">
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Users size={24} className="text-gray-500" />
                    </div>
                    <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                      {participant.username}
                    </div>
                    {!participant.videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <VideoOff size={32} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Grid view
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full auto-rows-max">
              {/* Own video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  {userName} (You)
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>

              {/* Participant videos */}
              {participants.map(participant => (
                <div
                  key={participant.userId}
                  className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
                >
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Users size={32} className="text-gray-500" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                    {participant.username}
                  </div>
                  {!participant.videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                      <VideoOff size={40} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Control Bar - Fixed at Top */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {/* Left: Timer */}
            <div className="text-sm font-semibold text-gray-300">
              Call duration: {formatDuration(callDuration)}
            </div>

            {/* Center: Controls */}
            <div className="flex gap-3 items-center">
              {/* Microphone */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition ${
                  isAudioEnabled
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              {/* Camera */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition ${
                  isVideoEnabled
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isVideoEnabled ? 'Stop video' : 'Start video'}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              {/* Screen Share */}
              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={`p-3 rounded-full transition ${
                  isScreenSharing
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                {isScreenSharing ? <Eye size={20} /> : <Share2 size={20} />}
              </button>

              {/* Raise Hand */}
              <button
                onClick={() => {
                  if (handsRaised.has('you')) {
                    lowerHand()
                    setHandsRaised(prev => {
                      const newSet = new Set(prev)
                      newSet.delete('you')
                      return newSet
                    })
                  } else {
                    raiseHand()
                    setHandsRaised(prev => new Set(prev).add('you'))
                  }
                }}
                className={`p-3 rounded-full transition ${
                  handsRaised.has('you')
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Raise hand"
              >
                <Hand size={20} />
              </button>

              {/* Leave */}
              <button
                onClick={handleLeave}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition"
                title="Leave call"
              >
                <Phone size={20} />
              </button>
            </div>

            {/* Right: Panels */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <Users size={20} />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 text-sm text-red-400 bg-red-900 bg-opacity-30 p-2 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Chat</h3>
            <button onClick={() => setShowChat(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx}>
                <div className="text-xs text-gray-400">
                  {msg.username} • {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-100">{msg.content}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendChat}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Participants ({participants.length + 1})</h3>
            <button onClick={() => setShowParticipants(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* You */}
            <div className="bg-gray-700 rounded p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{userName}</div>
                  <div className="text-xs text-gray-400">You</div>
                </div>
                <div className="flex gap-1">
                  {isAudioEnabled ? (
                    <Mic size={16} className="text-green-400" />
                  ) : (
                    <MicOff size={16} className="text-red-400" />
                  )}
                  {isVideoEnabled ? (
                    <Video size={16} className="text-green-400" />
                  ) : (
                    <VideoOff size={16} className="text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Other participants */}
            {participants.map(participant => (
              <div key={participant.userId} className="bg-gray-700 rounded p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{participant.username}</div>
                  <div className="flex gap-1">
                    {participant.audioEnabled ? (
                      <Mic size={16} className="text-green-400" />
                    ) : (
                      <MicOff size={16} className="text-red-400" />
                    )}
                    {participant.videoEnabled ? (
                      <Video size={16} className="text-green-400" />
                    ) : (
                      <VideoOff size={16} className="text-red-400" />
                    )}
                    {participant.screenShared && (
                      <Share2 size={16} className="text-blue-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoConferenceRoom
