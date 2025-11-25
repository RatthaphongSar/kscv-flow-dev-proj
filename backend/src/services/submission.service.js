import { prisma } from '../db.js';

class SubmissionService {
  /**
   * Get submission for a student's assignment
   */
  async getSubmission(assignmentId, studentId) {
    return prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxScore: true,
          },
        },
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentId, studentId, submissionData) {
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (existingSubmission) {
      // Update existing submission
      return prisma.assignmentSubmission.update({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId,
          },
        },
        data: {
          ...submissionData,
          status: 'submitted',
          submittedAt: new Date(),
          submissionCount: existingSubmission.submissionCount + 1,
        },
        include: {
          assignment: true,
          student: { select: { id: true, username: true, email: true } },
        },
      });
    } else {
      // Create new submission
      return prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId,
          ...submissionData,
          status: 'submitted',
          submittedAt: new Date(),
          submissionCount: 1,
        },
        include: {
          assignment: true,
          student: { select: { id: true, username: true, email: true } },
        },
      });
    }
  }

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId) {
    return prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            year: true,
            major: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxScore: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId, gradeData) {
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        ...gradeData,
        status: gradeData.status || 'graded',
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
        assignment: { select: { id: true, title: true, maxScore: true } },
      },
    });
  }

  /**
   * Request resubmission
   */
  async requestResubmission(submissionId, feedback) {
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'requested_resubmit',
        feedback,
      },
      include: {
        student: { select: { id: true, username: true, email: true } },
        assignment: { select: { id: true, title: true } },
      },
    });
  }

  /**
   * Get submission statistics for a class
   */
  async getSubmissionStats(assignmentId) {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
    });

    const submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const notSubmitted = submissions.filter(s => s.status === 'not_submitted').length;
    const late = submissions.filter(s => s.status === 'late').length;
    const requestedResubmit = submissions.filter(s => s.status === 'requested_resubmit').length;

    // Calculate average grade
    const grades = submissions
      .filter(s => s.grade !== null)
      .map(s => s.grade);
    
    const averageGrade = grades.length > 0 
      ? grades.reduce((a, b) => a + b, 0) / grades.length 
      : 0;

    return {
      total: submissions.length,
      submitted,
      graded,
      notSubmitted,
      late,
      requestedResubmit,
      averageGrade: Math.round(averageGrade * 100) / 100,
    };
  }
}

export default new SubmissionService();
