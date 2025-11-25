import { useState } from "react";
import { X, Plus, Check } from "lucide-react";

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className?: string;
}

export default function GoogleCalendarModal({ isOpen, onClose, className }: GoogleCalendarModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "schedule",
    "assignments",
    "exams",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = [
    {
      id: "schedule",
      name: "ตารางเรียน",
      description: "เพิ่มตารางเรียนประจำสัปดาห์ลงในปฏิทิน",
      icon: "📅",
    },
    {
      id: "assignments",
      name: "กำหนดส่งงาน",
      description: "แจ้งเตือนวันส่งงานและโครงการ",
      icon: "📝",
    },
    {
      id: "exams",
      name: "กำหนดการสอบ",
      description: "เพิ่มตารางสอบทั้งหมด",
      icon: "📖",
    },
  ];

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleIntegrate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // TODO: Implement actual Google Calendar API integration
      // For now, show a demo alert
      const timestamp = new Date().toLocaleDateString("th-TH");
      alert(
        `กำลังเพิ่มรายการลงใน Google Calendar: ${selectedItems.join(", ")}\n${timestamp}\n\nNote: Google Calendar integration feature coming soon`
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
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
            <svg
              className="w-5 h-5 text-blue-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
            </svg>
            <h3 className="text-lg font-semibold">Google Calendar</h3>
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
            <p className="text-sm font-medium text-white">
              {className || "ไม่มีชื่อ"}
            </p>
          </div>

          {/* ITEMS SELECTION */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              เลือกรายการที่จะเพิ่มลงปฏิทิน
            </label>
            <div className="space-y-2">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#374151] hover:border-blue-500/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-4 h-4 mt-1 accent-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  {selectedItems.includes(item.id) && (
                    <Check className="w-4 h-4 text-blue-400 mt-1" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* SUCCESS STATE */}
          {success && (
            <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
              <p className="text-xs text-green-300">
                ✓ เพิ่มลงปฏิทินสำเร็จแล้ว
              </p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="p-3 rounded-lg bg-red-600/20 border border-red-500/30">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* INFO */}
          <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/30">
            <p className="text-xs text-gray-300">
              🔗 <span className="text-blue-300 font-medium">การเชื่อมต่อ</span>{" "}
              Google Calendar จะเปิด ที่ขั้นตอนถัดไป
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
            onClick={handleIntegrate}
            disabled={isLoading || selectedItems.length === 0 || success}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            {isLoading
              ? "กำลังเพิ่ม..."
              : success
              ? "เสร็จสิ้น"
              : "เพิ่มลงปฏิทิน"}
          </button>
        </div>
      </div>
    </div>
  );
}
