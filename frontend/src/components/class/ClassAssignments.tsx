// frontend/src/components/class/ClassAssignments.tsx
import { useEffect, useState } from 'react';
import { Assignment } from '../../types/class.types';
import classApi from '../../api/classApi';
import { FileText, Calendar, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';
import SimpleConfirmModal from '../SimpleConfirmModal';

interface ClassAssignmentsProps {
  classId: string | null;
  userRole?: string;
}

export default function ClassAssignments({ classId, userRole }: ClassAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: '100',
    dueDate: '',
    assignmentType: 'homework',
  });

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
      setAssignments(data);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classApi.createAssignment(classId!, {
        title: formData.title,
        description: formData.description,
        maxScore: parseFloat(formData.maxScore),
        dueDate: formData.dueDate,
        assignmentType: formData.assignmentType,
      });
      setFormData({
        title: '',
        description: '',
        maxScore: '100',
        dueDate: '',
        assignmentType: 'homework',
      });
      setShowForm(false);
      await loadAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    // Prevent double-click
    if (isDeleting) return;
    
    setDeleteTargetId(assignmentId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await classApi.deleteAssignment(classId!, deleteTargetId);
      console.log('Assignment deleted successfully:', deleteTargetId);
      
      // Remove from state immediately
      setAssignments(prev => {
        const filtered = prev.filter(a => a.id !== deleteTargetId);
        console.log('After delete, remaining assignments:', filtered);
        return filtered;
      });
      
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setError(null);
      
      // Also refresh from server to be sure
      const updatedAssignments = (await classApi.getAssignments(classId!)) || [];
      console.log('Refreshed from server:', updatedAssignments);
      setAssignments(updatedAssignments);
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment');
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (now > dueDate) {
      return <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">Overdue</span>;
    }
    return <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Active</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Teacher: Create Assignment Button */}
      {userRole === 'TEACHER' && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Assignments</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && userRole === 'TEACHER' && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 dark:bg-slate-700 p-5 rounded-lg border border-slate-300 dark:border-slate-600 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
              placeholder="Assignment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
              placeholder="Assignment details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Max Score
              </label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Type
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentType: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
              >
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Due Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Assignments List */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No assignments yet
          </p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h4>
                    {assignment.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                </div>
                {/* Delete button for teachers */}
                {userRole === 'TEACHER' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col gap-2 flex-1">
                  {/* ครูสั่งงาน (Assigned At) */}
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      สั่งงาน: {formatDateTime(assignment.assignedAt)}
                    </span>
                  </div>

                  {/* เดทไลน์ (Due Date) */}
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      เดทไลน์: {formatDate(assignment.dueDate)} ({getDaysRemaining(assignment.dueDate)} วัน)
                    </span>
                    <span>คะแนนเต็ม: {assignment.maxScore}</span>
                    <span className="capitalize text-xs bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                      {assignment.assignmentType}
                    </span>
                  </div>
                </div>
                {getStatusBadge(assignment)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <SimpleConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
