import React, { useState, useEffect } from 'react'
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageCircle,
  Settings,
  LogOut,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function VideoCallControls({ onEndCall, meetingTitle }) {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [speakingUsers, setSpeakingUsers] = useState({})
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  const toggleMic = () => setIsMicOn(!isMicOn)
  const toggleVideo = () => setIsVideoOn(!isVideoOn)
  const toggleHand = () => setIsHandRaised(!isHandRaised)

  // Simulate audio detection - in real app, would use WebRTC audio analysis
  useEffect(() => {
    const interval = setInterval(() => {
      // Random users speaking for demo
      const randomUser = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : null
      if (randomUser !== null) {
        setSpeakingUsers(prev => ({
          ...prev,
          [randomUser]: true
        }))
        setTimeout(() => {
          setSpeakingUsers(prev => ({
            ...prev,
            [randomUser]: false
          }))
        }, 800)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <>
      {/* Floating Control Panel */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16 h-16' : 'w-full max-w-4xl'
      }`}>
        <div className={`bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/50 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-sm transition-all ${
          isCollapsed ? 'p-0' : 'p-6'
        }`}>
          {!isCollapsed ? (
            <>
              {/* Meeting Info */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-foreground font-medium">REC</span>
                  <span className="text-sm text-muted-foreground ml-4">{meetingTitle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground font-mono">
                    {elapsedTime}
                  </div>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Microphone */}
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                    isMicOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-foreground'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isMicOn ? 'Mute' : 'Unmute'}
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                {/* Camera */}
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                    isVideoOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-foreground'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
                >
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                {/* Hand Raise */}
                <button
                  onClick={toggleHand}
                  className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                    isHandRaised
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-foreground'
                  }`}
                  title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                >
                  <Hand size={24} className={isHandRaised ? 'animate-bounce' : ''} />
                </button>

                {/* Chat */}
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                    showChat
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-slate-800 hover:bg-slate-700 text-foreground'
                  }`}
                  title="Chat"
                >
                  <MessageCircle size={24} />
                </button>

                {/* Settings */}
                <button
                  className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-foreground transition-all transform hover:scale-110"
                  title="Settings"
                >
                  <Settings size={24} />
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* End Call */}
                <button
                  onClick={onEndCall}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110 shadow-lg shadow-red-600/50"
                  title="End Call"
                >
                  <PhoneOff size={24} />
                </button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-center gap-6 text-xs flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{isMicOn ? 'Mic On' : 'Mic Off'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{isVideoOn ? 'Camera On' : 'Camera Off'}</span>
                </div>
                {isHandRaised && (
                  <div className="flex items-center gap-2 text-amber-500">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Hand Raised</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full h-full flex items-center justify-center p-2 hover:bg-slate-800 rounded-lg transition text-foreground"
              title="Expand"
            >
              <ChevronUp size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Export speaking users for parent component */}
      {Object.keys(speakingUsers).length > 0 && (
        <div className="fixed top-4 right-4 z-40 text-xs bg-slate-950/80 border border-slate-700/50 rounded-lg p-3 backdrop-blur">
          <div className="flex items-center gap-2 text-amber-500">
            <Volume2 size={16} className="animate-pulse" />
            <span>Speaking: User {Object.keys(speakingUsers).find(k => speakingUsers[k])}</span>
          </div>
        </div>
      )}
    </>
  )
}
