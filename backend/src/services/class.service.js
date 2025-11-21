import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassService {
  /**
   * Get all classes for a user based on their role
   * Teachers: classes they teach
   * Students: classes they're enrolled in
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

    // STUDENT role
    return prisma.class.findMany({
      where: {
        students: {
          some: { studentId: userId, status: 'active' },
        },
      },
      include: {
        teacher: { select: { id: true, username: true, email: true } },
        _count: {
          select: {
            students: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    return prisma.assignment.create({
      data: {
        classId: assignmentData.classId,
        teacherId: assignmentData.teacherId,
        title: assignmentData.title,
        description: assignmentData.description,
        maxScore: assignmentData.maxScore || 100,
        dueDate: assignmentData.dueDate,
        assignmentType: assignmentData.assignmentType || 'homework',
      },
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async updateAssignment(assignmentId, data) {
    return prisma.assignment.update({
      where: { id: assignmentId },
      data,
      include: {
        teacher: { select: { id: true, username: true } },
      },
    });
  }

  async deleteAssignment(assignmentId) {
    return prisma.assignment.delete({
      where: { id: assignmentId },
    });
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

  async createAnnouncement(data) {
    return prisma.announcementPin.create({
      data,
    });
  }

  async getAnnouncements(classId) {
    return prisma.announcementPin.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new ClassService();
