// frontend/src/pages/Class.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ClassInfo } from '../types/class.types';
import classApi from '../api/classApi';

// Components
import ClassSidebar from '../components/class/ClassSidebar';
import ClassHeader from '../components/class/ClassHeader';
import ClassOverview from '../components/class/ClassOverview';
import ClassAssignments from '../components/class/ClassAssignments';
import ClassAttendance from '../components/class/ClassAttendance';
import ClassGrades from '../components/class/ClassGrades';
import ClassMaterials from '../components/class/ClassMaterials';
import ClassCreateModal from '../components/class/ClassCreateModal';
import ManageStudentsModal from '../components/class/ManageStudentsModal';

type TabType = 'overview' | 'assignments' | 'attendance' | 'grades' | 'materials';

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'grades', label: 'Grades' },
  { id: 'materials', label: 'Materials' },
];

export default function ClassPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false);

  // Load selected class details
  useEffect(() => {
    if (selectedClassId) {
      loadClassDetails();
    }
  }, [selectedClassId]);

  const loadClassDetails = async () => {
    try {
      setClassLoading(true);
      setClassError(null);
      const data = await classApi.getClass(selectedClassId!);
      setClassData(data);
    } catch (err) {
      console.error('Error loading class:', err);
      setClassError('Failed to load class details');
    } finally {
      setClassLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-slate-300">Please login first</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-900 dark:text-white">
      {/* Sidebar */}
      <ClassSidebar selectedId={selectedClassId} onSelect={setSelectedClassId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Class Header */}
        {classData && (
          <ClassHeader 
            classData={classData} 
            loading={classLoading}
            userRole={user.role}
            onCreateClick={() => setShowCreateModal(true)}
            onManageStudentsClick={() => setShowManageStudentsModal(true)}
          />
        )}
        {!classData && (
          <ClassHeader classData={null} loading={classLoading} />
        )}

        {/* Tabs */}
        {classData && (
          <div className="bg-slate-800 border-b border-slate-700 px-6">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900">
          {classError && (
            <div className="m-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {classError}
            </div>
          )}

          {classData && (
            <>
              {activeTab === 'overview' && (
                <ClassOverview
                  classData={classData}
                  userId={user.id}
                  userRole={user.role}
                />
              )}

              {activeTab === 'assignments' && (
                <ClassAssignments
                  classId={classData.id}
                  userRole={user.role}
                />
              )}

              {activeTab === 'attendance' && (
                <ClassAttendance
                  classId={classData.id}
                  userId={user.id}
                  userRole={user.role}
                />
              )}

              {activeTab === 'grades' && (
                <ClassGrades
                  classId={classData.id}
                  userId={user.id}
                  userRole={user.role}
                />
              )}

              {activeTab === 'materials' && (
                <ClassMaterials
                  classId={classData.id}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClassCreateModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => {
          setShowCreateModal(false);
          // Refresh class list
        }}
      />
      {classData && (
        <ManageStudentsModal
          isOpen={showManageStudentsModal}
          classId={classData.id}
          onClose={() => setShowManageStudentsModal(false)}
        />
      )}
    </div>
  );
}
