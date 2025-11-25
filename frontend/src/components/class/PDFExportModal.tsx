import { useState } from "react";
import { X, Download, FileText } from "lucide-react";

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
}

export default function PDFExportModal({ isOpen, onClose, className }: PDFExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("full");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formats = [
    {
      id: "full",
      name: "รายงานฉบับสมบูรณ์",
      description: "ข้อมูลทั้งหมดของห้องเรียน (กำหนดการ, ข่าวประกาศ, งาน)",
      icon: "📋",
    },
    {
      id: "schedule",
      name: "กำหนดการเรียน",
      description: "ตารางเรียนประจำสัปดาห์",
      icon: "📅",
    },
    {
      id: "assignments",
      name: "รายการงานและโครงการ",
      description: "งานที่กำหนดทั้งหมด พร้อมกำหนดส่ง",
      icon: "📝",
    },
    {
      id: "exams",
      name: "ตารางสอบ",
      description: "กำหนดการสอบทั้งหมด",
      icon: "📖",
    },
  ];

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement actual PDF generation
      // For now, show a demo alert
      const timestamp = new Date().toLocaleDateString("th-TH");
      alert(
        `กำลังเตรียมดาวน์โหลด PDF: ${selectedFormat}\n${timestamp}\n\nNote: PDF generation feature coming soon`
      );

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#020617] border border-[#374151] rounded-xl shadow-xl max-w-md w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-[#374151]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold">ดาวน์โหลด PDF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1f2937] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          {/* CLASS NAME */}
          <div>
            <p className="text-xs text-gray-400">ห้องเรียน</p>
            <p className="text-sm font-medium text-white">{className || "ไม่มีชื่อ"}</p>
          </div>

          {/* FORMAT SELECTION */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              เลือกรูปแบบเอกสาร
            </label>
            <div className="space-y-2">
              {formats.map((format) => (
                <label key={format.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#374151] hover:border-violet-500/50 cursor-pointer transition">
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-4 h-4 mt-1 accent-violet-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{format.icon}</span>
                      <p className="text-sm font-medium text-white">{format.name}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-3 rounded-lg bg-red-600/20 border border-red-500/30">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* FORMAT INFO */}
          <div className="p-3 rounded-lg bg-violet-600/10 border border-violet-500/30">
            <p className="text-xs text-gray-300">
              📄 <span className="text-violet-300 font-medium">ไฟล์ PDF</span> จะดาวน์โหลดในเวลาไม่กี่วินาที
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 p-5 border-t border-[#374151]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-[#374151] hover:bg-[#1f2937] text-sm font-medium transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium text-white flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            {isLoading ? "กำลังเตรียม..." : "ดาวน์โหลด"}
          </button>
        </div>
      </div>
    </div>
  );
}
