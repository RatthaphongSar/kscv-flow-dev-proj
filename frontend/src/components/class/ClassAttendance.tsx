// frontend/src/components/class/ClassAttendance.tsx
import { useEffect, useState } from 'react';
import { Attendance, AttendanceSummary } from '../../types/class.types';
import classApi from '../../api/classApi';
import { Users, AlertCircle, CheckCircle2, XCircle, Settings, Calendar } from 'lucide-react';
import AttendanceSessionModal from './AttendanceSessionModal';

interface AttendanceSession {
  id: string;
  subject: string;
  type: 'lesson' | 'midterm' | 'final' | 'quiz' | 'collection';
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  createdAt?: string;
  _count?: {
    attendances: number;
  };
}

const typeLabels: { [key: string]: string } = {
  lesson: 'เรียน',
  midterm: 'สอบกลางภาค',
  final: 'สอบปลายภาค',
  quiz: 'สอบย่อย',
  collection: 'เก็บคะแนน',
};

const typeColors: { [key: string]: string } = {
  lesson: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  midterm: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  final: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  quiz: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  collection: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
};

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
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    if (classId) {
      loadAttendance();
      loadSessions();
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

  const loadSessions = async () => {
    try {
      const data = await classApi.getAttendanceSessions(classId!);
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
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

      {/* Teacher: Attendance Management */}
      {userRole === 'TEACHER' && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              การเข้าเรียน ({sessions.length} รอบ)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ตั้งค่าช่วงเรียน สอบ หรือเก็บคะแนน
            </p>
          </div>
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            <Settings size={16} />
            ตั้งค่า
          </button>
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

      {/* Attendance Sessions List (For All Users) */}
      {sessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
            {userRole === 'STUDENT' ? 'รอบการเข้าเรียน' : 'Session Attendance'}
          </h3>
          <div className="grid gap-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[session.type]}`}>
                        {typeLabels[session.type]}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {session.subject}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {session.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            สร้างเมื่อ: {(() => {
                              try {
                                const date = new Date(session.createdAt);
                                if (isNaN(date.getTime())) return 'Invalid Date';
                                return date.toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }) + ' ' + date.toLocaleTimeString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });
                              } catch {
                                return 'Invalid Date';
                              }
                            })()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          ช่วงเวลา: {(() => {
                            try {
                              const startDate = new Date(session.startDate);
                              if (isNaN(startDate.getTime())) return 'Invalid Date';
                              let result = startDate.toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              });
                              if (session.endDate) {
                                const endDate = new Date(session.endDate);
                                if (!isNaN(endDate.getTime())) {
                                  result += ` ถึง ${endDate.toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })}`;
                                }
                              }
                              return result;
                            } catch {
                              return 'Invalid Date';
                            }
                          })()}
                        </span>
                      </div>
                      {session.description && (
                        <div className="text-slate-500 dark:text-slate-400 mt-1">{session.description}</div>
                      )}
                    </div>

                    {userRole !== 'STUDENT' && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        นักเรียนเข้าแล้ว: {session._count?.attendances || 0} คน
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : session.status === 'completed'
                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {session.status === 'active' ? 'กำลังดำเนิน' : session.status === 'completed' ? 'สิ้นสุด' : 'ยกเลิก'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Attendance Session Modal */}
      <AttendanceSessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        classId={classId!}
        onSessionsUpdated={loadAttendance}
      />
    </div>
  );
}
