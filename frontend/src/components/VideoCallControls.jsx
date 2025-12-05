import React, { useState } from 'react'
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
  LogOut
} from 'lucide-react'

export default function VideoCallControls({ onEndCall, meetingTitle }) {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const toggleMic = () => setIsMicOn(!isMicOn)
  const toggleVideo = () => setIsVideoOn(!isVideoOn)
  const toggleHand = () => setIsHandRaised(!isHandRaised)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/50 border-t border-slate-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Meeting Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-foreground font-medium">REC</span>
            <span className="text-sm text-muted-foreground ml-4">{meetingTitle}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            00:45:32
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
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
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
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
      </div>
    </div>
  )
}
