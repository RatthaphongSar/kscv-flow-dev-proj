// frontend/src/pages/MeetingImproved.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Phone,
  Plus,
  Search,
  ChevronRight,
  Loader,
  Lock,
} from 'lucide-react'
import classApi from '../api/classApi'

// Helper: format datetime
function formatDateTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper: get meeting status color
function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'scheduled':
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export function MeetingImproved() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState([])
  const [filteredMeetings, setFilteredMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Load meetings (only after auth is ready)
  useEffect(() => {
    // Don't load until auth is ready and user is available
    if (authLoading) return
    
    const loadMeetings = async () => {
      try {
        setLoading(true)
        const data = await classApi.listMeetings()
        setMeetings(data || [])
      } catch (err) {
        console.error('Error loading meetings:', err)
        setError('Failed to load meetings')
      } finally {
        setLoading(false)
      }
    }

    loadMeetings()
  }, [authLoading])

  // Filter meetings
  useEffect(() => {
    let filtered = meetings

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
      )
    }

    setFilteredMeetings(filtered)
  }, [meetings, searchQuery, statusFilter])

  // Handle join meeting
  const handleJoinMeeting = async (meetingId) => {
    try {
      // Start video session and navigate to video call page
      navigate(`/video-call/${meetingId}`)
    } catch (err) {
      console.error('Error joining meeting:', err)
      setError('Failed to join meeting')
    }
  }

  // Handle create meeting (teacher only)
  const handleCreateMeeting = () => {
    navigate('/create-meeting')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600">{authLoading ? 'Authenticating...' : 'Loading meetings...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
              <p className="text-gray-600 mt-1">Manage your classes and video conferences</p>
            </div>
            {user?.role === 'teacher' || user?.role === 'TEACHER' ? (
              <button
                onClick={handleCreateMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Create Meeting
              </button>
            ) : (
              <div
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                title="Only teachers can create meetings"
              >
                <Lock size={20} />
                Create Meeting
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'scheduled', 'active', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <Video className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No meetings found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Create a new meeting to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left: Meeting Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            meeting.status
                          )}`}
                        >
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                      </div>

                      {meeting.description && (
                        <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                      )}

                      {/* Meeting Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={18} className="text-blue-600" />
                          <span>{formatDateTime(meeting.startTime)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={18} className="text-green-600" />
                          <span>
                            {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(meeting.endTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Video size={18} className="text-purple-600" />
                          <span>{meeting.type === 'online' ? meeting.platform || 'Online' : 'On-site'}</span>
                        </div>

                        {meeting.type === 'onsite' && meeting.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={18} className="text-red-600" />
                            <span>{meeting.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={18} className="text-blue-600" />
                          <span>Teacher: {meeting.teacher?.username || 'Unknown'}</span>
                        </div>

                        {meeting.capacity && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users size={18} className="text-gray-600" />
                            <span>Capacity: {meeting.capacity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      {meeting.status === 'active' && (
                        <button
                          onClick={() => handleJoinMeeting(meeting.id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition whitespace-nowrap"
                        >
                          <Phone size={18} />
                          Join Now
                        </button>
                      )}
                      {meeting.status === 'scheduled' && (user?.role === 'teacher' || user?.role === 'TEACHER') && (
                        <button
                          onClick={() => handleJoinMeeting(meeting.id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition whitespace-nowrap"
                        >
                          <Video size={18} />
                          Start Meeting
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/meetings/${meeting.id}`)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition whitespace-nowrap"
                      >
                        Details
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingImproved
