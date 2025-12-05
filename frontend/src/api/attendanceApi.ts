// frontend/src/api/attendanceApi.ts

import { api } from '../utils/api.js';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  remark?: string;
  checkinTime?: string;
}

export const attendanceApi = {
  /**
   * Check-in (checkline) for attendance
   */
  async checkIn(classId: string, date: string, status: 'present' | 'late' | 'absent', remark?: string): Promise<AttendanceRecord> {
    const response: any = await api('/attendance/checkin', {
      method: 'POST',
      body: {
        classId,
        date,
        status,
        remark
      }
    });
    return response?.data;
  },

  /**
   * Get my attendance records
   */
  async getMyAttendance(classId?: string, month?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (month) params.append('month', month);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response: any = await api(`/attendance/my${query}`, {
      method: 'GET'
    });
    return response?.data || [];
  },

  /**
   * Get attendance by class (for teacher/advisor)
   */
  async getAttendanceByClass(classId: string, date?: string): Promise<AttendanceRecord[]> {
    const query = date ? `?date=${date}` : '';
    const response: any = await api(`/attendance/class/${classId}${query}`, {
      method: 'GET'
    });
    return response?.data || [];
  },

  /**
   * Get attendance summary for a period
   */
  async getAttendanceSummary(classId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response: any = await api(`/attendance/summary/${classId}${query}`, {
      method: 'GET'
    });
    return response?.data;
  }
};
