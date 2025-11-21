// frontend/src/components/class/ClassManagement.tsx
import { useEffect, useState } from 'react';
import { Settings, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import classApi from '../../api/classApi';

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  section?: string;
  credits?: number;
  semester?: string;
  room?: string;
  capacity?: number;
  teacherId?: string;
}

interface ClassManagementProps {
  classId?: string | null;
  userRole?: string;
  onClassSelect?: (classId: string) => void;
  onClassDelete?: (classId: string) => void;
}

export default function ClassManagement({
  classId: _classId,
  userRole,
  onClassSelect,
  onClassDelete,
}: ClassManagementProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    section: '',
    credits: '3',
    semester: 'Fall',
    room: '',
    capacity: '40',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getClasses();
      setClasses(data || []);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // Update existing class
        await classApi.updateClass(editingId, {
          code: formData.code,
          name: formData.name,
          section: formData.section,
          credits: parseFloat(formData.credits),
          semester: formData.semester,
          room: formData.room,
          capacity: parseInt(formData.capacity),
        } as any);
      } else {
        // Create new class
        await classApi.createClass({
          code: formData.code,
          name: formData.name,
          section: formData.section,
          credits: parseFloat(formData.credits),
          semester: formData.semester,
          room: formData.room,
          capacity: parseInt(formData.capacity),
        });
      }
      setFormData({
        code: '',
        name: '',
        section: '',
        credits: '3',
        semester: 'Fall',
        room: '',
        capacity: '40',
      });
      setShowForm(false);
      setEditingId(null);
      await loadClasses();
    } catch (err: any) {
      console.error('Error saving class:', err);
      alert(err.response?.data?.error || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cls: ClassInfo) => {
    setFormData({
      code: cls.code,
      name: cls.name,
      section: cls.section || '',
      credits: cls.credits?.toString() || '3',
      semester: cls.semester || 'Fall',
      room: cls.room || '',
      capacity: cls.capacity?.toString() || '40',
    });
    setEditingId(cls.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await classApi.deleteClass(id);
      // Remove from local state immediately
      setClasses(classes.filter(c => c.id !== id));
      // Notify parent component
      onClassDelete?.(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting class:', err);
      alert(err.response?.data?.error || 'Failed to delete class');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      section: '',
      credits: '3',
      semester: 'Fall',
      room: '',
      capacity: '40',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading classes...</div>
      </div>
    );
  }

  if (userRole !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="text-sm text-gray-400">
          <p className="font-medium">This feature is only available for teachers</p>
          <p className="text-xs text-gray-500 mt-1">Only teacher accounts can create and manage classes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-100">Class Management</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              code: '',
              name: '',
              section: '',
              credits: '3',
              semester: 'Fall',
              room: '',
              capacity: '40',
            });
          }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition"
        >
          <Plus size={16} />
          New Class
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 rounded-lg bg-[#020617] border border-violet-500/30"
        >
          <h3 className="font-semibold text-gray-100 mb-4">
            {editingId ? 'Edit Class' : 'Create New Class'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Class Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CS-201"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Web Development"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., Section 1"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Credits */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                min="1"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-violet-500 transition"
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 302"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Class Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                min="1"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Classes List */}
      <div className="space-y-3">
        {classes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-[#020617] border border-[#1f2937] rounded-lg">
            <p className="font-medium mb-1">No classes yet</p>
            <p className="text-xs text-gray-500">Click "New Class" to create your first class</p>
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="p-4 rounded-lg bg-[#020617] border border-[#1f2937] hover:border-[#374151] transition cursor-pointer"
              onClick={() => onClassSelect?.(cls.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-100">{cls.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                      {cls.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
                    {cls.section && <div>Section: {cls.section}</div>}
                    {cls.credits && <div>Credits: {cls.credits}</div>}
                    {cls.semester && <div>Semester: {cls.semester}</div>}
                    {cls.room && <div>Room: {cls.room}</div>}
                    {cls.capacity && <div>Capacity: {cls.capacity}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(cls);
                    }}
                    className="p-2 text-gray-400 hover:text-violet-400 transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(cls.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-300 text-xs">
        <p className="font-medium mb-1">💡 Tip:</p>
        <p>Click on a class to manage assignments, students, announcements, and settings.</p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#020617] border border-red-500/30 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Delete Class?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this class? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
