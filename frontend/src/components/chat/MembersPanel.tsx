import React, { useState, useMemo } from 'react'
import { useRoomMembers, RoomMember } from '../../hooks/useRoomMembers'
import { AddMemberModal } from './AddMemberModal'
import UserAvatar from './UserAvatar'

interface MembersPanelProps {
  roomId: string
  isTeacher: boolean
  currentUserId: string
}

/**
 * Panel to display and manage room members
 * Teachers can add and remove members
 */
export const MembersPanel: React.FC<MembersPanelProps> = ({
  roomId,
  isTeacher,
  currentUserId,
}) => {
  const { members, loading, error, removeMember } = useRoomMembers({ roomId })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<RoomMember | null>(null)

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) =>
        m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Teachers first, then by username
        if (a.role !== b.role) {
          return a.role === 'TEACHER' ? -1 : 1
        }
        return a.username.localeCompare(b.username)
      })
  }, [members, searchTerm])

  const getRoleLabel = (role: string) => {
    return role === 'TEACHER' ? 'อาจารย์' : 'นักศึกษา'
  }

  const handleOpenProfile = (member: RoomMember) => {
    if (!members.some((m) => m.id === member.id)) return
    setSelectedMember(member)
  }

  const handleCloseProfile = () => {
    setSelectedMember(null)
  }

  const isSameRoom = selectedMember
    ? members.some((m) => m.id === selectedMember.id)
    : false

  const handleRemove = async (userId: string) => {
    if (!confirm('ยืนยันการลบสมาชิก?')) return

    try {
      setRemovingId(userId)
      await removeMember(userId)
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 flex items-center justify-center">
        <div className="text-slate-400">กำลังโหลดสมาชิก...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex flex-col">
      {/* Search bar */}
      <div className="mb-4 flex-shrink-0">
        <input
          type="text"
          placeholder="ค้นหาสมาชิก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
        />
      </div>

      {/* Members count */}
      <div className="mb-4 flex-shrink-0 text-xs text-slate-400">
        สมาชิกทั้งหมด: {filteredMembers.length}
      </div>

      {/* Members list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-500 text-sm">ไม่พบสมาชิก</div>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenProfile(member)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <UserAvatar name={member.username} size="sm" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-100">
                      {member.username}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-700 mr-2">
                        {getRoleLabel(member.role)}
                      </span>
                      {member.email && (
                        <span className="text-slate-500">{member.email}</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Remove button - teacher only, don't show for self */}
                {isTeacher && member.id !== currentUserId && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="w-8 h-8 rounded-md bg-slate-700 hover:bg-red-700/50 disabled:bg-slate-700 disabled:cursor-wait text-slate-300 hover:text-red-300 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="ลบสมาชิก"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add member button - teacher only */}
      {isTeacher && (
        <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-colors"
          >
            เพิ่มสมาชิก
          </button>
        </div>
      )}

      {/* Add member modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        roomId={roomId}
      />

      {selectedMember && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleCloseProfile}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-sm w-full">
              <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="text-slate-100 font-semibold">โปรไฟล์ผู้ใช้</div>
                <button
                  onClick={handleCloseProfile}
                  className="text-slate-400 hover:text-slate-200 text-xl"
                  aria-label="ปิด"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedMember.username} size="md" />
                  <div className="min-w-0">
                    <div className="text-slate-100 font-medium truncate">
                      {selectedMember.username}
                    </div>
                    <div className="text-xs text-slate-400">
                      {getRoleLabel(selectedMember.role)}
                    </div>
                  </div>
                </div>
                {selectedMember.email && (
                  <div className="mt-3 text-xs text-slate-400">
                    {selectedMember.email}
                  </div>
                )}
                <div className="mt-3 text-xs text-slate-400">
                  {isSameRoom ? 'อยู่ห้องแชทร่วมกัน' : 'ไม่ได้อยู่ห้องเดียวกัน'}
                </div>
                {isSameRoom && (
                  <div className="mt-3 text-xs text-amber-300">
                    ไม่มีระบบแชทส่วนตัว
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
