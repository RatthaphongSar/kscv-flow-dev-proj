/**
 * ChatSidebarTabs Component
 * 
 * Filter tabs above the room list:
 * - "ทั้งหมด" (All): show all rooms
 * - "เก็บพูด" (Pinned): show only pinned rooms
 * - "ยังไม่ได้อ่าน" (Unread): show only rooms with unread messages
 */

type ChatFilter = 'all' | 'pinned' | 'unread'

interface ChatSidebarTabsProps {
  value: ChatFilter
  onChange: (next: ChatFilter) => void
}

export default function ChatSidebarTabs({ value, onChange }: ChatSidebarTabsProps) {
  const tabs: { id: ChatFilter; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'pinned', label: 'ปักหมุด' },
    { id: 'unread', label: 'ยังไม่ได้อ่าน' },
  ]

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
            value === tab.id
              ? 'bg-violet-600 text-white font-medium'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
