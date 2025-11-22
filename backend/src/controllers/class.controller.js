import { validationResult } from 'express-validator';
import ClassService from '../services/class.service.js';

// ==================== CLASS LISTING & DETAILS ====================

export const listClasses = async (req, res) => {
  try {
    const { id: userId, role } = req.user || {};
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const classes = await ClassService.getClassesForUser(userId, role);
    return res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Error listing classes:', error);
    return res.status(500).json({ error: 'Failed to list classes' });
  }
};

export const getClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const classData = await ClassService.getClassById(classId);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error('Error getting class:', error);
    return res.status(500).json({ error: 'Failed to get class' });
  }
};

export const getClassSummary = async (req, res) => {
  try {
    const { classId } = req.params;
    const { userId } = req.query;

    const summary = await ClassService.getClassSummary(classId, userId);

    if (!summary) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error getting class summary:', error);
    return res.status(500).json({ error: 'Failed to get class summary' });
  }
};

// ==================== CLASS MANAGEMENT (TEACHER) ====================

export const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: userId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create classes' });
    }

    const { code, name, section, credits, semester, room, capacity } =
      req.body;

    const newClass = await ClassService.createClass({
      code,
      name,
      section,
      teacherId: userId,
      credits,
      semester,
      room,
      capacity,
    });

    return res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    console.error('Error creating class:', error);
    if (error.code === 'P2002') {
      return res
        .status(400)
        .json({ error: 'Class code and section already exist' });
    }
    return res.status(500).json({ error: 'Failed to create class' });
  }
};

export const updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { id: userId, role } = req.user || {};

    const classData = await ClassService.getClassById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (role !== 'TEACHER' || classData.teacherId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this class' });
    }

    const updatedClass = await ClassService.updateClass(classId, req.body);

    return res.json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({ error: 'Failed to update class' });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { id: userId, role } = req.user || {};

    const classData = await ClassService.getClassById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (role !== 'TEACHER' || classData.teacherId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this class' });
    }

    await ClassService.deleteClass(classId);

    return res.json({
      success: true,
      message: 'Class deleted',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({ error: 'Failed to delete class' });
  }
};

// ==================== ENROLLMENT ====================

export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await ClassService.getClassStudents(classId);

    return res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error getting class students:', error);
    return res.status(500).json({ error: 'Failed to get class students' });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { studentId } = req.body;

    const enrollment = await ClassService.enrollStudent(classId, studentId);

    return res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return res.status(500).json({ error: 'Failed to enroll student' });
  }
};

// ==================== ASSIGNMENTS ====================

export const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await ClassService.getClassAssignments(classId);

    return res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Error getting assignments:', error);
    return res.status(500).json({ error: 'Failed to get assignments' });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { id: userId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create assignments' });
    }

    const { title, description, maxScore, dueDate, assignmentType } = req.body;

    const assignment = await ClassService.createAssignment({
      classId,
      teacherId: userId,
      title,
      description,
      maxScore,
      dueDate: new Date(dueDate),
      assignmentType,
    });

    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { id: userId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can update assignments' });
    }

    const updated = await ClassService.updateAssignment(assignmentId, req.body);

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({ error: 'Failed to update assignment' });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { id: userId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can delete assignments' });
    }

    await ClassService.deleteAssignment(assignmentId);

    return res.json({
      success: true,
      message: 'Assignment deleted',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await ClassService.getAssignmentSubmissions(assignmentId);

    return res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    return res.status(500).json({ error: 'Failed to get submissions' });
  }
};

// ==================== ATTENDANCE ====================

export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const attendance = await ClassService.getClassAttendance(classId);

    return res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Error getting attendance:', error);
    return res.status(500).json({ error: 'Failed to get attendance' });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { studentId, date, status } = req.body;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res
        .status(403)
        .json({ error: 'Only teachers can mark attendance' });
    }

    const record = await ClassService.markAttendance(
      classId,
      studentId,
      new Date(date),
      status
    );

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const summary = await ClassService.getStudentAttendanceSummary(
      classId,
      studentId
    );

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    return res
      .status(500)
      .json({ error: 'Failed to get attendance summary' });
  }
};

