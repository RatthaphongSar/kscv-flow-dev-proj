/**
 * Class Enrollment Service
 * Handles student enrollment, join requests, and class membership management
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassEnrollmentService {
  /**
   * Enroll multiple students to a class
   * Used when teacher creates class and selects students
   */
  async enrollStudents(classId, studentIds) {
    const enrollments = [];

    for (const studentId of studentIds) {
      // Check if already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          classId_studentId: { classId, studentId },
        },
      });

      if (!existing) {
        const enrollment = await prisma.enrollment.create({
          data: {
            classId,
            studentId,
            status: 'active',
          },
          include: {
            student: { select: { id: true, username: true, email: true } },
          },
        });
        enrollments.push(enrollment);
      }
    }

    return enrollments;
  }

  /**
   * Enroll a single student to a class
   */
  async enrollStudent(classId, studentId) {
    const existing = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (existing) {
      throw new Error('Student is already enrolled in this class');
    }

    return prisma.enrollment.create({
      data: {
        classId,
        studentId,
        status: 'active',
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
        class: { select: { id: true, code: true, name: true } },
      },
    });
  }

  /**
   * Remove student from class
   */
  async removeEnrollment(enrollmentId) {
    return prisma.enrollment.delete({
      where: { id: enrollmentId },
    });
  }

  /**
   * Get all enrollments for a class
   */
  async getClassEnrollments(classId) {
    return prisma.enrollment.findMany({
      where: { classId, status: 'active' },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            major: true,
            year: true,
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });
  }

  /**
   * Search students by name or student code
   * Used in enrollment UI to find students
   */
  async searchStudents(query, limit = 10) {
    return prisma.user.findMany({
      where: {
        AND: [
          { role: 'STUDENT' },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        major: true,
        year: true,
      },
      take: limit,
    });
  }

  /**
   * Create a join request for a student to join a class
   */
  async createJoinRequest(classId, studentId) {
    // Check if already enrolled
    const enrolled = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (enrolled) {
      throw new Error('Already enrolled in this class');
    }

    // Check if join request already exists
    const existing = await prisma.joinRequest.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (existing && existing.status === 'pending') {
      throw new Error('Join request already pending');
    }

    return prisma.joinRequest.create({
      data: {
        classId,
        studentId,
        status: 'pending',
      },
      include: {
        class: { select: { id: true, code: true, name: true } },
        student: { select: { id: true, username: true, email: true } },
      },
    });
  }

  /**
   * Get all pending join requests for a class (teacher view)
   */
  async getClassJoinRequests(classId, status = 'pending') {
    return prisma.joinRequest.findMany({
      where: { classId, status },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            major: true,
            year: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve a join request - create enrollment
   */
  async approveJoinRequest(joinRequestId) {
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: joinRequestId },
    });

    if (!joinRequest) {
      throw new Error('Join request not found');
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        classId: joinRequest.classId,
        studentId: joinRequest.studentId,
        status: 'active',
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
      },
    });

    // Update join request
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: {
        status: 'approved',
        respondedAt: new Date(),
      },
    });

    return enrollment;
  }

  /**
   * Reject a join request
   */
  async rejectJoinRequest(joinRequestId, reason = '') {
    return prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: {
        status: 'rejected',
        reason,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * Check if student is enrolled in class
   */
  async isStudentEnrolled(classId, studentId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    return !!enrollment && enrollment.status === 'active';
  }

  /**
   * Drop a student from class (mark as dropped)
   */
  async dropStudent(enrollmentId) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'dropped' },
    });
  }
}

export default new ClassEnrollmentService();
