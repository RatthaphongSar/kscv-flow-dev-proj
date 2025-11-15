import { useEffect, useState } from 'react'
import { ChatAPI } from '../../services/chat'

export default function AddStudentsModal({ roomId, isOpen, onClose, onSuccess }) {
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // โหลดรายชื่อนักเรียน
  useEffect(() => {
    if (isOpen) {
      loadStudents()
    }
  }, [isOpen])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ChatAPI.getStudents()
      setStudents(data || [])
    } catch (err) {
      setError(err?.message || 'Failed to load students')
      console.error('Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleAddMembers = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one student')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await ChatAPI.addMembersToRoom(roomId, selectedIds)
      console.log('Members added:', result)
      setSelectedIds([])
      setSearch('')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to add members')
      console.error('Error adding members:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((s) =>
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    (s.email?.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-[#020617] border border-[#1f2937] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">เพิ่มนักเรียนเข้าห้อง</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md bg-[#111827] border border-[#374151] px-3 py-2 text-sm
                       text-gray-100 placeholder:text-gray-500
                       focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Student List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            กำลังโหลด...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            ไม่พบนักเรียน
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center p-3 rounded-md hover:bg-[#111827] cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => handleToggle(student.id)}
                  className="w-4 h-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-gray-100">
                    {student.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(student.year ?? 0) > 0 ? `ปีที่ ${student.year}` : 'N/A'} •{' '}
                    {student.major || 'N/A'}
                    {student.email && ` • ${student.email}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Selected Count */}
        <div className="mb-4 text-sm text-gray-400">
          เลือก {selectedIds.length} / {students.length} นักเรียน
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedIds.length === 0}
            className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มเข้าห้อง'}
          </button>
        </div>
      </div>
    </div>
  )
}
