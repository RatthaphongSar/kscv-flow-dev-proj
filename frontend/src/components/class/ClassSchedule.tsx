// frontend/src/components/class/ClassSchedule.tsx
import { useEffect, useState } from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import classApi from '../../api/classApi';

interface ScheduleItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  building?: string;
  type?: string; // lecture, lab, tutorial
}

interface ClassScheduleProps {
  classId: string | null;
}

export default function ClassSchedule({ classId }: ClassScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      loadSchedule();
    }
  }, [classId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getSchedule(classId!);
      setSchedule(data || []);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const thaiDaysOfWeek = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  const getScheduleForDay = (dayIndex: number) => {
    return schedule.filter((item) => item.dayOfWeek === dayIndex);
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'lecture':
        return 'bg-blue-600/20 border-blue-500/40 text-blue-300';
      case 'lab':
        return 'bg-green-600/20 border-green-500/40 text-green-300';
      case 'tutorial':
        return 'bg-purple-600/20 border-purple-500/40 text-purple-300';
      default:
        return 'bg-violet-600/20 border-violet-500/40 text-violet-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-violet-500" />
        <h2 className="text-lg font-semibold text-gray-100">Class Schedule</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {schedule.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No schedule information available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {daysOfWeek.map((day, index) => {
            const daySchedules = getScheduleForDay(index);
            return (
              <div
                key={day}
                className="p-4 rounded-lg bg-[#020617] border border-[#1f2937] hover:border-[#374151] transition"
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-100">
                    {thaiDaysOfWeek[index]} ({day})
                  </h3>
                </div>

                {daySchedules.length === 0 ? (
                  <p className="text-xs text-gray-500">No class</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} />
                          <span className="text-sm font-semibold">
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>

                        {item.type && (
                          <div className="text-xs mb-1 capitalize">
                            {item.type}
                          </div>
                        )}

                        {item.room && (
                          <div className="text-xs">
                            Room: <span className="font-medium">{item.room}</span>
                          </div>
                        )}

                        {item.building && (
                          <div className="text-xs">
                            Building: <span className="font-medium">{item.building}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Table View */}
      {schedule.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  <th className="px-4 py-2 text-left text-gray-300 font-semibold">Day</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-semibold">Time</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-semibold">Type</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item) => (
                  <tr key={item.id} className="border-b border-[#0f172a] hover:bg-[#0f172a] transition">
                    <td className="px-4 py-3 text-gray-300 capitalize">
                      {daysOfWeek.indexOf(item.dayOfWeek) >= 0
                        ? thaiDaysOfWeek[daysOfWeek.indexOf(item.dayOfWeek)]
                        : item.dayOfWeek}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {item.startTime} - {item.endTime}
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize">
                      {item.type || 'Lecture'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {item.building && `${item.building} - `}
                      {item.room || '-'}
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
