import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassService {
  /**
   * Get all classes for a user based on their role
   * Teachers: classes they teach
   * Students: all classes (with enrollment status marked), enrolled first
   */
  async getClassesForUser(userId, role) {
    if (role === 'TEACHER') {
      return prisma.class.findMany({
        where: { teacherId: userId },
        include: {
          teacher: { select: { id: true, username: true, email: true } },
          _count: {
            select: {
              students: true,
              assignments: true,
              attendances: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // STUDENT role: get all classes with enrollment status
    const allClasses = await prisma.class.findMany({
      include: {
        teacher: { select: { id: true, username: true, email: true } },
        students: {
          where: { studentId: userId },
          select: { status: true }
        },
        _count: {
          select: {
            students: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mark enrollment status and sort enrolled first
    return allClasses.map(cls => ({
      ...cls,
      enrollmentStatus: cls.students?.[0]?.status || 'not_enrolled',
    })).sort((a, b) => {
      // Enrolled classes first, then not enrolled
      if (a.enrollmentStatus === 'active' && b.enrollmentStatus !== 'active') return -1;
      if (a.enrollmentStatus !== 'active' && b.enrollmentStatus === 'active') return 1;
      return 0;
    });
  }

  async getClassById(classId) {
    return prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, username: true, email: true } },
        schedules: true,
        announcementPin: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async getClassSummary(classId, studentId) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            assignments: true,
            students: true,
          },
        },
      },
    });

    if (!classData) return null;

    const totalAssignments = classData._count.assignments;
    const totalStudents = classData._count.students;

    if (studentId) {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignment: { classId },
          studentId,
        },
      });

      const attendanceRecords = await prisma.attendance.findMany({
        where: { classId, studentId },
      });

      const presentDays = attendanceRecords.filter(
        (a) => a.status === 'present'
      ).length;
      const attendancePercentage =
        attendanceRecords.length > 0
          ? Math.round((presentDays / attendanceRecords.length) * 100)
          : 0;

      const gradeRecords = await prisma.gradeRecord.findMany({
        where: {
          studentId,
          gradeItem: { classId },
        },
        include: { gradeItem: true },
      });

      const totalScore = gradeRecords.reduce(
        (sum, g) => sum + (g.score || 0),
        0
      );
      const totalMaxScore = gradeRecords.reduce(
        (sum, g) => sum + g.gradeItem.maxScore,
        0
      );

      return {
        totalAssignments,
        submittedAssignments: submissions.length,
        pendingAssignments: totalAssignments - submissions.length,
        attendancePercentage,
        currentScore: totalScore,
        maxScore: totalMaxScore,
        currentPercentage:
          totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0,
      };
    }

    return {
      totalAssignments,
      totalStudents,
    };
  }

  async createClass(classData) {
    return prisma.class.create({
      data: {
        code: classData.code,
        name: classData.name,
        section: classData.section,
        teacherId: classData.teacherId,
        credits: classData.credits || 3,
        semester: classData.semester,
        room: classData.room,
        capacity: classData.capacity,
      },
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async updateClass(classId, classData) {
    return prisma.class.update({
      where: { id: classId },
      data: classData,
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async deleteClass(classId) {
    return prisma.class.delete({
      where: { id: classId },
    });
  }

  async enrollStudent(classId, studentId) {
    return prisma.enrollment.upsert({
      where: {
        classId_studentId: { classId, studentId },
      },
      update: { status: 'active' },
      create: {
        classId,
        studentId,
        status: 'active',
      },
    });
  }

  async getClassStudents(classId) {
    return prisma.enrollment.findMany({
      where: { classId, status: 'active' },
      include: {
        student: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async getClassAssignments(classId) {
    return prisma.assignment.findMany({
      where: { classId },
      include: {
        teacher: { select: { id: true, username: true } },
        submissions: {
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createAssignment(assignmentData) {
    // Ensure dueDate is properly formatted as ISO-8601
    let dueDate = assignmentData.dueDate;
    if (dueDate && typeof dueDate === 'string') {
      // If it's missing seconds, add them
      if (dueDate.match(/T\d{2}:\d{2}$/)) {
        dueDate = `${dueDate}:00`;
      }
      // Convert to Date object for Prisma
      dueDate = new Date(dueDate);
    }

    return prisma.assignment.create({
      data: {
        classId: assignmentData.classId,
        teacherId: assignmentData.teacherId,
        title: assignmentData.title,
        description: assignmentData.description,
        maxScore: assignmentData.maxScore || 100,
        dueDate: dueDate,
        assignmentType: assignmentData.assignmentType || 'homework',
      },
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async updateAssignment(assignmentId, data) {
    // Ensure dueDate is properly formatted as ISO-8601
    if (data.dueDate && typeof data.dueDate === 'string') {
      // If it's missing seconds, add them
      if (data.dueDate.match(/T\d{2}:\d{2}$/)) {
        data.dueDate = `${data.dueDate}:00`;
      }
      // Convert to Date object for Prisma
      data.dueDate = new Date(data.dueDate);
    }

    return prisma.assignment.update({
      where: { id: assignmentId },
      data,
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async deleteAssignment(assignmentId) {
    try {
      // Check if assignment exists first
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Use transaction to ensure both deletions happen atomically
      const result = await prisma.$transaction(async (tx) => {
        // Delete all submissions first (due to foreign key constraint)
        const submissionsDeleted = await tx.assignmentSubmission.deleteMany({
          where: { assignmentId },
        });
        console.log(`Deleted ${submissionsDeleted.count} submissions for assignment ${assignmentId}`);

        // Then delete the assignment
        const deleted = await tx.assignment.delete({
          where: { id: assignmentId },
        });
        console.log(`Deleted assignment ${assignmentId}:`, deleted);
        return deleted;
      });

      return result;
    } catch (error) {
      // Handle case where assignment doesn't exist
      if (error.code === 'P2025' || error.message === 'Assignment not found') {
        throw new Error('Assignment not found');
      }
      console.error('Delete assignment error:', error);
      throw error;
    }
  }

  async getAssignmentSubmissions(assignmentId) {
    return prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, username: true, email: true } },
        assignment: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getClassAttendance(classId) {
    const records = await prisma.attendance.findMany({
      where: { classId },
      include: {
        student: { select: { id: true, username: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { username: 'asc' } }],
    });

    return records;
  }

  async markAttendance(classId, studentId, date, status) {
    return prisma.attendance.upsert({
      where: {
        studentId_classId_date: { studentId, classId, date },
      },
      update: { status },
      create: {
        classId,
        studentId,
        date,
        status,
      },
    });
  }

  async getStudentAttendanceSummary(classId, studentId) {
    const records = await prisma.attendance.findMany({
      where: { classId, studentId },
    });

    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excuse = records.filter((r) => r.status === 'excuse').length;

    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excuse,
      percentage,
    };
  }

  async getStudentGrades(classId, studentId) {
    const gradeRecords = await prisma.gradeRecord.findMany({
      where: {
        studentId,
        gradeItem: { classId },
      },
      include: {
        gradeItem: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalScore = gradeRecords.reduce(
      (sum, g) => sum + (g.score || 0),
      0
    );
    const totalMaxScore = gradeRecords.reduce(
      (sum, g) => sum + g.gradeItem.maxScore,
      0
    );
    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    return {
      items: gradeRecords,
      totalScore,
      totalMaxScore,
      percentage: Math.round(percentage),
      grade: this.calculateGrade(percentage),
    };
  }

  async createGradeRecord(data) {
    const gradeItem = await prisma.gradeItem.findUnique({
      where: { id: data.gradeItemId },
    });

    if (!gradeItem) throw new Error('Grade item not found');

    const percentage = (data.score / gradeItem.maxScore) * 100;

    return prisma.gradeRecord.upsert({
      where: {
        gradeItemId_studentId: {
          gradeItemId: data.gradeItemId,
          studentId: data.studentId,
        },
      },
      update: {
        score: data.score,
        percentage,
        grade: this.calculateGrade(percentage),
        feedback: data.feedback,
      },
      create: {
        gradeItemId: data.gradeItemId,
        studentId: data.studentId,
        score: data.score,
        percentage,
        grade: this.calculateGrade(percentage),
        feedback: data.feedback,
      },
    });
  }

  async getClassGradeItems(classId) {
    return prisma.gradeItem.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createGradeItem(data) {
    return prisma.gradeItem.create({
      data: {
        classId: data.classId,
        name: data.name,
        itemType: data.itemType || 'assignment',
        maxScore: data.maxScore || 100,
        weight: data.weight || 0.1,
        description: data.description,
      },
    });
  }

  calculateGrade(percentage) {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async getClassSchedule(classId) {
    return prisma.schedule.findMany({
      where: { classId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async createSchedule(data) {
    return prisma.schedule.create({
      data: {
        classId: data.classId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
      },
    });
  }

  async updateSchedule(scheduleId, data) {
    return prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
      },
    });
  }

  async deleteSchedule(scheduleId) {
    return prisma.schedule.delete({
      where: { id: scheduleId },
    });
  }

  async createAssignmentPlan(data) {
    return prisma.assignment.create({
      data: {
        classId: data.classId,
        teacherId: data.teacherId || 'teacher-001', // Will be provided by controller
        title: data.title,
        assignmentType: data.assignmentType || 'homework',
        maxScore: data.maxScore || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
      },
    });
  }

  async updateAssignmentPlan(planId, data) {
    return prisma.assignment.update({
      where: { id: planId },
      data: {
        title: data.title,
        assignmentType: data.assignmentType,
        maxScore: data.maxScore,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  async deleteAssignmentPlan(planId) {
    return prisma.assignment.delete({
      where: { id: planId },
    });
  }

  async createAnnouncement(data) {
    return prisma.announcement.create({
      data,
    });
  }

  async getAnnouncements(classId) {
    return prisma.announcement.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== EXAMS ====================

  async getClassExams(classId) {
    return prisma.exam.findMany({
      where: { classId },
      orderBy: { date: 'asc' },
    });
  }

  async createClassExam(classId, data) {
    return prisma.exam.create({
      data: {
        classId,
        title: data.name || data.title || 'Exam',
        subject: data.subject || 'General',
        date: new Date(data.examDate || data.date),
        room: data.room,
        duration: data.duration,
      },
    });
  }

  async updateClassExam(classId, examId, data) {
    const updateData = {};
    if (data.name || data.title) updateData.title = data.name || data.title;
    if (data.subject) updateData.subject = data.subject;
    if (data.examDate || data.date) updateData.date = new Date(data.examDate || data.date);
    if (data.room !== undefined) updateData.room = data.room;
    if (data.duration !== undefined) updateData.duration = data.duration;

    return prisma.exam.update({
      where: { id: examId },
      data: updateData,
    });
  }

  async deleteClassExam(classId, examId) {
    return prisma.exam.delete({
      where: { id: examId },
    });
  }

  // ==================== ATTENDANCE SESSIONS ====================

  async getAttendanceSessions(classId) {
    return prisma.attendanceSession.findMany({
      where: { classId },
      include: {
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getAttendanceSession(sessionId) {
    return prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { attendances: true }
        }
      },
    });
  }

  async createAttendanceSession(classId, data) {
    return prisma.attendanceSession.create({
      data: {
        classId,
        subject: data.subject,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: 'active',
        description: data.description,
      },
      include: {
        _count: {
          select: { attendances: true }
        }
      },
    });
  }

  async updateAttendanceSession(sessionId, data) {
    const updateData = {};
    if (data.subject) updateData.subject = data.subject;
    if (data.type) updateData.type = data.type;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.status) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;

    return prisma.attendanceSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        _count: {
          select: { attendances: true }
        }
      },
    });
  }

  async deleteAttendanceSession(sessionId) {
    return prisma.attendanceSession.delete({
      where: { id: sessionId },
    });
  }

  async getSessionAttendanceCount(sessionId) {
    const count = await prisma.attendance.count({
      where: { sessionId },
    });
    return count;
  }
}

export default new ClassService();
