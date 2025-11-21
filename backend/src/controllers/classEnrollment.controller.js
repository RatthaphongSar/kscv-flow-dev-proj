/**
 * Class Enrollment Controller
 * Handles student enrollment, join requests, and membership
 */

import { validationResult } from 'express-validator';
import ClassEnrollmentService from '../services/classEnrollment.service.js';

// ==================== ENROLLMENT MANAGEMENT ====================

export const searchStudents = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const students = await ClassEnrollmentService.searchStudents(q, parseInt(limit));

    return res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error searching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search students',
    });
  }
};

export const enrollMultipleStudents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { classId } = req.params;
    const { studentIds } = req.body;
    const { id: teacherId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can enroll students',
      });
    }

    const enrollments = await ClassEnrollmentService.enrollStudents(
      classId,
      studentIds
    );

    return res.status(201).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to enroll students',
    });
  }
};

export const removeEnrollment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { enrollmentId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can remove enrollments',
      });
    }

    await ClassEnrollmentService.removeEnrollment(enrollmentId);

    return res.json({
      success: true,
      message: 'Student removed from class',
    });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove enrollment',
    });
  }
};

// ==================== JOIN REQUEST MANAGEMENT ====================

export const createJoinRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { classId } = req.params;
    const { id: studentId, role } = req.user || {};

    if (role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can request to join',
      });
    }

    const joinRequest = await ClassEnrollmentService.createJoinRequest(
      classId,
      studentId
    );

    return res.status(201).json({
      success: true,
      data: joinRequest,
      message: 'Join request sent - waiting for teacher approval',
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create join request',
    });
  }
};

export const getClassJoinRequests = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { classId } = req.params;
    const { status = 'pending' } = req.query;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view join requests',
      });
    }

    const joinRequests = await ClassEnrollmentService.getClassJoinRequests(
      classId,
      status
    );

    return res.json({
      success: true,
      data: joinRequests,
    });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch join requests',
    });
  }
};

export const approveJoinRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { joinRequestId } = req.params;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can approve join requests',
      });
    }

    const enrollment = await ClassEnrollmentService.approveJoinRequest(
      joinRequestId
    );

    return res.json({
      success: true,
      data: enrollment,
      message: 'Join request approved - student enrolled',
    });
  } catch (error) {
    console.error('Error approving join request:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve join request',
    });
  }
};

export const rejectJoinRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { joinRequestId } = req.params;
    const { reason } = req.body;
    const { role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can reject join requests',
      });
    }

    const result = await ClassEnrollmentService.rejectJoinRequest(
      joinRequestId,
      reason
    );

    return res.json({
      success: true,
      data: result,
      message: 'Join request rejected',
    });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject join request',
    });
  }
};
