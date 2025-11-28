// frontend/src/pages/VideoCall.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { VideoConferenceRoom } from '../components/VideoConferenceRoom'
import classApi from '../api/classApi'
import { Loader } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  sessionId?: string
}

export function VideoCall() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [videoSession, setVideoSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load meeting and start video session
  useEffect(() => {
    const initVideoCall = async () => {
      try {
        if (!meetingId) {
          setError('No meeting ID provided')
          return
        }

        // Get meeting details
        const meetingData = await classApi.getMeeting(meetingId)
        if (!meetingData) {
          setError('Meeting not found')
          return
        }

        setMeeting({
          id: meetingData.id,
          title: meetingData.title,
        })

        // Start video session
        try {
          const session = await classApi.startVideoSession(meetingId)
          if (session) {
            setVideoSession(session)
          }
        } catch (err) {
          // Video session might already exist, continue anyway
          console.log('Could not start new session, using existing one')
        }

        setLoading(false)
      } catch (err) {
        console.error('Error initializing video call:', err)
        setError('Failed to initialize video call')
        setLoading(false)
      }
    }

    initVideoCall()
  }, [meetingId])

  const handleLeaveCall = async () => {
    try {
      if (videoSession) {
        await classApi.endVideoSession(meetingId!, videoSession.id)
      }
      navigate(-1)
    } catch (err) {
      console.error('Error leaving call:', err)
      navigate(-1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-white">Starting video call...</p>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load meeting'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <VideoConferenceRoom
      meetingId={meeting.id}
      sessionId={videoSession?.id || 'default-session'}
      userName={user?.username || 'User'}
      onLeave={handleLeaveCall}
    />
  )
}

export default VideoCall
