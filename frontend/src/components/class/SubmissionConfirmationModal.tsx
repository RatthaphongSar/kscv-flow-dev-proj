/**
 * SubmissionConfirmationModal.tsx
 * Beautiful modal for student to confirm assignment submission
 */

import React, { useState } from 'react';
import { X, Send, File, AlertCircle, Loader, CheckCircle, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface SubmissionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    maxScore?: number;
  };
  submissionData: {
    content?: string;
    fileUrl?: string;
    fileName?: string;
  };
  currentStatus?: 'not_submitted' | 'submitted' | 'graded' | 'late' | 'requested_resubmit' | null;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void>;
}

const SubmissionConfirmationModal: React.FC<SubmissionConfirmationModalProps> = ({
  isOpen,
  onClose,
  assignment,
  submissionData,
  currentStatus,
  isSubmitting = false,
  onConfirm,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      setConfirming(true);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการส่งงาน');
      console.error('Error submitting assignment:', err);
    } finally {
      setConfirming(false);
    }
  };

  const isProcessing = confirming || isSubmitting;
  const isLate = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const hasContent = submissionData.content && submissionData.content.trim().length > 0;
  const hasFile = submissionData.fileUrl && submissionData.fileName;

  // Status badge styling
  const getStatusBadgeStyle = () => {
    switch (currentStatus) {
      case 'submitted':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'graded':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'requested_resubmit':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'late':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'submitted':
        return 'ส่งแล้ว';
      case 'graded':
        return 'ได้รับการให้คะแนน';
      case 'requested_resubmit':
        return 'ขอให้ส่งซ้ำ';
      case 'late':
        return 'ส่งช้า';
      case 'not_submitted':
        return 'ยังไม่ส่ง';
      default:
        return 'ไม่มีข้อมูล';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal Background */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="sticky top-4 left-full -translate-x-full -translate-y-4 p-2 hover:bg-slate-800 rounded-lg transition disabled:opacity-50 z-10 mr-4"
        >
          <X size={20} className="text-gray-400 hover:text-white" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
              <Send size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ยืนยันการส่งงาน</h2>
              <p className="text-sm text-gray-400 mt-1">กรุณาตรวจสอบข้อมูลก่อนส่งงาน</p>
            </div>
          </div>

          {/* Current Status */}
          {currentStatus && (
            <div className="mb-6 p-4 rounded-xl border-l-4 border-blue-500 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    สถานะปัจจุบัน
                  </p>
                  <p className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeStyle()}`}>
                    {getStatusText()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Details */}
          <div className="space-y-4 mb-6">
            {/* Assignment Title */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                ชื่องาน
              </p>
              <p className="text-base font-bold text-white">{assignment.title}</p>
            </div>

            {/* Assignment Description */}
            {assignment.description && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                  คำอธิบาย
                </p>
                <p className="text-sm text-gray-300 line-clamp-3">{assignment.description}</p>
              </div>
            )}

            {/* Due Date and Score */}
            <div className="grid grid-cols-2 gap-4">
              {assignment.dueDate && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                    ส่งก่อน
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${isLate ? 'text-red-400' : 'text-emerald-400'}`}>
                      {formatDate(assignment.dueDate)}
                    </span>
                    {isLate && <AlertCircle size={16} className="text-red-400" />}
                  </div>
                  {isLate && (
                    <p className="text-xs text-red-400 mt-1">⚠️ งานนี้ส่งช้าแล้ว</p>
                  )}
                </div>
              )}
              {assignment.maxScore && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                    คะแนนเต็ม
                  </p>
                  <p className="text-sm font-bold text-cyan-400">{assignment.maxScore} คะแนน</p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Content Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              เนื้อหาที่จะส่ง
            </h3>
            <div className="space-y-3">
              {/* Text Content */}
              {hasContent && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-blue-400" />
                    <p className="text-xs text-gray-400 font-semibold">เนื้อหาข้อความ</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                      {submissionData.content}
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload */}
              {hasFile && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <File size={16} className="text-emerald-400" />
                    <p className="text-xs text-gray-400 font-semibold">ไฟล์ที่อัพโหลด</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <File size={20} className="text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{submissionData.fileName}</p>
                      <p className="text-xs text-gray-400">อัพโหลดแล้ว</p>
                    </div>
                  </div>
                </div>
              )}

              {!hasContent && !hasFile && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-amber-300">
                      ⚠️ ไม่มีเนื้อหาหรือไฟล์ที่จะส่ง กรุณาเพิ่มข้อมูล
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-white font-semibold hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing || (!hasContent && !hasFile)}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send size={18} />
                  ยืนยันการส่ง
                </>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            หลังจากส่งงาน คุณสามารถตรวจสอบสถานะและให้อาจารย์ให้คะแนน
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionConfirmationModal;