/**
 * ManageStudentsModal.tsx
 * Modal for managing class students and join requests (teacher view)
 */

import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Plus, Trash2 } from 'lucide-react';
import classApi from '../../api/classApi';

interface Student {
  id: string;
  username: string;
  email: string;
  major: string;
  year: number;
}

interface JoinRequest {
  id: string;
  status: string;
  student: Student;
  createdAt: string;
}

interface ManageStudentsModalProps {
  isOpen: boolean;
  classId: string;
  onClose: () => void;
}

export default function ManageStudentsModal({ isOpen, classId, onClose }: ManageStudentsModalProps) {
  const [tab, setTab] = useState<'students' | 'requests'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && classId) {
      loadData();
    }
  }, [isOpen, classId, tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (tab === 'students') {
        const data = await classApi.getClassStudents(classId);
        setStudents(data);
      } else {
        const data = await classApi.getJoinRequests(classId, 'pending');
        setJoinRequests(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (joinRequestId: string) => {
    try {
      await classApi.approveJoinRequest(joinRequestId);
      setJoinRequests(joinRequests.filter((r) => r.id !== joinRequestId));
      // Reload students list
      const students = await classApi.getClassStudents(classId);
      setStudents(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (joinRequestId: string) => {
    try {
      await classApi.rejectJoinRequest(joinRequestId, 'Rejected by teacher');
      setJoinRequests(joinRequests.filter((r) => r.id !== joinRequestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      // Find the enrollment ID for this student
      const studentData = students.find((s) => s.student?.id === studentId || s.id === studentId);
      if (studentData?.id) {
        await classApi.removeEnrollment(studentData.id);
        setStudents(students.filter((s) => s.student?.id !== studentId && s.id !== studentId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">จัดการนักเรียน</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-slate-700 px-6">
          <button
            onClick={() => setTab('students')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              tab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-blue-600'
            }`}
          >
            นักเรียนในคลาส ({students.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              tab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-blue-600'
            }`}
          >
            คำขอเข้าเรียน ({joinRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : tab === 'students' ? (
            // Students List
            <div className="space-y-2">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีนักเรียนในคลาส</p>
              ) : (
                students.map((enrollment) => {
                  const student = enrollment.student || enrollment;
                  return (
                    <div
                      key={enrollment.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded"
                    >
                      <div>
                        <p className="font-medium">{student.username}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email} • {student.major}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Join Requests
            <div className="space-y-2">
              {joinRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีคำขอเข้าเรียนรออนุมัติ</p>
              ) : (
                joinRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-slate-800 rounded"
                  >
                    <div>
                      <p className="font-medium">{request.student.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.student.email} • ขอเมื่อ{' '}
                        {new Date(request.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
