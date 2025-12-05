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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-40">
      {/* Video Feed Area */}
      <div className="relative w-full h-screen bg-slate-900 border-b border-slate-700/50">
        {/* Main Video Window */}
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="relative">
            <img
              src="https://via.placeholder.com/800x600?text=Video+Feed"
              alt="Video feed"
              className="w-96 h-72 rounded-lg object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded text-xs text-foreground backdrop-blur">
              {user?.username || 'You'}
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        {participants.length > 0 && (
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur rounded-lg p-4 border border-slate-700/50 max-w-xs">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
              <Users size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {participants.length} Participant{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/50 rounded text-xs"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-foreground">{participant.username || participant.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Info */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur rounded-lg p-4 border border-slate-700/50 max-w-sm">
          <h2 className="text-lg font-bold text-foreground mb-2">{meeting?.title}</h2>
          <p className="text-xs text-muted-foreground">{meeting?.description}</p>
          {meeting?.class && (
            <p className="text-xs text-primary mt-2">{meeting.class.name}</p>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <VideoCallControls
        onEndCall={handleEndCall}
        meetingTitle={meeting?.title}
      />
    </div>
  )
}
