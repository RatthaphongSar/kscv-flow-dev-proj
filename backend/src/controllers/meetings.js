import { validationResult } from 'express-validator';
import * as MeetingService from '../services/meetings.js';

/**
 * Create a new meeting
 * @route POST /
 * @access Teacher only
 * @body {title, description, type, platform, location, startTime, endTime, capacity, classId}
 */
export const createMeeting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id: teacherId, role } = req.user || {};
    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create meetings',
      });
    }

    const { classId, title, description, type, platform, location, startTime, endTime, capacity } = req.body;

    const meeting = await MeetingService.createMeeting({
      title,
      description,
      type,
      platform,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity,
      classId,
      teacherId,
    });

    return res.status(201).json({
      success: true,
      data: meeting,
      message: 'Meeting created successfully',
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create meeting',
    });
  }
};

/**
 * Get all meetings (filtered by class or user role)
 * @route GET /
 */
export const listMeetings = async (req, res) => {
  try {
    const { classId, status, userId } = req.query;
    const { id: currentUserId, role } = req.user || {};

    const meetings = await MeetingService.listMeetings({
      classId,
      status,
      userId: userId || currentUserId,
      userRole: role,
    });

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Error listing meetings:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to list meetings',
    });
  }
};

/**
 * Get a specific meeting with participants
 * @route GET /:id
 */
export const getMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await MeetingService.getMeeting(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error getting meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get meeting',
    });
  }
};

/**
 * Update a meeting
 * @route PATCH /:id
 * @access Teacher (only meeting creator)
 */
export const updateMeeting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { id: teacherId, role } = req.user || {};
    const updateData = req.body;

    const meeting = await MeetingService.updateMeeting(id, teacherId, updateData);

    return res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting updated successfully',
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update meeting',
    });
  }
};

/**
 * Delete a meeting
 * @route DELETE /:id
 * @access Teacher (only meeting creator)
 */
export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: teacherId } = req.user || {};

    await MeetingService.deleteMeeting(id, teacherId);

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete meeting',
    });
  }
};

/**
 * Start a meeting (teacher only, sets status to 'active')
 * @route POST /:id/start
 * @access Teacher
 */
export const startMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: teacherId } = req.user || {};

    const meeting = await MeetingService.startMeeting(id, teacherId);

    return res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting started successfully',
    });
  } catch (error) {
    console.error('Error starting meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to start meeting',
    });
  }
};

/**
 * End a meeting (teacher only, sets status to 'completed')
 * @route POST /:id/end
 * @access Teacher
 */
export const endMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: teacherId } = req.user || {};

    const meeting = await MeetingService.endMeeting(id, teacherId);

    return res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting ended successfully',
    });
  } catch (error) {
    console.error('Error ending meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to end meeting',
    });
  }
};

/**
 * Join a meeting (student)
 * @route POST /:id/join
 * @access Student
 */
export const joinMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: studentId } = req.user || {};

    const participant = await MeetingService.joinMeeting(id, studentId);

    return res.status(200).json({
      success: true,
      data: participant,
      message: 'Joined meeting successfully',
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to join meeting',
    });
  }
};

/**
 * Leave a meeting (student)
 * @route POST /:id/leave
 * @access Student
 */
export const leaveMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: studentId } = req.user || {};

    const participant = await MeetingService.leaveMeeting(id, studentId);

    return res.status(200).json({
      success: true,
      data: participant,
      message: 'Left meeting successfully',
    });
  } catch (error) {
    console.error('Error leaving meeting:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave meeting',
    });
  }
};

/**
 * Get meeting participants
 * @route GET /:id/participants
 */
export const getMeetingParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const participants = await MeetingService.getMeetingParticipants(id);

    return res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get participants',
    });
  }
};
