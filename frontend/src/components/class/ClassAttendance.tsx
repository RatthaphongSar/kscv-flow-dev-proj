// frontend/src/components/class/ClassAttendance.tsx
import { useEffect, useState } from 'react';
import { Attendance, AttendanceSummary } from '../../types/class.types';
import classApi from '../../api/classApi';
import { Users, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ClassAttendanceProps {
  classId: string | null;
  userId?: string;
  userRole?: string;
}

export default function ClassAttendance({
  classId,
  userId,
  userRole,
}: ClassAttendanceProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (classId) {
      loadAttendance();
      if (userId) {
        loadSummary();
      }
    }
  }, [classId, userId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getAttendance(classId!);
      setAttendance(data);
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await classApi.getAttendanceSummary(classId!, userId!);
      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const handleMarkAttendance = async (
    studentId: string,
    status: 'present' | 'absent' | 'late' | 'excuse'
  ) => {
    try {
      await classApi.markAttendance(classId!, studentId, selectedDate, status);
      await loadAttendance();
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      present: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      absent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      late: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      excuse: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    };
    return colors[status] || colors.absent;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-96 bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Student Summary */}
      {summary && userRole === 'STUDENT' && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-5 border border-blue-200 dark:border-slate-500">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Your Attendance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Present</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.present}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Absent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.absent}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Late</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {summary.late}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Excuse</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.excuse}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.percentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Teacher: Mark Attendance */}
      {userRole === 'TEACHER' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-600">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Student
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Present
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Absent
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Late
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Excuse
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
                  {/* Mock students - in real app, fetch from API */}
                  {[1, 2, 3, 4].map((i) => (
                    <tr
                      key={i}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        Student {i}
                      </td>
                      {(['present', 'absent', 'late', 'excuse'] as const).map((status) => (
                        <td key={status} className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleMarkAttendance(`student-${i}`, status)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${getStatusColor(
                              status
                            )}`}
                          >
                            {status === 'present' && <CheckCircle2 className="w-4 h-4 inline" />}
                            {status === 'absent' && <XCircle className="w-4 h-4 inline" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      {userRole === 'STUDENT' && (
        <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-600">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance Records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {attendance.slice(0, 10).map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {record.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
