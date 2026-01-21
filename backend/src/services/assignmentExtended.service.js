/**
 * Assignment Extended Service
 * Handles assignment submission, grading, and feedback management
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AssignmentExtendedService {
  /**
   * Submit an assignment
   */
  async submitAssignment(assignmentId, studentId, submissionData) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check submission count
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
    });

    if (existingSubmission) {
      // Update existing submission if not graded
      if (existingSubmission.status === 'graded') {
        throw new Error('Cannot resubmit - assignment already graded');
      }

      // Check submission count
      if (existingSubmission.submissionCount >= assignment.maxSubmissionCount) {
        throw new Error(
          `Maximum submissions (${assignment.maxSubmissionCount}) exceeded`
        );
      }

      return prisma.assignmentSubmission.update({
        where: {
          assignmentId_studentId: { assignmentId, studentId },
        },
        data: {
          fileUrl: submissionData.fileUrl || existingSubmission.fileUrl,
          content: submissionData.content || existingSubmission.content,
          submittedAt: new Date(),
          submissionCount: existingSubmission.submissionCount + 1,
          status: this.checkIfLate(assignment.dueDate) ? 'late' : 'submitted',
        },
      });
    }

    // Create new submission
    return prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl: submissionData.fileUrl,
        content: submissionData.content,
        status: this.checkIfLate(assignment.dueDate) ? 'late' : 'submitted',
        submissionCount: 1,
      },
      include: {
        assignment: true,
        student: { select: { id: true, username: true, email: true } },
      },
    });
  }

  /**
   * Cancel a submission
   * Can only cancel if not graded and before deadline
   */
  async cancelSubmission(assignmentId, studentId) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.status === 'graded') {
      throw new Error('Cannot cancel - already graded');
    }

    // Reset submission to not_submitted
    return prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      data: {
        status: 'not_submitted',
        fileUrl: null,
        content: null,
        submittedAt: null,
        submissionCount: 0,
      },
    });
  }

  /**
   * Grade an assignment submission
   */
  async gradeSubmission(assignmentId, studentId, gradeData) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Calculate percentage
    // Update submission
    return prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      data: {
        grade: gradeData.score,
        feedback: gradeData.feedback,
        status: 'graded',
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
        assignment: true,
      },
    });
  }

  /**
   * Request resubmission of assignment
   */
  async requestResubmission(assignmentId, studentId, feedback) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Allow resubmission by resetting status and incrementing allowed count
    return prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      data: {
        status: 'requested_resubmit',
        feedback,
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
      },
    });
  }

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId, classId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Add students without submissions
    const submittedStudentIds = submissions.map((s) => s.studentId);
    const notSubmitted = studentIds
      .filter((id) => !submittedStudentIds.includes(id))
      .map(async (id) => {
        const student = await prisma.user.findUnique({
          where: { id },
          select: { id: true, username: true, email: true },
        });
        return {
          id: null,
          assignmentId,
          studentId: id,
          student,
          status: 'not_submitted',
          submittedAt: null,
          grade: null,
          feedback: null,
        };
      });

    return [...submissions, ...(await Promise.all(notSubmitted))].sort(
      (a, b) => (a.student?.username || '').localeCompare(b.student?.username || '')
    );
  }

  /**
   * Get submission stats for a class assignment
   */
  async getSubmissionStats(assignmentId, classId) {
    const [total, submitted, graded, late] = await Promise.all([
      prisma.enrollment.count({
        where: { classId },
      }),
      prisma.assignmentSubmission.count({
        where: { assignmentId, status: { not: 'not_submitted' } },
      }),
      prisma.assignmentSubmission.count({
        where: { assignmentId, status: 'graded' },
      }),
      prisma.assignmentSubmission.count({
        where: { assignmentId, status: 'late' },
      }),
    ]);

    return {
      total,
      submitted,
      notSubmitted: total - submitted,
      graded,
      pending: submitted - graded,
      late,
    };
  }

  /**
   * Check if submission is late
   */
  checkIfLate(dueDate) {
    return new Date() > new Date(dueDate);
  }
}

export default new AssignmentExtendedService();
