/**
 * GradeSubmissionModal.tsx
 * Modal for grading assignment submissions
 */

import React, { useState } from 'react';
import { X, Send, RefreshCw } from 'lucide-react';
import classApi from '../../api/classApi';

interface StudentSubmission {
  id: string;
  studentId: string;
  status: string;
  submittedAt: string;
  fileUrl?: string;
  content?: string;
  grade?: number;
  feedback?: string;
  student: {
    id: string;
    username: string;
    email: string;
  };
}

interface GradeSubmissionModalProps {
  isOpen: boolean;
  submission: StudentSubmission | null;
  maxScore: number;
  assignmentId: string;
  classId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GradeSubmissionModal({
  isOpen,
  submission,
  maxScore,
  assignmentId,
  classId,
  onClose,
  onSuccess,
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState(submission?.grade || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [action, setAction] = useState<'grade' | 'resubmit'>('grade');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!submission) return;

    setLoading(true);
    setError(null);

    try {
      await classApi.gradeSubmission(assignmentId, submission.studentId, score, feedback);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResubmit = async () => {
    if (!submission) return;

    setLoading(true);
    setError(null);

    try {
      await classApi.requestResubmission(assignmentId, submission.studentId, feedback);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request resubmission');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !submission) return null;

  const percentage = (score / maxScore) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold">ตรวจงาน</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {submission.student.username} ({submission.student.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
              {error}
            </div>
          )}

          {/* Submission Status */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded">
            <h3 className="font-semibold mb-2">สถานะการส่งงาน</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เวลาส่ง</p>
                <p className="font-medium">{new Date(submission.submittedAt).toLocaleString('th-TH')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                <p className="font-medium">
                  {submission.status === 'submitted' && <span className="text-blue-600">ส่งแล้ว</span>}
                  {submission.status === 'late' && <span className="text-orange-600">สายกำหนด</span>}
                  {submission.status === 'graded' && <span className="text-green-600">ตรวจแล้ว</span>}
                </p>
              </div>
            </div>

            {submission.content && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">คำตอบ</p>
                <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded border dark:border-slate-700 max-h-48 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{submission.content}</p>
                </div>
              </div>
            )}

            {submission.fileUrl && (
              <div className="mt-4">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  📎 ดูไฟล์ที่ส่ง
                </a>
              </div>
            )}
          </div>

          {/* Action Selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setAction('grade')}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                action === 'grade'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200'
              }`}
            >
              <Send size={16} className="inline mr-2" />
              ให้คะแนน
            </button>
            <button
              onClick={() => setAction('resubmit')}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                action === 'resubmit'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200'
              }`}
            >
              <RefreshCw size={16} className="inline mr-2" />
              ตีงานกลับ
            </button>
          </div>

          {/* Grading Form */}
          {action === 'grade' && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-slate-800 rounded">
              <div>
                <label className="block text-sm font-medium mb-2">
                  คะแนน (สูงสุด: {maxScore})
                </label>
                <div className="flex gap-2 items-end">
                  <input
                    type="number"
                    min="0"
                    max={maxScore}
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 border rounded dark:bg-slate-900 dark:border-slate-700"
                  />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">
                      {score >= maxScore * 0.8 && '⭐ ดีมาก'}
                      {score >= maxScore * 0.6 && score < maxScore * 0.8 && '👍 ดี'}
                      {score < maxScore * 0.6 && '⚠️ ต้องปรับปรุง'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ข้อเสนอแนะ (ถ้ามี)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="เขียนความเห็นหรือข้อเสนอแนะให้นักเรียน..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
            </div>
          )}

          {/* Resubmit Form */}
          {action === 'resubmit' && (
            <div className="space-y-4 p-4 bg-orange-50 dark:bg-slate-800 rounded">
              <div>
                <label className="block text-sm font-medium mb-2">
                  เหตุผลที่ขอให้แก้ไข / ข้อเสนอแนะ
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="อธิบายว่าต้องแก้ไขส่วนไหน..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border rounded dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
              <p className="text-sm text-gray-600">
                นักเรียนจะได้รับการแจ้งและสามารถส่งงานใหม่ได้
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              onClick={action === 'grade' ? handleGrade : handleRequestResubmit}
              disabled={loading || (action === 'resubmit' && !feedback.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'กำลังบันทึก...' : action === 'grade' ? 'ให้คะแนน' : 'ส่งคำขอ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
