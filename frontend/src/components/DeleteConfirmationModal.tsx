/**
 * DeleteConfirmationModal.tsx
 * Beautiful delete confirmation modal with support for different resource types
 */

import React, { useState } from 'react';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  itemName?: string;
  resourceType?: 'assignment' | 'exam' | 'schedule' | 'material' | 'class' | 'default';
  isLoading?: boolean;
  danger?: boolean; // If true, shows more prominent danger styling
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  resourceType = 'default',
  isLoading = false,
  danger = true,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = isDeleting || isLoading;

  // Get resource-specific messaging
  const getResourceMessage = () => {
    switch (resourceType) {
      case 'assignment':
        return `This assignment will be permanently deleted. All student submissions will be lost.`;
      case 'exam':
        return `This exam will be permanently deleted. All exam data will be lost.`;
      case 'schedule':
        return `This schedule will be permanently deleted.`;
      case 'material':
        return `This material will be permanently deleted.`;
      case 'class':
        return `This class will be permanently deleted. All students, assignments, and data will be lost.`;
      default:
        return message;
    }
  };

  const getDeleteButtonLabel = () => {
    switch (resourceType) {
      case 'assignment':
        return 'Delete Assignment';
      case 'exam':
        return 'Delete Exam';
      case 'schedule':
        return 'Delete Schedule';
      case 'material':
        return 'Delete Material';
      case 'class':
        return 'Delete Class';
      default:
        return 'Delete';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-red-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
        >
          <X size={20} className="text-gray-400 hover:text-white" />
        </button>

        <div className="p-6">
          {/* Header with Warning Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${danger ? 'bg-red-600/20 border border-red-500/30' : 'bg-amber-600/20 border border-amber-500/30'}`}>
              <AlertTriangle 
                size={28} 
                className={danger ? 'text-red-400' : 'text-amber-400'}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Message Section */}
          <div className="mb-6 space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-gray-300 leading-relaxed">
                {getResourceMessage()}
              </p>
            </div>

            {itemName && (
              <div className="p-4 rounded-xl bg-red-600/10 border border-red-500/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                  Item to Delete
                </p>
                <p className="text-sm font-mono text-red-300 break-all">
                  {itemName}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Warning Text */}
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <div className="text-amber-400 mt-1">⚠️</div>
              <p className="text-sm text-amber-300">
                Please make sure you want to delete this. This action is permanent and cannot be reversed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-white font-semibold hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                danger
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  {getDeleteButtonLabel()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;