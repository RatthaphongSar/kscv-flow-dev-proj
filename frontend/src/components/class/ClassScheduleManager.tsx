/**
 * ClassScheduleManager.tsx
 * Teacher's schedule and assignment planning interface with calendar
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, Clock, AlertCircle } from 'lucide-react';
import classApi from '../../api/classApi';

interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 0-6 (Monday-Sunday)
  startTime: string; // HH:mm
  endTime: string;
  room?: string;
  building?: string;
  type?: 'lecture' | 'lab' | 'tutorial';
}

interface AssignmentPlan {
  id: string;
  title: string;
  dueDate: string;
  assignmentType: 'homework' | 'quiz' | 'project' | 'exam';
  maxScore: number;
  description?: string;
}

interface ClassScheduleManagerProps {
  classId: string;
  className: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const THAI_DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

export default function ClassScheduleManager({ classId }: ClassScheduleManagerProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'assignments'>('schedule');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentPlan | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:30',
    room: '',
    building: '',
    type: 'lecture' as const,
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<{
    title: string;
    dueDate: string;
    assignmentType: 'homework' | 'quiz' | 'project' | 'exam';
    maxScore: number;
    description: string;
  }>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignmentType: 'homework',
    maxScore: 100,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scheduleData, assignmentData] = await Promise.all([
        classApi.getSchedule(classId).catch(() => []),
        classApi.getClassAssignments(classId).catch(() => []),
      ]);
      setSchedule(scheduleData || []);
      setAssignments((assignmentData || []) as AssignmentPlan[]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load schedule and assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        // Update existing schedule
        const updated = { ...editingSchedule, ...scheduleForm };
        await classApi.updateSchedule(classId, editingSchedule.id, scheduleForm);
        setSchedule(schedule.map(s => s.id === editingSchedule.id ? updated : s));
        setEditingSchedule(null);
      } else {
        // Create new schedule
        const newScheduleData = await classApi.createSchedule(classId, scheduleForm);
        const newSchedule: ScheduleItem = {
          id: newScheduleData?.id || `schedule-${Date.now()}`,
          ...scheduleForm,
        };
        setSchedule([...schedule, newSchedule]);
      }
      setScheduleForm({
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '10:30',
        room: '',
        building: '',
        type: 'lecture',
      });
      setShowScheduleForm(false);
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule');
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        // Update existing assignment
        const updated = { ...editingAssignment, ...assignmentForm };
        await classApi.updateAssignmentPlan(classId, editingAssignment.id, assignmentForm);
        setAssignments(assignments.map(a => a.id === editingAssignment.id ? updated : a));
        setEditingAssignment(null);
      } else {
        // Create new assignment
        const newAssignmentData = await classApi.createAssignmentPlan(classId, assignmentForm);
        const newAssignment: AssignmentPlan = {
          id: newAssignmentData?.id || `assignment-${Date.now()}`,
          ...assignmentForm,
        };
        setAssignments([...assignments, newAssignment]);
      }
      setAssignmentForm({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        assignmentType: 'homework',
        maxScore: 100,
        description: '',
      });
      setShowAssignmentForm(false);
    } catch (err) {
      console.error('Error saving assignment:', err);
      alert('Failed to save assignment');
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Delete this schedule?')) {
      classApi.deleteSchedule(classId, id).then(() => {
        setSchedule(schedule.filter(s => s.id !== id));
      }).catch(err => {
        console.error('Error deleting schedule:', err);
        alert('Failed to delete schedule');
      });
    }
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Delete this assignment?')) {
      classApi.deleteAssignmentPlan(classId, id).then(() => {
        setAssignments(assignments.filter(a => a.id !== id));
      }).catch(err => {
        console.error('Error deleting assignment:', err);
        alert('Failed to delete assignment');
      });
    }
  };

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAssignmentColor = (type: string) => {
    switch (type) {
      case 'homework':
        return 'bg-blue-600/20 border-blue-500 text-blue-300';
      case 'quiz':
        return 'bg-purple-600/20 border-purple-500 text-purple-300';
      case 'project':
        return 'bg-green-600/20 border-green-500 text-green-300';
      case 'exam':
        return 'bg-red-600/20 border-red-500 text-red-300';
      default:
        return 'bg-slate-600/20 border-slate-500 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading schedule and assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-gray-100">จัดการตารางเรียน & แผนส่งงาน</h2>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          ตารางเรียน
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          แผนส่งงาน
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-200">ตารางเรียนรายสัปดาห์</h3>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setShowScheduleForm(!showScheduleForm);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              เพิ่มตารางเรียน
            </button>
          </div>

          {/* Schedule Form */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleSubmit} className="space-y-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
              <h4 className="font-semibold text-gray-200 mb-4">
                {editingSchedule ? 'แก้ไขตารางเรียน' : 'เพิ่มตารางเรียนใหม่'}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Day of Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">วันในสัปดาห์</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <option key={idx} value={idx}>
                        {THAI_DAYS[idx]} ({day})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ประเภท</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="lecture">บรรยาย (Lecture)</option>
                    <option value="lab">ห้องปฏิบัติการ (Lab)</option>
                    <option value="tutorial">ทำเนียบ (Tutorial)</option>
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">เวลาเริ่มต้น</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Building */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">อาคาร</label>
                  <input
                    type="text"
                    value={scheduleForm.building}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, building: e.target.value })}
                    placeholder="เช่น อาคาร A"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={scheduleForm.room}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                    placeholder="เช่น 302"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors font-medium"
                >
                  {editingSchedule ? 'อัปเดต' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          )}

          {/* Schedule List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-400">
                ยังไม่มีตารางเรียน
              </div>
            ) : (
              schedule.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-100">{THAI_DAYS[item.dayOfWeek]}</h4>
                      <p className="text-sm text-slate-400">{DAYS_OF_WEEK[item.dayOfWeek]}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                      {item.type || 'lecture'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span>{item.startTime} - {item.endTime}</span>
                    </div>
                    {item.building && <p className="text-sm text-slate-400">อาคาร: {item.building}</p>}
                    {item.room && <p className="text-sm text-slate-400">ห้อง: {item.room}</p>}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setEditingSchedule(item);
                        setScheduleForm({
                          dayOfWeek: item.dayOfWeek,
                          startTime: item.startTime,
                          endTime: item.endTime,
                          room: item.room || '',
                          building: item.building || '',
                          type: (item.type || 'lecture') as any,
                        });
                        setShowScheduleForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-sm text-slate-300 hover:text-violet-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-sm text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-200">แผนส่งงาน</h3>
            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowAssignmentForm(!showAssignmentForm);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              เพิ่มแผนส่งงาน
            </button>
          </div>

          {/* Assignment Form */}
          {showAssignmentForm && (
            <form onSubmit={handleAssignmentSubmit} className="space-y-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
              <h4 className="font-semibold text-gray-200 mb-4">
                {editingAssignment ? 'แก้ไขแผนส่งงาน' : 'เพิ่มแผนส่งงานใหม่'}
              </h4>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ชื่องาน</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    placeholder="เช่น บันทึกการทดลอง"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">คำอธิบาย</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    placeholder="รายละเอียดงาน"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ประเภท</label>
                    <select
                      value={assignmentForm.assignmentType}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="homework">การบ้าน</option>
                      <option value="quiz">แบบทดสอบ</option>
                      <option value="project">โครงงาน</option>
                      <option value="exam">สอบ</option>
                    </select>
                  </div>

                  {/* Max Score */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">คะแนนสูงสุด</label>
                    <input
                      type="number"
                      value={assignmentForm.maxScore}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">กำหนดส่ง</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentForm(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors font-medium"
                >
                  {editingAssignment ? 'อัปเดต' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          )}

          {/* Assignments List */}
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                ยังไม่มีแผนส่งงาน
              </div>
            ) : (
              assignments
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${getAssignmentColor(item.assignmentType)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-100">{item.title}</h4>
                        {item.description && <p className="text-sm text-slate-400 mt-1">{item.description}</p>}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                        {item.maxScore} คะแนน
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.dueDate).toLocaleDateString('th-TH')}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAssignment(item);
                            const assignmentType = item.assignmentType as 'homework' | 'quiz' | 'project' | 'exam';
                            setAssignmentForm({
                              title: item.title,
                              dueDate: item.dueDate,
                              assignmentType: assignmentType || 'homework',
                              maxScore: item.maxScore,
                              description: item.description || '',
                            });
                            setShowAssignmentForm(true);
                          }}
                          className="p-1 hover:opacity-70 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(item.id)}
                          className="p-1 hover:opacity-70 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Calendar View */}
          {assignments.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-200">ปฏิทินส่งงาน</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prev = new Date(currentMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentMonth(prev);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-gray-200"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const next = new Date(currentMonth);
                      next.setMonth(next.getMonth() + 1);
                      setCurrentMonth(next);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-gray-200"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">
                  {currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayAssignments = assignments.filter(a => a.dueDate === dateStr);
                    
                    return (
                      <div
                        key={i + 1}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                          dayAssignments.length > 0
                            ? 'bg-violet-600/30 border border-violet-500 text-violet-300'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                        title={dayAssignments.map(a => a.title).join(', ')}
                      >
                        {i + 1}
                        {dayAssignments.length > 0 && (
                          <div className="text-[10px] mt-0.5">•{dayAssignments.length}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
