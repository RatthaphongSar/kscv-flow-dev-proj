// frontend/src/components/class/ClassAssignmentCreator.tsx
import { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import classApi from '../../api/classApi';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  maxScore: number;
  dueDate: string;
  assignmentType: string;
}

interface ClassAssignmentCreatorProps {
  classId: string | null;
  userRole?: string;
}

export default function ClassAssignmentCreator({
  classId,
  userRole,
}: ClassAssignmentCreatorProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: '100',
    dueDate: '',
    assignmentType: 'homework',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (classId) {
      loadAssignments();
    }
  }, [classId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getAssignments(classId!);
      setAssignments(data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // Update existing assignment
        await classApi.updateAssignment(classId!, editingId, {
          title: formData.title,
          description: formData.description,
          maxScore: parseFloat(formData.maxScore),
          dueDate: formData.dueDate,
          assignmentType: formData.assignmentType,
        } as any);
      } else {
        // Create new assignment
        await classApi.createAssignment(classId!, {
          title: formData.title,
          description: formData.description,
          maxScore: parseFloat(formData.maxScore),
          dueDate: formData.dueDate,
          assignmentType: formData.assignmentType,
        });
      }
      setFormData({
        title: '',
        description: '',
        maxScore: '100',
        dueDate: '',
        assignmentType: 'homework',
      });
      setShowForm(false);
      setEditingId(null);
      await loadAssignments();
    } catch (err: any) {
      console.error('Error saving assignment:', err);
      alert(err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      maxScore: assignment.maxScore.toString(),
      dueDate: assignment.dueDate.split('T')[0],
      assignmentType: assignment.assignmentType,
    });
    setEditingId(assignment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await classApi.deleteAssignment(classId!, id);
      await loadAssignments();
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      alert(err.response?.data?.error || 'Failed to delete assignment');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      maxScore: '100',
      dueDate: '',
      assignmentType: 'homework',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'homework':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
      case 'quiz':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40';
      case 'project':
        return 'bg-green-600/20 text-green-300 border-green-500/40';
      case 'exam':
        return 'bg-red-600/20 text-red-300 border-red-500/40';
      default:
        return 'bg-violet-600/20 text-violet-300 border-violet-500/40';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      homework: '📝 Homework',
      quiz: '❓ Quiz',
      project: '🎯 Project',
      exam: '📚 Exam',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading assignments...</div>
      </div>
    );
  }

  if (userRole !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="text-sm text-gray-400">
          <p className="font-medium">This feature is only available for teachers</p>
          <p className="text-xs text-gray-500 mt-1">Only teacher accounts can create assignments</p>
        </div>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="text-sm text-gray-400">
          <p className="font-medium">Please select a class</p>
          <p className="text-xs text-gray-500 mt-1">Choose a class from the Class Management tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-100">Assignment Management</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              maxScore: '100',
              dueDate: '',
              assignmentType: 'homework',
            });
          }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition"
        >
          <Plus size={16} />
          New Assignment
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
            {editingId ? 'Edit Assignment' : 'Create New Assignment'}
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 3 Reading & Exercises"
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide instructions and requirements for the assignment..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition resize-none"
              />
            </div>

            {/* Type and Max Score Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Assignment Type *
                </label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="homework">Homework</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              {/* Max Score */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Total Points *
                </label>
                <input
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Due Date *
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Submission Format Info */}
            <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-300 text-xs">
              <p className="font-medium mb-1">Submission Format:</p>
              <p>Students can submit via file upload (PDF, DOCX, images, etc.) or text input.</p>
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

      {/* Assignments List */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-[#020617] border border-[#1f2937] rounded-lg">
            <p className="font-medium mb-1">No assignments yet</p>
            <p className="text-xs text-gray-500">Click "New Assignment" to create your first assignment</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now;

            return (
              <div
                key={assignment.id}
                className={`p-4 rounded-lg border transition ${
                  isOverdue
                    ? 'bg-red-600/5 border-red-500/30'
                    : 'bg-[#020617] border-[#1f2937] hover:border-[#374151]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-100">{assignment.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(assignment.assignmentType)}`}>
                        {getTypeLabel(assignment.assignmentType)}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/40">
                          Overdue
                        </span>
                      )}
                    </div>

                    {assignment.description && (
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        Points: <span className="text-gray-200 font-medium">{assignment.maxScore}</span>
                      </div>
                      <div>
                        Due:{' '}
                        <span className="text-gray-200 font-medium">
                          {dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="p-2 text-gray-400 hover:text-violet-400 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      {assignments.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-[#020617] border border-[#1f2937]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-500">{assignments.length}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {assignments.filter((a) => a.assignmentType === 'homework').length}
              </div>
              <div className="text-xs text-gray-400">Homework</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {assignments.filter((a) => a.assignmentType === 'quiz').length}
              </div>
              <div className="text-xs text-gray-400">Quizzes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {assignments.filter((a) => a.assignmentType === 'project').length}
              </div>
              <div className="text-xs text-gray-400">Projects</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
