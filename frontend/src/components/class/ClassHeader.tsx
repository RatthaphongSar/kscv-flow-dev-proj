// frontend/src/components/class/ClassHeader.tsx
import { ClassInfo } from '../../types/class.types';
import { BookOpen, Users, MapPin, Award, Plus, Settings } from 'lucide-react';

interface ClassHeaderProps {
  classData: ClassInfo | null;
  loading?: boolean;
  userRole?: string;
  onCreateClick?: () => void;
  onManageStudentsClick?: () => void;
}

export default function ClassHeader({ 
  classData, 
  loading, 
  userRole,
  onCreateClick,
  onManageStudentsClick
}: ClassHeaderProps) {
  if (loading || !classData) {
    return (
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-6 animate-pulse">
        <div className="h-8 bg-slate-600 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-600 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{classData.name}</h1>
          <p className="text-slate-400 text-sm">{classData.code} • Section {classData.section}</p>
        </div>
        
        {/* Action Buttons */}
        {userRole === 'TEACHER' && (
          <div className="flex gap-2">
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              title="Create new class"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">สร้างคลาส</span>
            </button>
            <button
              onClick={onManageStudentsClick}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
              title="Manage students"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">จัดการนักเรียน</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs text-slate-400">Credits</p>
            <p className="font-semibold text-white">{classData.credits}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs text-slate-400">Instructor</p>
            <p className="font-semibold text-white text-sm">{classData.teacher.username}</p>
          </div>
        </div>

        {classData.room && (
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-slate-400">Room</p>
              <p className="font-semibold text-white">{classData.room}</p>
            </div>
          </div>
        )}

        {classData.semester && (
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-slate-400">Semester</p>
              <p className="font-semibold text-white text-sm">{classData.semester}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
