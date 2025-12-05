import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import VideoCallControls from '../components/VideoCallControls'
import classApi from '../api/classApi'
import { Users, Loader, AlertCircle } from 'lucide-react'

export default function MeetingRoom() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [meeting, setMeeting] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [speakingUser, setSpeakingUser] = useState(null)

  useEffect(() => {
    const loadMeetingData = async () => {
      try {
        setLoading(true)
        const meetingData = await classApi.getMeeting(meetingId)
        const participantsData = await classApi.getMeetingParticipants(meetingId)
        
        setMeeting(meetingData)
        setParticipants(participantsData || [])
      } catch (err) {
        console.error('Error loading meeting:', err)
        setError(err.message || 'Failed to load meeting')
      } finally {
        setLoading(false)
      }
    }

    loadMeetingData()
  }, [meetingId])

  // Simulate speaking detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (participants.length > 0) {
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
        if (Math.random() > 0.6) {
          setSpeakingUser(randomParticipant)
          setTimeout(() => setSpeakingUser(null), 1000)
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [participants])

  const handleEndCall = async () => {
    try {
      await classApi.endMeeting(meetingId)
      navigate('/meeting?success=ended')
    } catch (err) {
      console.error('Error ending meeting:', err)
      setError('Failed to end meeting')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <Loader className="animate-spin mr-2 text-primary inline-block" size={32} />
          <p className="text-foreground mt-4">Loading meeting room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto">
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div className="text-destructive">{error}</div>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Top Navbar with Call Controls */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-4 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-foreground">{meeting?.title}</h2>
            <span className="text-xs text-muted-foreground px-3 py-1 bg-slate-700/50 rounded-full">
              {participants.length + 1} Participants
            </span>
          </div>
          
          {/* Call Controls in Navbar */}
          <VideoCallControls
            onEndCall={handleEndCall}
            meetingTitle={meeting?.title}
            isNavbar={true}
          />
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
        {/* Main Video - Current User */}
        <div className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
          speakingUser?.id === user?.id ? 'border-green-500 shadow-lg shadow-green-500/50' : 'border-slate-700'
        }`}>
          <img
            src="https://via.placeholder.com/400x300?text=You"
            alt="Your video"
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-slate-950/80 px-4 py-2 rounded-lg text-sm text-foreground backdrop-blur">
            {user?.username || 'You'} (You)
          </div>
          {speakingUser?.id === user?.id && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              🎤 Speaking
            </div>
          )}
        </div>

        {/* Participant Videos */}
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
              speakingUser?.id === participant.id ? 'border-green-500 shadow-lg shadow-green-500/50' : 'border-slate-700'
            }`}
          >
            <img
              src={`https://via.placeholder.com/400x300?text=Participant+${index + 1}`}
              alt={`${participant.username || participant.name}'s video`}
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-slate-950/80 px-4 py-2 rounded-lg text-sm text-foreground backdrop-blur">
              {participant.username || participant.name}
            </div>
            {speakingUser?.id === participant.id && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                🎤 Speaking
              </div>
            )}
            {/* Audio indicator animation */}
            {speakingUser?.id === participant.id && (
              <div className="absolute inset-0 border-4 border-green-500 rounded-2xl animate-pulse pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Meeting Info Card - Small, positioned below navbar */}
      {/* Removed - info is now in navbar */}
    </div>
  )
}
