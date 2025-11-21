// frontend/src/components/class/ClassOverview.tsx
import { useEffect, useState } from 'react';
import { ClassInfo, ClassSummary, AnnouncementPin } from '../../types/class.types';
import classApi from '../../api/classApi';
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface ClassOverviewProps {
  classData: ClassInfo | null;
  userId?: string;
  userRole?: string;
}

export default function ClassOverview({
  classData,
  userId,
  userRole,
}: ClassOverviewProps) {
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classData?.id) {
      loadData();
    }
  }, [classData?.id, userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, announcementsData] = await Promise.all([
        classApi.getClassSummary(classData!.id, userId),
        classApi.getAnnouncements(classData!.id),
      ]);

      setSummary(summaryData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Error loading overview:', err);
      setError('Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-24 bg-slate-700 rounded animate-pulse"></div>
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

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-800 rounded-lg p-5 border border-orange-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Latest Announcement</h3>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 2).map((ann) => (
              <div key={ann.id} className="p-3 bg-white dark:bg-slate-600 rounded border border-orange-100 dark:border-slate-500">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{ann.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assignments Card */}
          {summary.totalAssignments !== undefined && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-5 border border-blue-200 dark:border-slate-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Assignments</h4>
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.submittedAssignments ?? 0}/{summary.totalAssignments}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">submitted</p>
                </div>
                {summary.pendingAssignments !== undefined && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    {summary.pendingAssignments} pending
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Card */}
          {summary.attendancePercentage !== undefined && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-5 border border-green-200 dark:border-slate-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Attendance</h4>
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summary.attendancePercentage}%
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">attendance rate</p>
              </div>
            </div>
          )}

          {/* Grades Card */}
          {summary.currentPercentage !== undefined && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-5 border border-purple-200 dark:border-slate-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Current Grade</h4>
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summary.currentPercentage}%
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {summary.currentScore || 0} / {summary.maxScore || 0} points
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students Count (Teacher view) */}
      {userRole === 'TEACHER' && summary?.totalStudents !== undefined && (
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">{summary.totalStudents}</strong> students
            enrolled
          </p>
        </div>
      )}
    </div>
  );
}
