import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, FileText, Mail, User, MessageSquare, Send, X } from 'lucide-react';
import { classApi } from '../../api/classApi';

interface Submission {
  id: string;
  student: {
    id: string;
    username: string;
    email: string;
    year: number;
    major: string;
  };
  content?: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
  status: string;
  submittedAt: string;
  submissionCount: number;
}

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  dueDate: string;
}

interface TeacherAssignmentGradingProps {
  assignment: Assignment;
  onGraded?: () => void;
}

export default function TeacherAssignmentGrading({
  assignment,
  onGraded,
}: TeacherAssignmentGradingProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await classApi.getAssignmentSubmissions(assignment.id);
        setSubmissions(data);
      } catch (err) {
        console.error('Error loading submissions:', err);
        setError('ไม่สามารถโหลดการส่งงาน');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignment.id]);

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setError(null);
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      setError(null);
      await classApi.gradeSubmission(selectedSubmission.id, {
        grade,
        feedback,
        status: 'graded',
      });

      // Update local state
      setSubmissions(
        submissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, grade, feedback, status: 'graded' }
            : s
        )
      );

      setSelectedSubmission(null);
      if (onGraded) onGraded();
    } catch (err: any) {
      console.error('Error grading:', err);
      setError(err.message || 'ไม่สามารถให้คะแนน');
    } finally {
      setGrading(false);
    }
  };

  const handleRequestResubmit = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      await classApi.requestResubmission(selectedSubmission.id, feedback);
      setSubmissions(
        submissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, feedback, status: 'requested_resubmit' }
            : s
        )
      );
      setSelectedSubmission(null);
    } catch (err: any) {
      console.error('Error requesting resubmit:', err);
      setError(err.message || 'ไม่สามารถขอส่งใหม่');
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[11px]">
            <AlertCircle size={12} />
            รอตรวจสอบ
          </span>
        );
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-600/20 text-green-300 border border-green-500/40 text-[11px]">
            <CheckCircle2 size={12} />
            ตรวจสอบแล้ว
          </span>
        );
      case 'requested_resubmit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-500/40 text-[11px]">
            <AlertCircle size={12} />
            ขอส่งใหม่
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-[11px]">
            <AlertCircle size={12} />
            ส่งล่าช้า
          </span>
        );
      default:
        return null;
    }
  };

  const submittedCount = submissions.filter(s => s.status !== 'not_submitted').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  if (loading) {
    return <div className="text-center py-8 text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Submissions List */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-100 mb-3">การส่งงาน</h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-slate-900 p-2 rounded text-center">
              <p className="text-slate-400">ส่งแล้ว</p>
              <p className="text-lg font-bold text-blue-300">{submittedCount}</p>
            </div>
            <div className="bg-slate-900 p-2 rounded text-center">
              <p className="text-slate-400">ตรวจสอบแล้ว</p>
              <p className="text-lg font-bold text-green-300">{gradedCount}</p>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {submissions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">ไม่มีการส่งงาน</p>
            ) : (
              submissions.map(submission => (
                <button
                  key={submission.id}
                  onClick={() => handleSelectSubmission(submission)}
                  className={`w-full text-left p-2 rounded-lg transition ${
                    selectedSubmission?.id === submission.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-gray-200'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{submission.student.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {submission.student.email}
                  </p>
                  <div className="mt-1">{getStatusBadge(submission.status)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grading Panel */}
      <div className="lg:col-span-2">
        {selectedSubmission ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            {/* Student Info */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {selectedSubmission.student.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-100">
                        {selectedSubmission.student.username}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Mail size={12} />
                        {selectedSubmission.student.email}
                      </p>
                    </div>
                  </div>
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>

              <div className="border-t border-slate-700 pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">ปีการศึกษา</p>
                  <p className="font-medium text-gray-200">{selectedSubmission.student.year}</p>
                </div>
                <div>
                  <p className="text-slate-400">สาขา</p>
                  <p className="font-medium text-gray-200">{selectedSubmission.student.major}</p>
                </div>
                <div>
                  <p className="text-slate-400">ส่งเมื่อ</p>
                  <p className="text-xs text-gray-200">
                    {new Date(selectedSubmission.submittedAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">จำนวนครั้งที่ส่ง</p>
                  <p className="font-medium text-gray-200">{selectedSubmission.submissionCount}</p>
                </div>
              </div>
            </div>

            {/* Submission Content */}
            {(selectedSubmission.content || selectedSubmission.fileUrl) && (
              <div className="border-t border-slate-700 pt-3 mb-4">
                <p className="text-slate-400 text-sm mb-2 font-medium">เนื้อหาที่ส่ง</p>
                {selectedSubmission.content && (
                  <div className="bg-slate-900/50 p-3 rounded-lg mb-2 text-sm text-gray-200 max-h-40 overflow-y-auto">
                    {selectedSubmission.content}
                  </div>
                )}
                {selectedSubmission.fileUrl && (
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 text-blue-300 text-sm transition"
                  >
                    <FileText size={14} />
                    ดูไฟล์ที่แนบ
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Grading Form */}
            <div className="border-t border-slate-700 pt-4 space-y-4">
              {/* Grade Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  คะแนน (0 - {assignment.maxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.maxScore}
                  value={grade}
                  onChange={(e) => setGrade(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ความเห็น
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="เขียนความเห็นเกี่ยวกับการส่งงาน..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <button
                  onClick={handleGradeSubmit}
                  disabled={grading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  <CheckCircle2 size={16} />
                  {grading ? 'กำลังบันทึก...' : 'ให้คะแนน'}
                </button>
                <button
                  onClick={handleRequestResubmit}
                  disabled={grading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  <MessageSquare size={16} />
                  {grading ? 'กำลังส่ง...' : 'ขอส่งใหม่'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 flex items-center justify-center h-full">
            <p className="text-slate-400 text-center">
              เลือกการส่งงานจากรายการด้านซ้าย
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