// ==================== GRADES ====================

export const getStudentGrades = async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const grades = await ClassService.getStudentGrades(classId, studentId);

    return res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Error getting grades:', error);
    return res.status(500).json({ error: 'Failed to get grades' });
  }
};

export const getClassGradeItems = async (req, res) => {
  try {
    const { classId } = req.params;
    const items = await ClassService.getClassGradeItems(classId);

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error getting grade items:', error);
    return res.status(500).json({ error: 'Failed to get grade items' });
  }
};

export const createGradeRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create grades' });
    }

    const { gradeItemId, studentId, score, feedback } = req.body;

    const grade = await ClassService.createGradeRecord({
      gradeItemId,
      studentId,
      score,
      feedback,
    });

    return res.status(201).json({
      success: true,
      data: grade,
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    return res.status(500).json({ error: 'Failed to create grade' });
  }
};

export const createGradeItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create grade items' });
    }

    const { name, itemType, maxScore, weight, description } = req.body;

    const item = await ClassService.createGradeItem({
      classId,
      name,
      itemType,
      maxScore,
      weight,
      description,
    });

    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error creating grade item:', error);
    return res.status(500).json({ error: 'Failed to create grade item' });
  }
};

// ==================== SCHEDULE ====================

export const getClassSchedule = async (req, res) => {
  try {
    const { classId } = req.params;
    const schedule = await ClassService.getClassSchedule(classId);

    return res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error getting schedule:', error);
    return res.status(500).json({ error: 'Failed to get schedule' });
  }
};

// ==================== SCHEDULE MANAGEMENT ====================

export const createClassSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage schedules' });
    }

    const { dayOfWeek, startTime, endTime, room, building, scheduleType } = req.body;

    const schedule = await ClassService.createSchedule({
      classId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      building,
      scheduleType,
    });

    return res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return res.status(500).json({ error: 'Failed to create schedule' });
  }
};

export const updateClassSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, scheduleId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage schedules' });
    }

    const { dayOfWeek, startTime, endTime, room, building, scheduleType } = req.body;

    const schedule = await ClassService.updateSchedule(scheduleId, {
      dayOfWeek,
      startTime,
      endTime,
      room,
      building,
      scheduleType,
    });

    return res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return res.status(500).json({ error: 'Failed to update schedule' });
  }
};

export const deleteClassSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, scheduleId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage schedules' });
    }

    await ClassService.deleteSchedule(scheduleId);

    return res.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// ==================== ASSIGNMENT PLAN MANAGEMENT ====================

export const createClassAssignmentPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { id: userId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage assignment plans' });
    }

    const { title, assignmentType, maxScore, dueDate } = req.body;

    const plan = await ClassService.createAssignmentPlan({
      classId,
      teacherId: userId,
      title,
      assignmentType,
      maxScore,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error creating assignment plan:', error);
    return res.status(500).json({ error: 'Failed to create assignment plan' });
  }
};

export const updateClassAssignmentPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, planId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage assignment plans' });
    }

    const { title, assignmentType, maxScore, dueDate } = req.body;

    const plan = await ClassService.updateAssignmentPlan(planId, {
      title,
      assignmentType,
      maxScore,
      dueDate,
    });

    return res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error updating assignment plan:', error);
    return res.status(500).json({ error: 'Failed to update assignment plan' });
  }
};

export const deleteClassAssignmentPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, planId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can manage assignment plans' });
    }

    await ClassService.deleteAssignmentPlan(planId);

    return res.json({
      success: true,
      message: 'Assignment plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment plan:', error);
    return res.status(500).json({ error: 'Failed to delete assignment plan' });
  }
};

// ==================== ANNOUNCEMENTS ====================

export const getAnnouncements = async (req, res) => {
  try {
    const { classId } = req.params;
    const announcements = await ClassService.getAnnouncements(classId);

    return res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error('Error getting announcements:', error);
    return res.status(500).json({ error: 'Failed to get announcements' });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res
        .status(403)
        .json({ error: 'Only teachers can create announcements' });
    }

    const { title, content } = req.body;

    const announcement = await ClassService.createAnnouncement({
      classId,
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
};
