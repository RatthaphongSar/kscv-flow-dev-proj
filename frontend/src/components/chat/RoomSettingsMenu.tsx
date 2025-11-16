import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { EditRoomNameModal } from './EditRoomNameModal'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { useRoomOperations } from '../../hooks/useRoomOperations'

interface RoomSettingsMenuProps {
  roomId: string
  roomName: string
  isTeacher: boolean
  onRoomUpdated?: (roomId: string, newName: string) => void
  onRoomDeleted?: (roomId: string) => void
}

/**
 * Menu button for room settings (edit name, delete)
 * Only visible to teachers
 */
export const RoomSettingsMenu: React.FC<RoomSettingsMenuProps> = ({
  roomId,
  roomName,
  isTeacher,
  onRoomUpdated,
  onRoomDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const { loading, updateRoom, deleteRoom } = useRoomOperations()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  if (!isTeacher) return null

  const handleEditSubmit = async (newName: string) => {
    try {
      await updateRoom(roomId, newName)
      setIsEditModalOpen(false)
      onRoomUpdated?.(roomId, newName)
    } catch (err) {
      console.error('Error updating room:', err)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteRoom(roomId)
      setIsDeleteModalOpen(false)
      onRoomDeleted?.(roomId)
    } catch (err) {
      console.error('Error deleting room:', err)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 hover:bg-slate-700 text-slate-400 hover:text-gray-200 rounded-lg transition-colors"
        title="ตัวเลือกห้อง"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-40 min-w-48">
          {/* Edit Name */}
          <button
            onClick={() => {
              setIsEditModalOpen(true)
              setIsMenuOpen(false)
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-slate-700 text-gray-200 transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            แก้ไขชื่อห้อง
          </button>

          {/* Delete Room */}
          <button
            onClick={() => {
              setIsDeleteModalOpen(true)
              setIsMenuOpen(false)
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors text-sm border-t border-slate-700"
          >
            <Trash2 className="w-4 h-4" />
            ลบห้อง
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditRoomNameModal
        isOpen={isEditModalOpen}
        currentName={roomName}
        onSave={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="ลบห้องแชท"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${roomName}"? การกระทำนี้ไม่สามารถย้อนกลับได้ และข้อความทั้งหมดในห้องจะถูกลบ`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={loading}
        confirmText="ลบห้อง"
        cancelText="ยกเลิก"
      />
    </div>
  )
}
