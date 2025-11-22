import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from '../controllers/class.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// ==================== CLASS LISTING & DETAILS ====================

router.get('/', authRequired, ctrl.listClasses);

router.get(
  '/:classId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClass
);

router.get(
  '/:classId/summary',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  query('userId').optional().isString().trim(),
  ctrl.getClassSummary
);

// ==================== CLASS MANAGEMENT (TEACHER) ====================

router.post(
  '/',
  authRequired,
  body('code').notEmpty().withMessage('Class code is required'),
  body('name').notEmpty().withMessage('Class name is required'),
  body('section').optional().isString(),
  body('credits').optional().isFloat({ min: 1 }),
  body('semester').optional().isString(),
  body('room').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
  ctrl.createClass
);

router.patch(
  '/:classId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('name').optional().isString(),
  body('section').optional().isString(),
  body('credits').optional().isFloat({ min: 1 }),
  body('room').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
  ctrl.updateClass
);

router.delete(
  '/:classId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.deleteClass
);

// ==================== ENROLLMENT ====================

router.get(
  '/:classId/students',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassStudents
);

router.post(
  '/:classId/enroll',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('studentId').isString().trim().notEmpty().withMessage('Student ID is required'),
  ctrl.enrollStudent
);

// ==================== ASSIGNMENTS ====================

router.get(
  '/:classId/assignments',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassAssignments
);

router.post(
  '/:classId/assignments',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('maxScore').isFloat({ min: 1 }).withMessage('Max score must be > 0'),
  body('dueDate').isISO8601().withMessage('Due date must be ISO8601 format'),
  body('assignmentType')
    .isIn(['homework', 'quiz', 'project', 'exam'])
    .withMessage('Invalid assignment type'),
  ctrl.createAssignment
);

router.patch(
  '/:classId/assignments/:assignmentId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('assignmentId').isString().trim().notEmpty(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('maxScore').optional().isFloat({ min: 1 }),
  body('dueDate').optional().isISO8601(),
  ctrl.updateAssignment
);

router.delete(
  '/:classId/assignments/:assignmentId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('assignmentId').isString().trim().notEmpty(),
  ctrl.deleteAssignment
);

router.get(
  '/:classId/assignments/:assignmentId/submissions',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('assignmentId').isString().trim().notEmpty(),
  ctrl.getAssignmentSubmissions
);

// ==================== ATTENDANCE ====================

router.get(
  '/:classId/attendance',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassAttendance
);

router.post(
  '/:classId/attendance/mark',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('studentId').isString().trim().notEmpty().withMessage('Student ID is required'),
  body('date').isISO8601().withMessage('Date must be ISO8601 format'),
  body('status')
    .isIn(['present', 'absent', 'late', 'excuse'])
    .withMessage('Invalid status'),
  body('remark').optional().isString(),
  ctrl.markAttendance
);

router.get(
  '/:classId/attendance/:studentId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('studentId').isString().trim().notEmpty(),
  ctrl.getStudentAttendanceSummary
);

// ==================== GRADE ITEMS ====================

router.get(
  '/:classId/grade-items',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassGradeItems
);

router.post(
  '/:classId/grade-items',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('name').notEmpty().withMessage('Grade item name is required'),
  body('itemType')
    .isIn(['assignment', 'exam', 'quiz', 'participation'])
    .withMessage('Invalid item type'),
  body('maxScore').isFloat({ min: 1 }).withMessage('Max score must be > 0'),
  body('weight').isFloat({ min: 0, max: 1 }).withMessage('Weight must be between 0 and 1'),
  body('description').optional().isString(),
  ctrl.createGradeItem
);

// ==================== GRADES ====================

router.get(
  '/:classId/grades/:studentId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('studentId').isString().trim().notEmpty(),
  ctrl.getStudentGrades
);

router.post(
  '/:classId/grades',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('gradeItemId').isString().trim().notEmpty().withMessage('Grade item ID is required'),
  body('studentId').isString().trim().notEmpty().withMessage('Student ID is required'),
  body('score').isFloat({ min: 0 }).withMessage('Score must be >= 0'),
  body('feedback').optional().isString(),
  ctrl.createGradeRecord
);

// ==================== SCHEDULE ====================

router.get(
  '/:classId/schedule',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassSchedule
);

router.post(
  '/:classId/schedule',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('startTime').isString().trim().notEmpty().withMessage('Start time is required'),
  body('endTime').isString().trim().notEmpty().withMessage('End time is required'),
  body('room').optional().isString(),
  body('building').optional().isString(),
  body('scheduleType').optional().isString(),
  ctrl.createClassSchedule
);

router.patch(
  '/:classId/schedule/:scheduleId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('scheduleId').isString().trim().notEmpty(),
  body('dayOfWeek').optional().isInt({ min: 0, max: 6 }),
  body('startTime').optional().isString(),
  body('endTime').optional().isString(),
  body('room').optional().isString(),
  body('building').optional().isString(),
  body('scheduleType').optional().isString(),
  ctrl.updateClassSchedule
);

router.delete(
  '/:classId/schedule/:scheduleId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('scheduleId').isString().trim().notEmpty(),
  ctrl.deleteClassSchedule
);

// ==================== ASSIGNMENT PLANS ====================

router.post(
  '/:classId/assignment-plans',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  body('title').notEmpty().withMessage('Title is required'),
  body('assignmentType').optional().isString(),
  body('maxScore').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  ctrl.createClassAssignmentPlan
);

router.patch(
  '/:classId/assignment-plans/:planId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('planId').isString().trim().notEmpty(),
  body('title').optional().isString(),
  body('assignmentType').optional().isString(),
  body('maxScore').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  ctrl.updateClassAssignmentPlan
);

router.delete(
  '/:classId/assignment-plans/:planId',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  param('planId').isString().trim().notEmpty(),
  ctrl.deleteClassAssignmentPlan
);

// ==================== ANNOUNCEMENTS ====================

router.get(
  '/:classId/announcements',
  authRequired,
  param('classId').isString().trim().notEmpty(),
  ctrl.getAnnouncements
);

router.post(
  '/:classId/announcements',
  param('classId').isString().trim().notEmpty(),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  ctrl.createAnnouncement
);

export default router;
