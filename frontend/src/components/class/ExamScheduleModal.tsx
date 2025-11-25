/**
 * ExamScheduleModal.tsx
 * Beautiful modal for displaying and managing exam schedules with dark theme
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import classApi from '../../api/classApi';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface Exam {
  id: string;
  title: string;
  subject?: string;
  date: string;
  room?: string;
  duration?: number;
  createdAt: string;
}

interface ExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string | null;
  className?: string;
}

const ExamScheduleModal: React.FC<ExamScheduleModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
}) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    room: '',
    duration: '120',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && classId) {
      loadExams();
    }
  }, [isOpen, classId]);

  const loadExams = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const data = await classApi.getExams(classId);
      setExams(data || []);
    } catch (err) {
      console.error('Error loading exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const examData = {
        title: formData.title,
        subject: formData.subject,
        date: formData.date,
        room: formData.room,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      };

      if (editingId) {
        await classApi.updateExam(classId!, editingId, examData);
      } else {
        await classApi.createExam(classId!, examData);
      }

      resetForm();
      await loadExams();
    } catch (err: any) {
      console.error('Error saving exam:', err);
      alert(err.response?.data?.error || 'Failed to save exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exam: Exam) => {
    setFormData({
      title: exam.title,
      subject: exam.subject || '',
      date: exam.date.slice(0, 16),
      room: exam.room || '',
      duration: exam.duration?.toString() || '120',
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const exam = exams.find(e => e.id === id);
    setDeleteTargetId(id);
    setDeleteTargetName(exam?.title || 'Exam');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await classApi.deleteExam(classId!, deleteTargetId);
      await loadExams();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      throw err.response?.data?.error || 'Failed to delete exam';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      date: '',
      room: '',
      duration: '120',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937] sticky top-0 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <Calendar className="text-violet-400" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Exam Schedule</h2>
              <p className="text-xs text-gray-400">{className || 'Class'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Add Exam Button */}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                title: '',
                subject: '',
                date: '',
                room: '',
                duration: '120',
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
          >
            <Plus size={16} />
            Add Exam
          </button>

          {/* Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-lg bg-[#020617] border border-violet-500/30"
            >
              <h3 className="font-semibold text-gray-100">
                {editingId ? 'Edit Exam' : 'New Exam'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Midterm Exam"
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g., English"
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Room/Location
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    placeholder="e.g., Room 101"
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Duration */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    min="30"
                    step="30"
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
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
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Exams List */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <AlertCircle className="mx-auto mb-2 text-gray-500" size={32} />
              <p>No exams scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-lg bg-[#020617] border border-[#1f2937] hover:border-violet-500/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-100 mb-2">
                        {exam.title}
                        {exam.subject && (
                          <span className="text-sm font-normal text-gray-400 ml-2">
                            ({exam.subject})
                          </span>
                        )}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-violet-400" />
                          <span>{formatDate(exam.date)}</span>
                          {isUpcoming(exam.date) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-300 border border-green-500/40">
                              Upcoming
                            </span>
                          )}
                        </div>

                        {exam.room && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-violet-400" />
                            <span>{exam.room}</span>
                          </div>
                        )}

                        {exam.duration && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-violet-400" />
                            <span>{exam.duration} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="p-2 text-gray-400 hover:text-violet-400 transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete this exam?`}
        itemName={deleteTargetName}
        resourceType="exam"
      />
    </div>
  );
};

export default ExamScheduleModal;
