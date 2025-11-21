/**
 * Assignment Extended Controller
 * Handles submissions, grading, and resubmission requests
 */

import { validationResult } from 'express-validator';
import AssignmentExtendedService from '../services/assignmentExtended.service.js';

// ==================== ASSIGNMENT SUBMISSION ====================

export const submitAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { fileUrl, content } = req.body;
    const { id: studentId, role } = req.user || {};

    if (role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments',
      });
    }

    if (!fileUrl && !content) {
      return res.status(400).json({
        success: false,
        message: 'Either fileUrl or content is required',
      });
    }

    const submission = await AssignmentExtendedService.submitAssignment(
      assignmentId,
      studentId,
      { fileUrl, content }
    );

    return res.status(201).json({
      success: true,
      data: submission,
      message: 'Assignment submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit assignment',
    });
  }
};

export const cancelSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { id: studentId, role } = req.user || {};

    if (role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can cancel submissions',
      });
    }

    const submission = await AssignmentExtendedService.cancelSubmission(
      assignmentId,
      studentId
    );

    return res.json({
      success: true,
      data: submission,
      message: 'Submission cancelled',
    });
  } catch (error) {
    console.error('Error cancelling submission:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel submission',
    });
  }
};

// ==================== GRADING ====================

export const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { studentId, score, feedback } = req.body;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can grade assignments',
      });
    }

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: 'Score is required',
      });
    }

    const gradeRecord = await AssignmentExtendedService.gradeSubmission(
      assignmentId,
      studentId,
      { score, feedback }
    );

    return res.json({
      success: true,
      data: gradeRecord,
      message: 'Assignment graded successfully',
    });
  } catch (error) {
    console.error('Error grading assignment:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to grade assignment',
    });
  }
};

export const requestResubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { studentId, feedback } = req.body;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can request resubmission',
      });
    }

    const submission = await AssignmentExtendedService.requestResubmission(
      assignmentId,
      studentId,
      feedback
    );

    return res.json({
      success: true,
      data: submission,
      message: 'Resubmission requested - student notified',
    });
  } catch (error) {
    console.error('Error requesting resubmission:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to request resubmission',
    });
  }
};

export const getSubmissionStats = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId, classId } = req.params;

    const stats = await AssignmentExtendedService.getSubmissionStats(
      assignmentId,
      classId
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submission stats',
    });
  }
};
