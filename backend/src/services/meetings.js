import { prisma } from '../db.js';

/**
 * Create a new meeting
 */
export const createMeeting = async (meetingData) => {
  const {
    title,
    description,
    type,
    platform,
    location,
    startTime,
    endTime,
    capacity,
    classId,
    teacherId,
  } = meetingData;

  if (!title || !classId || !teacherId || !startTime || !endTime) {
    throw new Error('Missing required fields');
  }

  if (startTime >= endTime) {
    throw new Error('Start time must be before end time');
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      type: type || 'online',
      platform: type === 'online' ? platform : null,
      location: type === 'onsite' ? location : null,
      startTime,
      endTime,
      capacity,
      classId,
      teacherId,
      status: 'scheduled',
    },
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      participants: { include: { student: { select: { id: true, username: true, email: true } } } },
    },
  });

  return meeting;
};

/**
 * List meetings (filtered by class, status, or user)
 */
export const listMeetings = async ({ classId, status, userId, userRole }) => {
  const where = {};

  if (classId) {
    where.classId = classId;
  }

  if (status) {
    where.status = status;
  }

  // If student, only show meetings from their classes
  // If teacher, show their own meetings
  if (userRole === 'STUDENT' && userId) {
    // Student: get meetings from their enrolled classes
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId, status: 'active' },
      select: { classId: true },
    });
    const classIds = enrollments.map(e => e.classId);
    where.classId = { in: classIds };
  } else if (userRole === 'TEACHER' && userId) {
    // Teacher: show their own meetings
    where.teacherId = userId;
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { startTime: 'asc' },
  });

  return meetings;
};

/**
 * Get a specific meeting with participants
 */
export const getMeeting = async (meetingId) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      participants: {
        include: { student: { select: { id: true, username: true, email: true } } },
      },
    },
  });

  return meeting;
};

/**
 * Update a meeting (teacher only)
 */
export const updateMeeting = async (meetingId, teacherId, updateData) => {
  // Verify teacher is the creator
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  if (meeting.teacherId !== teacherId) {
    throw new Error('Only the meeting creator can update this meeting');
  }

  if (meeting.status === 'completed' || meeting.status === 'cancelled') {
    throw new Error('Cannot update a completed or cancelled meeting');
  }

  const { startTime, endTime, ...otherData } = updateData;

  if (startTime && endTime && startTime >= endTime) {
    throw new Error('Start time must be before end time');
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      ...otherData,
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
    },
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      participants: { include: { student: { select: { id: true, username: true, email: true } } } },
    },
  });

  return updated;
};

/**
 * Delete a meeting (teacher only)
 */
export const deleteMeeting = async (meetingId, teacherId) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  if (meeting.teacherId !== teacherId) {
    throw new Error('Only the meeting creator can delete this meeting');
  }

  // Can only delete if not active or completed
  if (meeting.status === 'active') {
    throw new Error('Cannot delete an active meeting. End it first.');
  }

  await prisma.meeting.delete({
    where: { id: meetingId },
  });
};

/**
 * Start a meeting (teacher only)
 */
export const startMeeting = async (meetingId, teacherId) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  if (meeting.teacherId !== teacherId) {
    throw new Error('Only the meeting creator can start this meeting');
  }

  if (meeting.status !== 'scheduled') {
    throw new Error('Can only start a scheduled meeting');
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'active' },
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      _count: { select: { participants: true } },
    },
  });

  return updated;
};

/**
 * End a meeting (teacher only)
 */
export const endMeeting = async (meetingId, teacherId) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  if (meeting.teacherId !== teacherId) {
    throw new Error('Only the meeting creator can end this meeting');
  }

  if (meeting.status !== 'active') {
    throw new Error('Can only end an active meeting');
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'completed' },
    include: {
      teacher: { select: { id: true, username: true, email: true } },
      class: { select: { id: true, code: true, name: true } },
      _count: { select: { participants: true } },
    },
  });

  return updated;
};

/**
 * Join a meeting (student)
 */
export const joinMeeting = async (meetingId, studentId) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // Check if student is enrolled in the class
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_classId: {
        studentId,
        classId: meeting.classId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('You are not enrolled in this class');
  }

  // Check if already joined
  const existing = await prisma.meetingParticipant.findUnique({
    where: {
      meetingId_studentId: {
        meetingId,
        studentId,
      },
    },
  });

  if (existing && existing.status === 'joined') {
    throw new Error('You have already joined this meeting');
  }

  // Create or update participant
  const participant = await prisma.meetingParticipant.upsert({
    where: {
      meetingId_studentId: {
        meetingId,
        studentId,
      },
    },
    create: {
      meetingId,
      studentId,
      status: 'joined',
      joinedAt: new Date(),
    },
    update: {
      status: 'joined',
      joinedAt: new Date(),
      leftAt: null,
    },
    include: {
      student: { select: { id: true, username: true, email: true } },
    },
  });

  return participant;
};

/**
 * Leave a meeting (student)
 */
export const leaveMeeting = async (meetingId, studentId) => {
  const participant = await prisma.meetingParticipant.findUnique({
    where: {
      meetingId_studentId: {
        meetingId,
        studentId,
      },
    },
  });

  if (!participant) {
    throw new Error('You have not joined this meeting');
  }

  const updated = await prisma.meetingParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      status: 'left',
      leftAt: new Date(),
    },
    include: {
      student: { select: { id: true, username: true, email: true } },
    },
  });

  return updated;
};

/**
 * Get meeting participants
 */
export const getMeetingParticipants = async (meetingId) => {
  const participants = await prisma.meetingParticipant.findMany({
    where: { meetingId },
    include: {
      student: { select: { id: true, username: true, email: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return participants;
};
