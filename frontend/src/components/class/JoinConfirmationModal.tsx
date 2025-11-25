/**
 * JoinConfirmationModal.tsx
 * Beautiful modal for student to confirm joining a class
 */

import React, { useState } from 'react';
import { X, BookOpen, User, AlertCircle, Loader } from 'lucide-react';

interface JoinConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  teacherName: string;
  classCode: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const JoinConfirmationModal: React.FC<JoinConfirmationModalProps> = ({
  isOpen,
  onClose,
  className,
  teacherName,
  classCode,
  onConfirm,
  isLoading = false,
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error joining class:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isProcessing = submitting || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal Background */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
        >
          <X size={20} className="text-gray-400 hover:text-white" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <BookOpen size={24} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ยืนยันการลงทะเบียน</h2>
            <p className="text-sm text-gray-400 mt-1">ตรวจสอบข้อมูลก่อนส่งคำขอ</p>
          </div>
        </div>

        {/* Class Information */}
        <div className="space-y-4 mb-6">
          {/* Class Name */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              ชื่อวิชา
            </p>
            <p className="text-sm font-semibold text-white truncate">{className}</p>
          </div>

          {/* Class Code */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              รหัสวิชา
            </p>
            <p className="text-sm font-mono text-emerald-400">{classCode}</p>
          </div>

          {/* Teacher Name */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-gray-400" />
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                อาจารย์ผู้สอน
              </p>
            </div>
            <p className="text-sm font-semibold text-white">{teacherName}</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-6">
          <div className="flex gap-3">
            <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">การอนุมัติ</p>
              <p className="text-xs text-blue-200/70 mt-1">
                คำขอของคุณจะถูกส่งไปยังอาจารย์ผู้สอน เขาจะต้องอนุมัติให้คุณเข้าห้องเรียน
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 hover:bg-slate-800 text-white transition disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>กำลังส่ง...</span>
              </>
            ) : (
              'ยืนยันการลงทะเบียน'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinConfirmationModal;
