/**
 * ClassCreateModal.tsx
 * Modal for creating a new class and enrolling students
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import classApi from '../../api/classApi';

interface StudentOption {
  id: string;
  username: string;
  email: string;
  major: string;
  year: number;
}

interface ClassCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClass: any) => void;
}

export default function ClassCreateModal({ isOpen, onClose, onSuccess }: ClassCreateModalProps) {
  if (!isOpen) return null;

  return (
    <ClassCreateModalContent onClose={onClose} onSuccess={onSuccess} />
  );
}

function ClassCreateModalContent({ onClose, onSuccess }: Omit<ClassCreateModalProps, 'isOpen'>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [_searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    section: '1',
    credits: 3,
    semester: '',
    room: '',
    capacity: 30,
  });

  // Search students as user types
  const handleSearchStudents = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await classApi.searchStudents(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Add student to selection
  const handleAddStudent = (student: StudentOption) => {
    if (!selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Remove student from selection
  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== studentId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the class
      const newClass = await classApi.createClass(formData);

      // Enroll selected students
      if (selectedStudents.length > 0) {
        await classApi.enrollMultipleStudents(
          newClass.id,
          selectedStudents.map((s) => s.id)
        );
      }

      onSuccess(newClass);
      setFormData({
        code: '',
        name: '',
        section: '1',
        credits: 3,
        semester: '',
        room: '',
        capacity: 30,
      });
      setSelectedStudents([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">สร้างคลาสใหม่</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Information */}
            <div>
              <h3 className="font-semibold mb-4">ข้อมูลคลาส</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="รหัสวิชา (เช่น ENG-101)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="ชื่อวิชา"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="number"
                  placeholder="หน่วยกิจ"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="ภาคเรียน (เช่น 1/2567)"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="ห้องเรียน"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="number"
                  placeholder="จำนวนที่นั่ง"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Student Enrollment */}
            <div>
              <h3 className="font-semibold mb-4">เพิ่มนักเรียน</h3>

              {/* Search Box */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือ email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 pl-10"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border rounded shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {searchResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleAddStudent(student)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{student.username}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                        <Plus size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Students */}
              <div className="space-y-2">
                {selectedStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">ยังไม่มีนักเรียนที่เลือก</p>
                ) : (
                  selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900 rounded"
                    >
                      <div>
                        <div className="font-medium">{student.username}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email} • {student.major}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading || !formData.code || !formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้างคลาส'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
