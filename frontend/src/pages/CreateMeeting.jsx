import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import CustomSelect from '../components/CustomSelect'
import { Calendar, Clock, Users, AlertCircle, Loader } from 'lucide-react'
import classApi from '../api/classApi'
import { useI18n } from '../context/I18nContext'

export default function CreateMeeting() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    description: '',
    type: 'online', // online | onsite
    platform: 'zoom', // zoom | teams | meet | internal
    location: '',
    startTime: '',
    endTime: '',
    capacity: 30,
  })

  // Check if user is teacher
  useEffect(() => {
    if (user && user.role !== 'teacher' && user.role !== 'TEACHER') {
      navigate('/meeting')
      return
    }

    const loadClasses = async () => {
      try {
        setLoading(true)
        const data = await classApi.getClasses()
        setClasses(data || [])
      } catch (err) {
        console.error('Error loading classes:', err)
        setError('Failed to load classes')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.classId || !formData.title || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields')
      return
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Convert datetime-local to ISO8601 format
      const startTime = new Date(formData.startTime).toISOString()
      const endTime = new Date(formData.endTime).toISOString()

      // Call API to create meeting
      const response = await classApi.createMeeting({
        ...formData,
        startTime,
        endTime,
      })

      if (response?.id) {
        navigate(`/meeting?success=created&id=${response.id}`)
      } else {
        setError('Failed to create meeting')
      }
    } catch (err) {
      console.error('Error creating meeting:', err)
      setError(err.message || 'Failed to create meeting')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageShell title="Create Meeting" subtitle="สร้างการประชุมใหม่">
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin mr-2 text-primary" size={24} />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Create Meeting"
      subtitle="สร้างการประชุมออนไลน์ใหม่"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
              <div className="text-destructive">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Class */}
            <CustomSelect
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              label="Class"
              required
              placeholder="Select a class"
              options={classes.map(cls => ({
                value: cls.id,
                label: `${cls.name} (${cls.code})`
              }))}
            />

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meeting Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Lecture 5 - Advanced Topics"
                required
                className="w-full px-4 py-2 border border-input bg-background text-foreground placeholder-muted-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional details..."
                rows="4"
                className="w-full px-4 py-2 border border-input bg-background text-foreground placeholder-muted-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Type and Platform */}
            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Meeting Type"
                options={[
                  { value: 'online', label: 'Online' },
                  { value: 'onsite', label: 'On-site' }
                ]}
              />

              <CustomSelect
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                label="Platform"
                options={[
                  { value: 'zoom', label: 'Zoom' },
                  { value: 'teams', label: 'Microsoft Teams' },
                  { value: 'meet', label: 'Google Meet' },
                  { value: 'internal', label: 'Internal' }
                ]}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location (for hybrid meetings)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Room 101, Building A"
                className="w-full px-4 py-2 border border-input bg-background text-foreground placeholder-muted-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Start and End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Participants
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground py-2 rounded-lg font-medium transition"
              >
                {submitting ? 'Creating...' : 'Create Meeting'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/meeting')}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
