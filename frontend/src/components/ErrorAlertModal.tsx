import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function ErrorAlertModal({
  isOpen,
  onClose,
  title = 'เกิดข้อผิดพลาด',
  message,
}: ErrorAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-600/20 p-2">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-slate-700 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}
