// frontend/src/components/class/ClassStudents.tsx
import { useEffect, useState } from 'react';
import { Users, AlertCircle, Plus, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react';
import classApi from '../../api/classApi';
import { JoinRequest } from '../../types/class.types';

interface Student {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  year?: number;
  major?: string;
}

interface ClassStudentsProps {
  classId: string | null;
  userRole?: string;
}

export default function ClassStudents({ classId, userRole }: ClassStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [enrollmentData, setEnrollmentData] = useState({
    studentId: '',
  });
  const [processingJoinRequest, setProcessingJoinRequest] = useState<string | null>(null);

  useEffect(() => {
    if (classId && userRole === 'TEACHER') {
      loadData();
    }
  }, [classId, userRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, joinRequestsData] = await Promise.all([
        classApi.getClassStudents(classId!),
        classApi.getJoinRequests(classId!),
      ]);
      setStudents(studentsData || []);
      setJoinRequests(joinRequestsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData.studentId.trim()) {
      alert('Please enter a student ID');
      return;
    }

    try {
      await classApi.enrollStudent(classId!, enrollmentData.studentId);
      setEnrollmentData({ studentId: '' });
      setShowAddForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error enrolling student:', err);
      alert(err.response?.data?.error || 'Failed to enroll student');
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      await classApi.removeEnrollment(enrollmentId);
      setShowRemoveConfirm(null);
      await loadData();
    } catch (err: any) {
      console.error('Error removing student:', err);
      alert(err.response?.data?.error || 'Failed to remove student');
    }
  };

  const handleApproveJoinRequest = async (joinRequestId: string) => {
    try {
      setProcessingJoinRequest(joinRequestId);
      await classApi.approveJoinRequest(joinRequestId);
      await loadData();
    } catch (err: any) {
      console.error('Error approving join request:', err);
      alert(err.response?.data?.error || 'Failed to approve join request');
    } finally {
      setProcessingJoinRequest(null);
    }
  };

  const handleRejectJoinRequest = async (joinRequestId: string) => {
    try {
      setProcessingJoinRequest(joinRequestId);
      const reason = prompt('Enter rejection reason (optional):');
      await classApi.rejectJoinRequest(joinRequestId, reason || undefined);
      await loadData();
    } catch (err: any) {
      console.error('Error rejecting join request:', err);
      alert(err.response?.data?.error || 'Failed to reject join request');
    } finally {
      setProcessingJoinRequest(null);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading students...</div>
      </div>
    );
  }

  // Only show for teachers
  if (userRole !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="text-sm text-gray-400">
          <p className="font-medium">This feature is only available for teachers</p>
          <p className="text-xs text-gray-500 mt-1">Only teacher accounts can manage class enrollment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Join Requests Section */}
      {joinRequests && joinRequests.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-600/10 border border-blue-500/30">
          <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <AlertCircle size={16} />
            Pending Join Requests ({joinRequests.length})
          </h3>
          
          <div className="space-y-2">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#020617] border border-blue-500/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100">{request.student?.username || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{request.student?.email || 'No email'}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleApproveJoinRequest(request.id)}
                    disabled={processingJoinRequest === request.id}
                    className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50 transition"
                    title="Approve"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleRejectJoinRequest(request.id)}
                    disabled={processingJoinRequest === request.id}
                    className="p-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 disabled:opacity-50 transition"
                    title="Reject"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-100">
            Class Members ({students.length})
          </h2>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEnrollmentData({ studentId: '' });
          }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Add Student Form */}
      {showAddForm && (
        <form onSubmit={handleEnrollStudent} className="space-y-3 p-4 rounded-lg bg-[#020617] border border-violet-500/30">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Student ID or Username *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={enrollmentData.studentId}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, studentId: e.target.value })}
                placeholder="Enter student ID"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition"
              >
                Enroll
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
        />
      </div>

      {/* Students List */}
      <div className="space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {searchQuery ? 'No students match your search' : 'No students enrolled yet'}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[#020617] border border-[#1f2937] hover:border-[#374151] transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-100">{student.username}</span>
                  {student.year && (
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                      Year {student.year}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-400 space-y-0.5">
                  {student.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.major && (
                    <div className="text-xs text-gray-500">{student.major}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Remove Button */}
                {showRemoveConfirm === student.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowRemoveConfirm(null)}
                      className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRemoveConfirm(student.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition"
                    title="Remove student"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-[#020617] border border-[#1f2937]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-500">{students.length}</div>
              <div className="text-xs text-gray-400">Total Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {students.filter((s) => s.year === 1).length}
              </div>
              <div className="text-xs text-gray-400">Year 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {new Set(students.map((s) => s.major)).size}
              </div>
              <div className="text-xs text-gray-400">Majors</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
