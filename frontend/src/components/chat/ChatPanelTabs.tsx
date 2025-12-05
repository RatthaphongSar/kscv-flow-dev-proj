/**
 * ChatPanelTabs Component
 * 
 * Horizontal tab strip for switching between:
 * - "แชท" (Chat): message list view
 * - "ไฟล์" (Files): shared files view
 * - "โน้ต" (Notes): pinned notes view
 * - "สมาชิก" (Members): room members list
 */

export type ChatPanelTab = 'chat' | 'files' | 'notes' | 'members'

interface ChatPanelTabsProps {
  value: ChatPanelTab
  onChange: (next: ChatPanelTab) => void
  isTeacher?: boolean
}

export default function ChatPanelTabs({ value, onChange, isTeacher = false }: ChatPanelTabsProps) {
  const tabs: { id: ChatPanelTab; label: string }[] = [
    { id: 'chat', label: 'แชท' },
    { id: 'files', label: 'ไฟล์' },
    { id: 'notes', label: 'โน้ต' },
    { id: 'members', label: 'สมาชิก' },
  ]

  return (
    <div className="flex gap-1 border-b border-[#1f2937] bg-[#0f172a]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
            value === tab.id
              ? 'text-blue-300 bg-[#1e293b]'
              : 'text-slate-400 hover:text-slate-300 hover:bg-[#111827]/50'
          }`}
        >
          {tab.label}
          {/* Underline indicator for active tab */}
          {value === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
          )}
        </button>
      ))}
    </div>
  )
}
