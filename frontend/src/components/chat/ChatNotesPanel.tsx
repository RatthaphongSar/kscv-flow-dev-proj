import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CreateNoteModal } from './CreateNoteModal'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { useRoomNotes } from '../../hooks/useRoomNotes'

interface ChatNotesPanelProps {
  roomId: string
  isTeacher: boolean
}

/**
 * Panel to display and manage room notes
 * Shows all notes for the room
 * Teachers can create, edit, and delete notes
 */
export const ChatNotesPanel: React.FC<ChatNotesPanelProps> = ({ roomId, isTeacher }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { notes, loading, error, createNote, deleteNote } = useRoomNotes({ roomId })

  const handleCreateNote = async (title: string, content: string) => {
    setIsCreating(true)
    try {
      await createNote(title, content)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (noteId: string) => {
    setDeletingNoteId(noteId)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingNoteId) return

    setIsDeleting(true)
    try {
      await deleteNote(deletingNoteId)
      setIsDeleteConfirmOpen(false)
      setDeletingNoteId(null)
    } catch (err) {
      console.error('Error deleting note:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 flex items-center justify-center">
        <div className="text-slate-400">กำลังโหลดโน้ต...</div>
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
      {/* Header with Create Button */}
      {isTeacher && (
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-semibold text-gray-200">โน้ตของห้อง</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
          >
            สร้างโน้ต
          </button>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 text-sm">ไม่มีโน้ตในห้องนี้</div>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              {/* Title with Delete Button */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-100 flex-1">{note.title}</h4>
                {isTeacher && (
                  <button
                    onClick={() => handleDeleteClick(note.id)}
                    className="ml-2 p-1.5 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded transition-colors flex-shrink-0"
                    title="ลบโน้ต"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content Preview */}
              <p className="text-slate-300 text-sm mb-3 line-clamp-3">{note.content}</p>

              {/* Footer with Meta Info */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{note.author.username}</span>
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateNote}
        isLoading={isCreating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="ลบโน้ต"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteConfirmOpen(false)
          setDeletingNoteId(null)
        }}
        isLoading={isDeleting}
        confirmText="ลบโน้ต"
        cancelText="ยกเลิก"
      />
    </div>
  )
}
