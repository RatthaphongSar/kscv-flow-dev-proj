import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import classApi from '../../api/classApi';
import SimpleConfirmModal from '../SimpleConfirmModal';

interface AttendanceSession {
  id: string;
  subject: string;
  type: 'lesson' | 'midterm' | 'final' | 'quiz' | 'collection';
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    attendances: number;
  };
}

interface AttendanceSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSessionsUpdated?: () => void;
}

const typeLabels: { [key: string]: string } = {
  lesson: 'เรียน',
  midterm: 'สอบกลางภาค',
  final: 'สอบปลายภาค',
  quiz: 'สอบย่อย',
  collection: 'เก็บคะแนน',
};

const typeColors: { [key: string]: string } = {
  lesson: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  midterm: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  final: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  quiz: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  collection: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
};

export default function AttendanceSessionModal({
  isOpen,
  onClose,
  classId,
  onSessionsUpdated,
}: AttendanceSessionModalProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    subject: string;
    type: 'lesson' | 'midterm' | 'final' | 'quiz' | 'collection';
    startDate: string;
    endDate: string;
    description: string;
  }>({
    subject: '',
    type: 'lesson',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, classId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAttendanceSessions(classId);
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.type) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await classApi.updateAttendanceSession(classId, editingId, {
          subject: formData.subject,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          description: formData.description,
        });
      } else {
        await classApi.createAttendanceSession(classId, {
          subject: formData.subject,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          description: formData.description || undefined,
        });
      }

      await loadSessions();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        subject: '',
        type: 'lesson',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
      });
      onSessionsUpdated?.();
    } catch (err) {
      console.error('Error saving session:', err);
      alert('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (session: AttendanceSession) => {
    setFormData({
      subject: session.subject,
      type: session.type,
      startDate: session.startDate.split('T')[0],
      endDate: session.endDate?.split('T')[0] || '',
      description: session.description || '',
    });
    setEditingId(session.id);
    setShowForm(true);
  };

  const handleDelete = (sessionId: string) => {
    setDeleteTargetId(sessionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await classApi.deleteAttendanceSession(classId, deleteTargetId);
      await loadSessions();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      onSessionsUpdated?.();
    } catch (err) {
      console.error('Error deleting session:', err);
      throw err;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">การเข้าเรียน</h2>
              <p className="text-xs text-gray-400 mt-1">ตั้งค่าช่วงเรียน สอบ หรือเก็บคะแนน</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg bg-[#020617] border border-[#1e293b]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      ชื่อหัวข้อ *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="เช่น สอบกลางภาค"
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      ประเภท *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="lesson">เรียน</option>
                      <option value="midterm">สอบกลางภาค</option>
                      <option value="final">สอบปลายภาค</option>
                      <option value="quiz">สอบย่อย</option>
                      <option value="collection">เก็บคะแนน</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      วันเริ่มต้น *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      วันสิ้นสุด (ไม่บังคับ)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    หมายเหตุ (ไม่บังคับ)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="เพิ่มหมายเหตุ..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
                  >
                    {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        subject: '',
                        type: 'lesson',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: '',
                        description: '',
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 font-medium transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}

            {/* Sessions List */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">กำลังโหลด...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">ยังไม่มีการเข้าเรียน</div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg bg-[#020617] border border-[#1e293b] hover:border-[#374151] transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[session.type]}`}>
                            {typeLabels[session.type]}
                          </span>
                          <h3 className="font-semibold text-gray-100">{session.subject}</h3>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1">
                          {session.createdAt && (
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>
                                สร้างเมื่อ: {(() => {
                                  try {
                                    const date = new Date(session.createdAt);
                                    if (isNaN(date.getTime())) return 'Invalid Date';
                                    return date.toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    }) + ' ' + date.toLocaleTimeString('th-TH', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    });
                                  } catch {
                                    return 'Invalid Date';
                                  }
                                })()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>
                              ช่วงเวลา: {(() => {
                                try {
                                  const startDate = new Date(session.startDate);
                                  if (isNaN(startDate.getTime())) return 'Invalid Date';
                                  let result = startDate.toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  });
                                  if (session.endDate) {
                                    const endDate = new Date(session.endDate);
                                    if (!isNaN(endDate.getTime())) {
                                      result += ` ถึง ${endDate.toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                      })}`;
                                    }
                                  }
                                  return result;
                                } catch {
                                  return 'Invalid Date';
                                }
                              })()}
                            </span>
                          </div>
                          {session.description && (
                            <div className="text-gray-500">{session.description}</div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-blue-400">
                          นักเรียนเข้าแล้ว: {session._count?.attendances || 0} คน
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition"
                          title="แก้ไข"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition"
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#1e293b] p-4 flex gap-2">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                <Plus size={16} />
                เพิ่มการเข้าเรียน
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 font-medium transition"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <SimpleConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ลบการเข้าเรียน"
        message="คุณแน่ใจว่าต้องการลบการเข้าเรียนนี้หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        isDanger
      />
    </>
  );
}
