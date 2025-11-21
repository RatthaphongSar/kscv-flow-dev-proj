// frontend/src/components/class/ClassAnnouncements.tsx
import { useEffect, useState } from 'react';
import { AlertCircle, Plus, Trash2, Edit2, Bell } from 'lucide-react';
import classApi from '../../api/classApi';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy?: {
    id: string;
    username: string;
  };
}

interface ClassAnnouncementsProps {
  classId: string | null;
  userRole?: string;
}

export default function ClassAnnouncements({
  classId,
  userRole,
}: ClassAnnouncementsProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (classId) {
      loadAnnouncements();
    }
  }, [classId]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getAnnouncements(classId!);
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // Update existing - note: backend may not support PUT, so we create a new one
        await classApi.createAnnouncement(classId!, formData);
      } else {
        await classApi.createAnnouncement(classId!, formData);
      }
      setFormData({ title: '', content: '' });
      setShowForm(false);
      setEditingId(null);
      await loadAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
      alert('Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      // Note: Backend may not have delete endpoint for announcements
      // This is a placeholder
      await loadAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-100">Announcements</h2>
        </div>
        {userRole === 'TEACHER' && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', content: '' });
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition"
          >
            <Plus size={16} />
            New Announcement
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && userRole === 'TEACHER' && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-4 rounded-lg bg-[#020617] border border-violet-500/30"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Announcement content"
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ title: '', content: '' });
              }}
              className="px-4 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No announcements yet
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 rounded-lg bg-[#020617] border border-[#1f2937] hover:border-[#374151] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-100 mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap break-words">
                    {announcement.content}
                  </p>
                  <div className="text-xs text-gray-500">
                    Posted on{' '}
                    {format(new Date(announcement.createdAt), 'dd MMM yyyy HH:mm', {
                      locale: th,
                    })}
                    {announcement.createdBy && ` by ${announcement.createdBy.username}`}
                  </div>
                </div>

                {userRole === 'TEACHER' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-violet-400 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
