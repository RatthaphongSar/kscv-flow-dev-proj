// frontend/src/components/class/ClassSidebar.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ClassInfo } from '../../types/class.types';
import classApi from '../../api/classApi';

interface ClassSidebarProps {
  selectedId: string | null;
  onSelect: (classId: string) => void;
}

export default function ClassSidebar({ selectedId, onSelect }: ClassSidebarProps) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getClasses();
      setClasses(data);
      if (data.length > 0 && !selectedId) {
        onSelect(data[0].id);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const getDayTime = (cls: ClassInfo) => {
    // Mock: in real app, fetch from schedule
    const mockSchedules: { [key: string]: string } = {
      'Mon/Wed': '09:00-10:30',
      'Tue/Thu': '13:00-15:00',
      'Fri': '10:00-12:00',
    };
    return mockSchedules[cls.code] || '08:00-09:00';
  };

  if (loading) {
    return (
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4 flex items-center justify-center">
        <p className="text-slate-400">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 z-10">
        <h2 className="text-lg font-semibold text-white">My Classes</h2>
        <p className="text-xs text-slate-400 mt-1">{classes.length} classes</p>
      </div>

      {/* Classes List */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 p-4 space-y-2">
        {classes.length === 0 ? (
          <p className="text-slate-400 text-sm">No classes yet</p>
        ) : (
          classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedId === cls.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              <div className="font-semibold text-sm">{cls.code}</div>
              <div className="text-xs text-slate-300 truncate">{cls.name}</div>
              <div className="text-xs text-slate-400 mt-1">{getDayTime(cls)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
