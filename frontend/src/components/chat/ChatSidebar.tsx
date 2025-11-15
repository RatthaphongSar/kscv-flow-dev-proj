import { useMemo, useState } from 'react'
import ConversationList from './ConversationList'
import UserAvatar from './UserAvatar'

export default function ChatSidebar({
  rooms,
  activeRoom,
  onSelectRoom,
  currentUser,
  canCreateRoom,
  onCreateRoom,
}) {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomType, setRoomType] = useState('class')
  const [roomDesc, setRoomDesc] = useState('')

  const filteredRooms = useMemo(
    () =>
      rooms.filter(r =>
        (r.name || '').toLowerCase().includes(search.toLowerCase()),
      ),
    [rooms, search],
  )

  function handleSubmitCreate(e) {
    e.preventDefault()
    if (!roomName.trim()) return
    onCreateRoom?.({
      name: roomName.trim(),
      description: roomDesc.trim(),
      type: roomType,
    })
    setRoomName('')
    setRoomDesc('')
    setRoomType('class')
    setIsCreateOpen(false)
  }

  return (
    <aside className="w-80 shrink-0 h-full bg-[#111827] border-r border-[#1f2937] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[#1f2937]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">การแชท</h2>
            <p className="text-[11px] text-gray-400">
              รายการสนทนาทั้งหมดของคุณ
            </p>
          </div>
          {canCreateRoom && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-lg flex items-center justify-center"
              title="สร้างห้องใหม่"
            >
              +
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาการแชท"
            className="w-full rounded-md bg-[#020617] border border-[#1f2937] px-3 py-1.5 text-xs
                       placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
            🔍
          </span>
        </div>

        {/* Tabs (ยังไม่ต้องมี logic ก็ได้) */}
        <div className="flex gap-2 text-[11px]">
          <button className="px-2 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
            ทั้งหมด
          </button>
          <button className="px-2 py-1 rounded-full text-gray-300 hover:bg-[#020617]">
            ปักหมุด
          </button>
          <button className="px-2 py-1 rounded-full text-gray-300 hover:bg-[#020617]">
            ยังไม่ได้อ่าน
          </button>
        </div>
      </div>

      {/* รายการห้อง */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          rooms={filteredRooms}
          activeRoom={activeRoom}
          onSelectRoom={onSelectRoom}
        />
      </div>

      {/* ผู้ใช้ปัจจุบัน */}
      <div className="px-4 py-3 border-t border-[#1f2937] bg-[#020617]">
        <div className="flex items-center gap-3">
          <UserAvatar name={currentUser?.username || 'Guest'} size="sm" />
          <div>
            <div className="text-xs font-medium">
              {currentUser?.username || 'Guest'}
            </div>
            <div className="text-[11px] text-gray-400">ออนไลน์</div>
          </div>
        </div>
      </div>

      {/* Modal สร้างห้อง (หน้าต่างเล็ก) */}
      {isCreateOpen && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="w-80 rounded-xl bg-[#020617] border border-[#1f2937] shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">สร้างห้องแชทใหม่</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmitCreate}>
              <div>
                <label className="block text-[11px] mb-1 text-gray-300">
                  ชื่อห้อง
                </label>
                <input
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="w-full rounded-md bg-[#020617] border border-[#374151] px-3 py-1.5 text-xs
                             focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-gray-300">
                  ประเภทห้อง
                </label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full rounded-md bg-[#020617] border border-[#374151] px-3 py-1.5 text-xs
                             focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="class">Class Room</option>
                  <option value="group">Group Project</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-gray-300">
                  รายละเอียด (ไม่บังคับ)
                </label>
                <textarea
                  value={roomDesc}
                  onChange={e => setRoomDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-md bg-[#020617] border border-[#374151] px-3 py-1.5 text-[11px]
                             resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-md text-[11px] text-gray-300 hover:bg-[#111827]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!roomName.trim()}
                  className="px-4 py-1.5 rounded-md text-[11px] font-medium bg-violet-600 text-white
                             hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  สร้างห้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}
