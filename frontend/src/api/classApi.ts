// frontend/src/api/classApi.ts

import { api } from '../utils/api';
import {
  ClassInfo,
  Assignment,
  Attendance,
  StudentGrades,
  ClassSummary,
  GradeItem,
  AttendanceSummary,
  AnnouncementPin,
} from '../types/class.types';

// ==================== CLASS LISTING & DETAILS ====================

export const classApi = {
  /**
   * Get all classes for current user
   */
  async getClasses(): Promise<ClassInfo[]> {
    const response: any = await api('/classes', { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Get single class details
   */
  async getClass(classId: string): Promise<ClassInfo> {
    const response: any = await api(`/classes/${classId}`, { method: 'GET' });
    return response?.data;
  },

  /**
   * Get class summary
   */
  async getClassSummary(classId: string, studentId?: string): Promise<ClassSummary> {
    const query = studentId ? `?userId=${studentId}` : '';
    const response: any = await api(`/classes/${classId}/summary${query}`, { method: 'GET' });
    return response?.data;
  },

  // ==================== CLASS MANAGEMENT ====================

  /**
   * Create class
   */
  async createClass(classData: {
    code: string;
    name: string;
    section: string;
    credits?: number;
    semester?: string;
    room?: string;
    capacity?: number;
  }): Promise<ClassInfo> {
    const response: any = await api('/classes', {
      method: 'POST',
      body: classData,
    });
    return response?.data;
  },

  /**
   * Update class
   */
  async updateClass(classId: string, updates: Partial<ClassInfo>): Promise<ClassInfo> {
    const response: any = await api(`/classes/${classId}`, {
      method: 'PATCH',
      body: updates,
    });
    return response?.data;
  },

  /**
   * Delete class
   */
  async deleteClass(classId: string): Promise<void> {
    await api(`/classes/${classId}`, { method: 'DELETE' });
  },

  // ==================== ENROLLMENT ====================

  /**
   * Get students in a class
   */
  async getClassStudents(classId: string) {
    const response: any = await api(`/classes/${classId}/students`, { method: 'GET' });
    return response?.data;
  },

  /**
   * Enroll student to class
   */
  async enrollStudent(classId: string, studentId: string) {
    const response: any = await api(`/classes/${classId}/enroll`, {
      method: 'POST',
      body: { studentId },
    });
    return response?.data;
  },

  // ==================== ASSIGNMENTS ====================

  /**
   * Get assignments for a class (alias)
   */
  async getClassAssignments(classId: string): Promise<Assignment[]> {
    return this.getAssignments(classId);
  },

  /**
   * Get assignments for a class
   */
  async getAssignments(classId: string): Promise<Assignment[]> {
    const response: any = await api(`/classes/${classId}/assignments`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Create assignment
   */
  async createAssignment(
    classId: string,
    assignmentData: {
      title: string;
      description?: string;
      maxScore?: number;
      dueDate: string;
      assignmentType?: string;
    }
  ): Promise<Assignment> {
    const response: any = await api(`/classes/${classId}/assignments`, {
      method: 'POST',
      body: assignmentData,
    });
    return response?.data;
  },

  /**
   * Update assignment
   */
  async updateAssignment(classId: string, assignmentId: string, updates: Partial<Assignment>) {
    const response: any = await api(`/classes/${classId}/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: updates,
    });
    return response?.data;
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(classId: string, assignmentId: string): Promise<void> {
    await api(`/classes/${classId}/assignments/${assignmentId}`, { method: 'DELETE' });
  },

  /**
   * Get submissions for an assignment
   */
  async getSubmissions(classId: string, assignmentId: string) {
    const response: any = await api(
      `/classes/${classId}/assignments/${assignmentId}/submissions`,
      { method: 'GET' }
    );
    return response?.data;
  },

  // ==================== ATTENDANCE ====================

  /**
   * Get attendance for a class
   */
  async getAttendance(classId: string): Promise<Attendance[]> {
    const response: any = await api(`/classes/${classId}/attendance`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Mark attendance for a student
   */
  async markAttendance(
    classId: string,
    studentId: string,
    date: string,
    status: 'present' | 'absent' | 'late' | 'excuse'
  ) {
    const response: any = await api(`/classes/${classId}/attendance/mark`, {
      method: 'POST',
      body: { studentId, date, status },
    });
    return response?.data;
  },

  /**
   * Get attendance summary for a student
   */
  async getAttendanceSummary(classId: string, studentId: string): Promise<AttendanceSummary> {
    const response: any = await api(`/classes/${classId}/attendance/${studentId}`, {
      method: 'GET',
    });
    return response?.data;
  },

  // ==================== GRADES ====================

  /**
   * Get all grade items for a class
   */
  async getGradeItems(classId: string): Promise<GradeItem[]> {
    const response: any = await api(`/classes/${classId}/grade-items`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Create grade item
   */
  async createGradeItem(
    classId: string,
    gradeItemData: {
      name: string;
      itemType?: string;
      maxScore?: number;
      weight?: number;
      description?: string;
    }
  ): Promise<GradeItem> {
    const response: any = await api(`/classes/${classId}/grade-items`, {
      method: 'POST',
      body: gradeItemData,
    });
    return response?.data;
  },

  /**
   * Get grades for a student
   */
  async getStudentGrades(classId: string, studentId: string): Promise<StudentGrades> {
    const response: any = await api(`/classes/${classId}/grades/${studentId}`, {
      method: 'GET',
    });
    return response?.data;
  },

  /**
   * Create grade record
   */
  async createGradeRecord(
    classId: string,
    gradeData: {
      gradeItemId: string;
      studentId: string;
      score: number;
      feedback?: string;
    }
  ) {
    const response: any = await api(`/classes/${classId}/grades`, {
      method: 'POST',
      body: gradeData,
    });
    return response?.data;
  },

  // ==================== SCHEDULE ====================

  /**
   * Get class schedule
   */
  async getSchedule(classId: string) {
    const response: any = await api(`/classes/${classId}/schedule`, { method: 'GET' });
    return response?.data;
  },

  // ==================== ANNOUNCEMENTS ====================

  /**
   * Get announcements for a class
   */
  async getAnnouncements(classId: string): Promise<AnnouncementPin[]> {
    const response: any = await api(`/classes/${classId}/announcements`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Create announcement
   */
  async createAnnouncement(
    classId: string,
    announcementData: { title: string; content: string }
  ): Promise<AnnouncementPin> {
    const response: any = await api(`/classes/${classId}/announcements`, {
      method: 'POST',
      body: announcementData,
    });
    return response?.data;
  },

  // ==================== ENROLLMENT MANAGEMENT ====================

  /**
   * Search students for enrollment
   */
  async searchStudents(_query: string, _limit = 10) {
    const response: any = await api('/enrollment/search/students', {
      method: 'GET',
    });
    return response?.data;
  },

  /**
   * Enroll multiple students at once
   */
  async enrollMultipleStudents(classId: string, studentIds: string[]) {
    const response: any = await api(`/classes/${classId}/enroll-multiple`, {
      method: 'POST',
      body: { studentIds },
    });
    return response?.data;
  },

  /**
   * Remove student from class
   */
  async removeEnrollment(enrollmentId: string) {
    const response: any = await api(`/enrollment/enrollment/${enrollmentId}`, {
      method: 'DELETE',
    });
    return response;
  },

  // ==================== JOIN REQUESTS ====================

  /**
   * Request to join a class (student)
   */
  async requestToJoinClass(classId: string) {
    const response: any = await api(`/classes/${classId}/join-request`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Get pending join requests for a class (teacher)
   */
  async getJoinRequests(classId: string, _status = 'pending') {
    const response: any = await api(`/classes/${classId}/join-requests`, {
      method: 'GET',
    });
    return response?.data;
  },

  /**
   * Approve a join request (teacher)
   */
  async approveJoinRequest(joinRequestId: string) {
    const response: any = await api(`/classes/join-requests/${joinRequestId}/approve`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Reject a join request (teacher)
   */
  async rejectJoinRequest(joinRequestId: string, reason?: string) {
    const response: any = await api(`/classes/join-requests/${joinRequestId}/reject`, {
      method: 'POST',
      body: { reason },
    });
    return response?.data;
  },

  // ==================== ASSIGNMENT SUBMISSIONS ====================

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentId: string, submissionData: { fileUrl?: string; content?: string }) {
    const response: any = await api(`/assignments-ext/${assignmentId}/submit`, {
      method: 'POST',
      body: submissionData,
    });
    return response?.data;
  },

  /**
   * Cancel assignment submission
   */
  async cancelSubmission(assignmentId: string) {
    const response: any = await api(`/assignments-ext/${assignmentId}/cancel-submission`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Grade an assignment submission (teacher)
   */
  async gradeSubmission(
    assignmentId: string,
    studentId: string,
    score: number,
    feedback?: string
  ) {
    const response: any = await api(`/assignments-ext/${assignmentId}/grade`, {
      method: 'POST',
      body: { studentId, score, feedback },
    });
    return response?.data;
  },

  /**
   * Request resubmission of assignment (teacher)
   */
  async requestResubmission(assignmentId: string, studentId: string, feedback?: string) {
    const response: any = await api(`/assignments-ext/${assignmentId}/request-resubmit`, {
      method: 'POST',
      body: { studentId, feedback },
    });
    return response?.data;
  },

  /**
   * Get submission statistics
   */
  async getSubmissionStats(assignmentId: string, classId: string) {
    const response: any = await api(`/assignments-ext/${assignmentId}/stats/${classId}`, {
      method: 'GET',
    });
    return response?.data;
  },

  // ==================== TEACHING MATERIALS ====================

  /**
   * Get teaching materials for a class
   */
  async getMaterials(classId: string) {
    const response: any = await api(`/materials/${classId}/materials`, { method: 'GET' });
    return response?.data;
  },

  /**
   * Add teaching material (teacher)
   */
  async addMaterial(
    classId: string,
    materialData: {
      title: string;
      description?: string;
      type: 'FILE' | 'LINK';
      fileUrl?: string;
      linkUrl?: string;
      fileType?: string;
    }
  ) {
    const response: any = await api(`/materials/${classId}/materials`, {
      method: 'POST',
      body: materialData,
    });
    return response?.data;
  },

  /**
   * Update teaching material (teacher)
   */
  async updateMaterial(
    materialId: string,
    updateData: {
      title?: string;
      description?: string;
      fileUrl?: string;
      linkUrl?: string;
      fileType?: string;
    }
  ) {
    const response: any = await api(`/materials/materials/${materialId}`, {
      method: 'PATCH',
      body: updateData,
    });
    return response?.data;
  },

  /**
   * Delete teaching material (teacher)
   */
  async deleteMaterial(materialId: string) {
    const response: any = await api(`/materials/materials/${materialId}`, {
      method: 'DELETE',
    });
    return response;
  },

  // ==================== SCHEDULE MANAGEMENT ====================

  /**
   * Create class schedule item
   */
  async createSchedule(classId: string, scheduleData: any) {
    const response: any = await api(`/classes/${classId}/schedule`, {
      method: 'POST',
      body: scheduleData,
    });
    return response?.data;
  },

  /**
   * Update class schedule item
   */
  async updateSchedule(classId: string, scheduleId: string, updateData: any) {
    const response: any = await api(`/classes/${classId}/schedule/${scheduleId}`, {
      method: 'PATCH',
      body: updateData,
    });
    return response?.data;
  },

  /**
   * Delete class schedule item
   */
  async deleteSchedule(classId: string, scheduleId: string) {
    const response: any = await api(`/classes/${classId}/schedule/${scheduleId}`, {
      method: 'DELETE',
    });
    return response?.data;
  },

  // ==================== ASSIGNMENT PLANNING ====================

  /**
   * Create assignment plan for class
   */
  async createAssignmentPlan(classId: string, planData: any) {
    const response: any = await api(`/classes/${classId}/assignment-plans`, {
      method: 'POST',
      body: planData,
    });
    return response?.data;
  },

  /**
   * Update assignment plan
   */
  async updateAssignmentPlan(classId: string, planId: string, updateData: any) {
    const response: any = await api(`/classes/${classId}/assignment-plans/${planId}`, {
      method: 'PATCH',
      body: updateData,
    });
    return response?.data;
  },

  /**
   * Delete assignment plan
   */
  async deleteAssignmentPlan(classId: string, planId: string) {
    const response: any = await api(`/classes/${classId}/assignment-plans/${planId}`, {
      method: 'DELETE',
    });
    return response?.data;
  },

  // ==================== EXAMS ====================

  /**
   * Get exams for a class
   */
  async getExams(classId: string) {
    const response: any = await api(`/classes/${classId}/exams`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Create exam
   */
  async createExam(classId: string, examData: any) {
    const response: any = await api(`/classes/${classId}/exams`, {
      method: 'POST',
      body: examData,
    });
    return response?.data;
  },

  /**
   * Update exam
   */
  async updateExam(classId: string, examId: string, updateData: any) {
    const response: any = await api(`/classes/${classId}/exams/${examId}`, {
      method: 'PATCH',
      body: updateData,
    });
    return response?.data;
  },

  /**
   * Delete exam
   */
  async deleteExam(classId: string, examId: string) {
    const response: any = await api(`/classes/${classId}/exams/${examId}`, {
      method: 'DELETE',
    });
    return response?.data;
  },

  // ==================== SUBMISSION MANAGEMENT ====================

  /**
   * Get student's submission for an assignment
   */
  async getSubmission(assignmentId: string) {
    const response: any = await api(`/submissions/assignments/${assignmentId}`, {
      method: 'GET',
    });
    return response?.data;
  },

  /**
   * Get all submissions for an assignment (teacher only)
   */
  async getAssignmentSubmissions(assignmentId: string) {
    const response: any = await api(`/submissions/assignments/${assignmentId}/all`, {
      method: 'GET',
    });
    return response?.data || [];
  },

  // ==================== ATTENDANCE SESSIONS ====================

  /**
   * Get attendance sessions for a class
   */
  async getAttendanceSessions(classId: string) {
    const response: any = await api(`/classes/${classId}/attendance-sessions`, { method: 'GET' });
    return response?.data || [];
  },

  /**
   * Create attendance session
   */
  async createAttendanceSession(classId: string, sessionData: {
    subject: string;
    type: 'lesson' | 'midterm' | 'final' | 'quiz' | 'collection';
    startDate: string;
    endDate?: string;
    description?: string;
  }) {
    const response: any = await api(`/classes/${classId}/attendance-sessions`, {
      method: 'POST',
      body: sessionData,
    });
    return response?.data;
  },

  /**
   * Update attendance session
   */
  async updateAttendanceSession(classId: string, sessionId: string, sessionData: any) {
    const response: any = await api(`/classes/${classId}/attendance-sessions/${sessionId}`, {
      method: 'PATCH',
      body: sessionData,
    });
    return response?.data;
  },

  /**
   * Delete attendance session
   */
  async deleteAttendanceSession(classId: string, sessionId: string) {
    const response: any = await api(`/classes/${classId}/attendance-sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return response?.data;
  },

  // ==================== MEETINGS ====================

  /**
   * Create a new meeting
   */
  async createMeeting(meetingData: any) {
    const response: any = await api('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
    return response?.data;
  },

  /**
   * List meetings (optionally filtered by classId or status)
   */
  async listMeetings(filters?: { classId?: string; status?: string; userId?: string }) {
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response: any = await api(`/meetings?${params.toString()}`);
    return response?.data || [];
  },

  /**
   * Get a specific meeting with participants
   */
  async getMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}`);
    return response?.data;
  },

  /**
   * Update a meeting
   */
  async updateMeeting(meetingId: string, updateData: any) {
    const response: any = await api(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return response?.data;
  },

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}`, {
      method: 'DELETE',
    });
    return response?.data;
  },

  /**
   * Start a meeting (teacher only)
   */
  async startMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/start`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * End a meeting (teacher only)
   */
  async endMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/end`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Join a meeting (student)
   */
  async joinMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/join`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Leave a meeting (student)
   */
  async leaveMeeting(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/leave`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/participants`);
    return response?.data || [];
  },

  // ==================== VIDEO CONFERENCING ====================

  /**
   * Start recording
   */
  async startRecording(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/recording/start`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Stop recording
   */
  async stopRecording(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/recording/stop`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * Get recording status
   */
  async getRecordingStatus(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/recording/status`);
    return response?.data;
  },

  /**
   * Get video call participants
   */
  async getVideoParticipants(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/video/participants`);
    return response?.data || [];
  },

  /**
   * Log call statistics
   */
  async logCallStats(meetingId: string, stats: any) {
    const response: any = await api(`/meetings/${meetingId}/stats/log`, {
      method: 'POST',
      body: stats,
    });
    return response?.data;
  },

  /**
   * Get quality statistics
   */
  async getQualityStats(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/stats/quality`);
    return response?.data || {};
  },

  /**
   * Send chat message
   */
  async sendChatMessage(meetingId: string, content: string) {
    const response: any = await api(`/meetings/${meetingId}/chat/message`, {
      method: 'POST',
      body: { content },
    });
    return response?.data;
  },

  /**
   * Get chat history
   */
  async getChatHistory(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/chat/history`);
    return response?.data || [];
  },

  /**
   * Start video session
   */
  async startVideoSession(meetingId: string) {
    const response: any = await api(`/meetings/${meetingId}/start`, {
      method: 'POST',
    });
    return response?.data;
  },

  /**
   * End video session
   */
  async endVideoSession(meetingId: string, sessionId: string) {
    const response: any = await api(`/meetings/${meetingId}/end`, {
      method: 'POST',
      body: { sessionId },
    });
    return response?.data;
  },
};

export default classApi;
