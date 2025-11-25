import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { classApi } from '../../api/classApi';
import SubmissionConfirmationModal from './SubmissionConfirmationModal';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxScore: number;
}

interface Submission {
  id: string;
  content?: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
  status: string;
  submittedAt: string;
  submissionCount: number;
}

interface StudentAssignmentSubmissionProps {
  assignment: Assignment;
  onSubmitted?: () => void;
}

export default function StudentAssignmentSubmission({
  assignment,
  onSubmitted,
}: StudentAssignmentSubmissionProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const data = await classApi.getSubmission(assignment.id);
        setSubmission(data);
        if (data) {
          setContent(data.content || '');
          setFileUrl(data.fileUrl || '');
        }
      } catch (err) {
        console.error('Error loading submission:', err);
        setError('ไม่สามารถโหลดการส่งงาน');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignment.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // In a real app, you'd upload to a server and get fileUrl
      // For now, we'll store a reference
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileUrl) {
      setError('กรุณากรอกเนื้อหาหรือแนบไฟล์');
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const result = await classApi.submitAssignment(assignment.id, {
        content,
        fileUrl,
      });
      setSubmission(result);
      setShowSubmitForm(false);
      setContent('');
      setFileUrl('');
      setFileName('');
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      console.error('Error submitting:', err);
      setError(err.message || 'ไม่สามารถส่งงาน');
    } finally {
      setSubmitting(false);
    }
  };

  const isDue = new Date(assignment.dueDate) < new Date();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs">
            <Clock size={14} />
            รอตรวจสอบ
          </span>
        );
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/20 text-green-300 border border-green-500/40 text-xs">
            <CheckCircle2 size={14} />
            ตรวจสอบแล้ว
          </span>
        );
      case 'requested_resubmit':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-500/40 text-xs">
            <AlertCircle size={14} />
            ขอส่งใหม่
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-xs">
            <AlertCircle size={14} />
            ส่งล่าช้า
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <>
      {/* Confirmation Modal */}
      <SubmissionConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        assignment={assignment}
        submissionData={{
          content,
          fileUrl,
          fileName,
        }}
        currentStatus={submission?.status as 'late' | 'submitted' | 'graded' | 'requested_resubmit' | 'not_submitted' | null | undefined}
        isSubmitting={submitting}
        onConfirm={handleConfirmSubmit}
      />

      <div className="space-y-4">
      {/* Assignment Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-100">{assignment.title}</h3>
            <p className="text-xs text-slate-400 mt-1">คะแนนเต็ม: {assignment.maxScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">
              กำหนดส่ง: {new Date(assignment.dueDate).toLocaleDateString('th-TH')}
            </p>
            {isDue && (
              <p className="text-xs text-red-400 mt-1">ตรงต่อเวลา</p>
            )}
          </div>
        </div>
        {assignment.description && (
          <p className="text-sm text-slate-300">{assignment.description}</p>
        )}
      </div>

      {/* Submission Status */}
      {submission && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-100">สถานะการส่งงาน</h4>
            {getStatusBadge(submission.status)}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">ส่งเมื่อ:</span>
              <span className="text-gray-200">
                {new Date(submission.submittedAt).toLocaleDateString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">จำนวนครั้งที่ส่ง:</span>
              <span className="text-gray-200">{submission.submissionCount}</span>
            </div>

            {submission.grade !== null && (
              <div className="flex justify-between">
                <span className="text-slate-400">คะแนน:</span>
                <span className="text-gray-200 font-semibold">
                  {submission.grade} / {assignment.maxScore}
                </span>
              </div>
            )}

            {submission.feedback && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-slate-400 mb-1">ความเห็นของอาจารย์:</p>
                <p className="text-gray-200">{submission.feedback}</p>
              </div>
            )}

            {submission.content && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-slate-400 mb-1">เนื้อหาที่ส่ง:</p>
                <p className="text-gray-200 bg-slate-900/50 p-2 rounded text-xs">
                  {submission.content}
                </p>
              </div>
            )}
          </div>

          {submission.status === 'requested_resubmit' && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition"
            >
              ส่งงานใหม่
            </button>
          )}
        </div>
      )}

      {/* Submit Form */}
      {(!submission || submission.status === 'requested_resubmit' || showSubmitForm) && (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-100 mb-3">ส่งงาน</h4>

          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Text Content */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              เนื้อหา (ตัวเลือก)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="พิมพ์เนื้อหาการส่งงานของคุณที่นี่..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              แนบไฟล์ (ตัวเลือก)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-600 rounded-lg hover:border-violet-500 cursor-pointer transition text-slate-400 hover:text-gray-300"
              >
                <Upload size={18} />
                <span className="text-sm">เลือกไฟล์หรือลากไฟล์มาที่นี่</span>
              </label>
              {fileName && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-900 text-sm text-gray-300">
                  <FileText size={16} />
                  {fileName}
                  <button
                    type="button"
                    onClick={() => {
                      setFileName('');
                      setFileUrl('');
                    }}
                    className="ml-auto text-slate-500 hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || (!content.trim() && !fileUrl)}
              className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งงาน'}
            </button>
            {showSubmitForm && (
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium transition"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      )}
      </div>
    </>
  );
}
