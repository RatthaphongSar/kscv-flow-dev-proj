// frontend/src/components/class/ClassGrades.tsx
import { useEffect, useState } from 'react';
import { StudentGrades, GradeItem } from '../../types/class.types';
import classApi from '../../api/classApi';
import { Award, AlertCircle, Plus } from 'lucide-react';

interface ClassGradesProps {
  classId: string | null;
  userId?: string;
  userRole?: string;
}

export default function ClassGrades({
  classId,
  userId,
  userRole,
}: ClassGradesProps) {
  const [grades, setGrades] = useState<StudentGrades | null>(null);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    itemType: 'assignment',
    maxScore: '100',
    weight: '0.1',
    description: '',
  });

  useEffect(() => {
    if (classId && userRole === 'STUDENT' && userId) {
      loadStudentGrades();
    } else if (classId && userRole === 'TEACHER') {
      loadGradeItems();
    }
  }, [classId, userId, userRole]);

  const loadStudentGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getStudentGrades(classId!, userId!);
      setGrades(data);
    } catch (err) {
      console.error('Error loading grades:', err);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const loadGradeItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getGradeItems(classId!);
      setGradeItems(data);
    } catch (err) {
      console.error('Error loading grade items:', err);
      setError('Failed to load grade items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGradeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classApi.createGradeItem(classId!, {
        name: formData.name,
        itemType: formData.itemType,
        maxScore: parseFloat(formData.maxScore),
        weight: parseFloat(formData.weight),
        description: formData.description,
      });
      setFormData({
        name: '',
        itemType: 'assignment',
        maxScore: '100',
        weight: '0.1',
        description: '',
      });
      setShowForm(false);
      await loadGradeItems();
    } catch (err) {
      console.error('Error creating grade item:', err);
      setError('Failed to create grade item');
    }
  };

  const getGradeColor = (grade?: string) => {
    const colors: { [key: string]: string } = {
      A: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      B: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      C: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      D: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      F: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    };
    return colors[grade || 'F'] || colors.F;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-32 bg-slate-700 rounded animate-pulse"></div>
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

      {/* Student: Grade Summary */}
      {userRole === 'STUDENT' && grades && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Grade */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-6 border border-purple-200 dark:border-slate-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Overall Grade
                </h3>
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className={`text-5xl font-bold ${getGradeColor(grades.grade)}`}>
                {grades.grade}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {grades.totalScore.toFixed(1)} / {grades.totalMaxScore} points
              </p>
            </div>

            {/* Percentage */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-6 border border-blue-200 dark:border-slate-500">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Percentage
              </h3>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {grades.percentage}%
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${grades.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grade Details Table */}
          <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
            <div className="p-4 border-b border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Grade Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Item
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                  {grades.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                        <div>{item.gradeItem.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.gradeItem.itemType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                        {item.score.toFixed(1)} / {item.gradeItem.maxScore}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-900 dark:text-white">
                        {item.percentage?.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded font-semibold text-sm ${getGradeColor(
                            item.grade
                          )}`}
                        >
                          {item.grade || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {item.feedback || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Teacher: Manage Grade Items */}
      {userRole === 'TEACHER' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Grade Items
            </h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Grade Item
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreateGradeItem}
              className="bg-slate-100 dark:bg-slate-700 p-5 rounded-lg border border-slate-300 dark:border-slate-600 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
                  placeholder="e.g., Midterm Exam"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Type
                  </label>
                  <select
                    value={formData.itemType}
                    onChange={(e) =>
                      setFormData({ ...formData, itemType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="participation">Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) =>
                      setFormData({ ...formData, maxScore: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Weight (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Grade Items Table */}
          <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Max Score
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                  {gradeItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">
                        <span className="capitalize bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded text-xs">
                          {item.itemType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-900 dark:text-white">
                        {item.maxScore}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-900 dark:text-white">
                        {(item.weight * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
