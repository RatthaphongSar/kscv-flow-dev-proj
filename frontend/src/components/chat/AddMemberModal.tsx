import React, { useState, useEffect } from 'react'
import { useRoomMembers } from '../../hooks/useRoomMembers'

interface User {
  id: string
  username: string
  email?: string
  role: string
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

/**
 * Modal for adding new members to a room (teacher only)
 */
export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  roomId,
}) => {
  const { addMember } = useRoomMembers({ roomId, autoFetch: false })
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch available users when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchUsers = async () => {
      setLoading(true)
      try {
        // Fetch all users that are not already members
        const response = await fetch(`/api/rooms/${roomId}/members/available`)
        if (!response.ok) throw new Error('Failed to fetch available users')
        const data = await response.json()
        setAvailableUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    setSelectedUserId('')
    setError(null)
  }, [isOpen, roomId])

  const filteredUsers = availableUsers.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    if (!selectedUserId) {
      setError('กรุณาเลือกสมาชิก')
      return
    }

    try {
      setLoading(true)
      await addMember(selectedUserId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">เพิ่มสมาชิก</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Search input */}
            <input
              type="text"
              placeholder="ค้นหาสมาชิก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
            />

            {/* User list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-4 text-slate-400 text-sm">
                  กำลังโหลด...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">
                  ไม่พบสมาชิกที่ใช้ได้
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user.id}
                      checked={selectedUserId === user.id}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-100">
                        {user.username}
                      </div>
                      {user.email && (
                        <div className="text-xs text-slate-400">{user.email}</div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleAdd}
              disabled={loading || !selectedUserId}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition-colors"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
