import { useState } from 'react'
import UserAvatar from './UserAvatar'
import MessageSearch from './MessageSearch'

export default function ChatDetailsPanel({ activeRoom, messages }) {
  const [search, setSearch] = useState('')

  if (!activeRoom) {
    return (
      <aside className="hidden lg:flex w-80 xl:w-96 border-l border-gray-200 bg-white items-center justify-center text-sm text-gray-400">
        เลือกห้องเพื่อดูรายละเอียด
      </aside>
    )
  }

  const members = [
    { name: 'student-123', role: 'Student' },
    { name: 'teacher-001', role: 'Teacher' },
    { name: 'student-456', role: 'Student' },
  ]

  const attachments = [
    { name: 'assignment-1.pdf', size: '320 KB' },
    { name: 'course-outline.pdf', size: '1.2 MB' },
    { name: 'schedule.png', size: '540 KB' },
  ]

  const notes = [
    { title: 'บทสนทนาเรื่องการบ้าน', time: '2 days ago' },
    { title: 'แจ้งเลื่อนสอบ', time: '1 week ago' },
  ]

  const filteredMessages = search
    ? messages.filter(m =>
        (m.text || m.content || '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : []

  return (
    <aside className="hidden lg:flex w-80 xl:w-96 border-l border-gray-200 bg-white flex-col">
      <div className="p-5 border-b border-gray-200 flex flex-col items-center">
        <UserAvatar name={activeRoom.name} size="lg" />
        <h2 className="mt-3 text-base font-semibold text-gray-900 text-center">
          {activeRoom.name}
        </h2>
        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5F9FF] text-[10px] font-medium text-[#0A4DAD]">
          Group Room
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {/* Search */}
        <section className="border border-gray-200 rounded-xl p-3">
          <MessageSearch value={search} onChange={setSearch} />
          {search && (
            <p className="text-[11px] text-gray-500">
              พบ {filteredMessages.length} ข้อความที่ตรงกับคำค้น
            </p>
          )}
        </section>

        {/* Attachments */}
        <section className="border border-gray-200 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">
            Attachments
          </h3>
          <div className="space-y-2">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-[#F5F9FF] rounded-lg px-2 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-sm">📄</span>
                  <div>
                    <div className="font-medium truncate max-w-[150px]">
                      {a.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {a.size}
                    </div>
                  </div>
                </div>
                <button className="text-[11px] text-[#0A4DAD] hover:underline">
                  ดาวน์โหลด
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Members */}
        <section className="border border-gray-200 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">
            Members
          </h3>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <UserAvatar name={m.name} size="sm" />
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {m.name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="border border-gray-200 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">
            Notes
          </h3>
          <div className="space-y-2 mb-2">
            {notes.map((n, i) => (
              <div key={i} className="bg-[#F5F9FF] rounded-lg px-2 py-2">
                <div className="text-xs text-gray-800">{n.title}</div>
                <div className="text-[10px] text-gray-500">
                  {n.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-[11px] text-[#0A4DAD] border border-dashed border-[#0A4DAD] rounded-lg py-1 hover:bg-[#F5F9FF]">
            + เพิ่มโน้ต
          </button>
        </section>
      </div>
    </aside>
  )
}
