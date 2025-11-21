// frontend/src/components/RoleSwitcher.tsx
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

export default function RoleSwitcher() {
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('TEACHER');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load role from localStorage
    const stored = localStorage.getItem('mockRole');
    if (stored === 'STUDENT' || stored === 'TEACHER') {
      setRole(stored);
    }
  }, []);

  const handleRoleChange = (newRole: 'TEACHER' | 'STUDENT') => {
    setRole(newRole);
    localStorage.setItem('mockRole', newRole);
    
    // Update user in AuthContext
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      user.role = newRole;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-2 mb-2">
        <User size={16} className="text-slate-400" />
        <span className="text-xs text-slate-400">Role:</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleRoleChange('TEACHER')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            role === 'TEACHER'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          👨‍🏫 Teacher
        </button>
        <button
          onClick={() => handleRoleChange('STUDENT')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            role === 'STUDENT'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          👨‍🎓 Student
        </button>
      </div>
    </div>
  );
}
