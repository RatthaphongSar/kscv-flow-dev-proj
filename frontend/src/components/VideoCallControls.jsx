import React, { useState, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageCircle,
  Settings,
  PhoneOff,
  Share2
} from 'lucide-react'

export default function VideoCallControls({ onEndCall, meetingTitle, isNavbar = false }) {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  const toggleMic = () => setIsMicOn(!isMicOn)
  const toggleVideo = () => setIsVideoOn(!isVideoOn)
  const toggleHand = () => setIsHandRaised(!isHandRaised)

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const startTime = new Date()
      startTime.setHours(0, 0, 0)
      const diff = now - startTime
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setElapsedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Navbar Mode - Horizontal controls in header
  if (isNavbar) {
    return (
      <div className="flex items-center gap-3">
        {/* Call Duration */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-foreground">{elapsedTime}</span>
        </div>

        {/* Microphone */}
        <button
          onClick={toggleMic}
          className={`p-2.5 rounded-full transition-all ${
            isMicOn
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleVideo}
          className={`p-2.5 rounded-full transition-all ${
            isVideoOn
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        {/* Share Screen */}
        <button
          className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all"
          title="Share screen"
        >
          <Share2 size={18} />
        </button>

        {/* Hand Raise */}
        <button
          onClick={toggleHand}
          className={`p-2.5 rounded-full transition-all ${
            isHandRaised
              ? 'bg-amber-600 hover:bg-amber-700 text-white animate-bounce'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand size={18} />
        </button>

        {/* Chat */}
        <button
          className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all"
          title="Open chat"
        >
          <MessageCircle size={18} />
        </button>

        {/* Settings */}
        <button
          className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="p-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-red-600/50"
          title="End call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    )
  }

  // Floating panel mode (not needed in navbar version)
  return null
}
