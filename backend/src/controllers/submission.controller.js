import { validationResult } from 'express-validator';
import SubmissionService from '../services/submission.service.js';

// ==================== SUBMISSION MANAGEMENT ====================

/**
 * Get submission for a student's assignment
 */
export const getSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { id: userId } = req.user || {};

    const submission = await SubmissionService.getSubmission(assignmentId, userId);

    return res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submission' });
  }
};

/**
 * Create or update a submission
 */
export const submitAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { id: userId } = req.user || {};
    const { content, fileUrl } = req.body;

    const submission = await SubmissionService.submitAssignment(assignmentId, userId, {
      content,
      fileUrl,
    });

    return res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit assignment' });
  }
};

/**
 * Get all submissions for an assignment (teacher only)
 */
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Only teachers can view all submissions' });
    }

    const submissions = await SubmissionService.getAssignmentSubmissions(assignmentId);

    return res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
};

/**
 * Grade a submission (teacher only)
 */
export const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { submissionId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Only teachers can grade submissions' });
    }

    const { grade, feedback, status } = req.body;

    const submission = await SubmissionService.gradeSubmission(submissionId, {
      grade,
      feedback,
      status,
    });

    return res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return res.status(500).json({ success: false, message: 'Failed to grade submission' });
  }
};

/**
 * Request resubmission from student (teacher only)
 */
export const requestResubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { submissionId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Only teachers can request resubmission' });
    }

    const { feedback } = req.body;

    const submission = await SubmissionService.requestResubmission(submissionId, feedback);

    return res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error requesting resubmission:', error);
    return res.status(500).json({ success: false, message: 'Failed to request resubmission' });
  }
};
