import { useState } from 'react';
import { Bell, Volume2, Mail, Lock, Shield, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { useChatStore } from '../stores/chat';

const NOTIFICATION_OPTIONS = [
  { id: 'all', label: 'ทุกข้อความ' },
  { id: 'mentions', label: 'เฉพาะเมื่อถูกกล่าวถึง' },
  { id: 'none', label: 'ปิด' },
];

const SOUND_OPTIONS = [
  { id: 'all', label: 'ทุกข้อความ' },
  { id: 'mentions', label: 'เฉพาะเมื่อถูกกล่าวถึง' },
  { id: 'none', label: 'ปิด' },
];

export function ChatSettings() {
  const [notifications, setNotifications] = useState('all');
  const [sounds, setSounds] = useState('all');
  const [emailNotifications, setEmailNotifications] = useState(false);

  const currentRoom = useChatStore((state) => 
    state.rooms.find((r) => r.id === state.currentRoomId)
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-8">ตั้งค่าการแชท</h1>

      {currentRoom && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentRoom.avatar} alt={currentRoom.name} />
              <AvatarFallback>{currentRoom.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentRoom.name}</h2>
              <p className="text-gray-500">ID: {currentRoom.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* การแจ้งเตือน */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          การแจ้งเตือน
        </h3>
        <div className="space-y-4">
          {NOTIFICATION_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="notifications"
                value={option.id}
                checked={notifications === option.id}
                onChange={(e) => setNotifications(e.target.value)}
                className="w-4 h-4 text-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* เสียง */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          เสียงแจ้งเตือน
        </h3>
        <div className="space-y-4">
          {SOUND_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="sounds"
                value={option.id}
                checked={sounds === option.id}
                onChange={(e) => setSounds(e.target.value)}
                className="w-4 h-4 text-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* อีเมล */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          การแจ้งเตือนทางอีเมล
        </h3>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-4 h-4 text-blue-500"
          />
          <span>รับการแจ้งเตือนทางอีเมลเมื่อออฟไลน์</span>
        </label>
      </section>

      {/* ความเป็นส่วนตัว */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          ความเป็นส่วนตัว
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-500"
            />
            <span>แสดงสถานะการอ่านข้อความ</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-500"
            />
            <span>แสดงสถานะการพิมพ์</span>
          </label>
        </div>
      </section>

      {/* ความปลอดภัย */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          ความปลอดภัย
        </h3>
        <div className="space-y-4">
          <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-5 h-5" />
            ลบประวัติการแชท
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Lock className="w-5 h-5" />
            บล็อกผู้ใช้
          </button>
        </div>
      </section>

      {/* บันทึกการตั้งค่า */}
      <div className="flex justify-end gap-4">
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          ยกเลิก
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg">
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}