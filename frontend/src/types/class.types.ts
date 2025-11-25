// frontend/src/types/class.types.ts

export interface ClassInfo {
  id: string;
  code: string;
  name: string;
  section: string;
  credits: number;
  semester?: string;
  room?: string;
  capacity?: number;
  teacherId: string;
  teacher: {
    id: string;
    username: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
    assignments: number;
  };
}

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0=Monday, 4=Friday
  startTime: string; // HH:mm
  endTime: string;
  room?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  assignmentType: string; // homework, quiz, project, exam
  maxScore: number;
  assignedAt: string;     // เวลาที่ครูสั่งงาน
  dueDate: string;        // เดทไลน์ส่งงาน
  createdAt: string;
  updatedAt: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  submittedAt: string;
  fileUrl?: string;
  content?: string;
  grade?: number;
  feedback?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excuse';
  remark?: string;
  student?: {
    id: string;
    username: string;
  };
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excuse: number;
  percentage: number;
}

export interface GradeItem {
  id: string;
  name: string;
  itemType: string; // assignment, exam, quiz, participation
  maxScore: number;
  weight: number;
  description?: string;
  classId: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  gradeItemId: string;
  score: number;
  percentage?: number;
  grade?: string;
  feedback?: string;
  gradeItem: GradeItem;
}

export interface StudentGrades {
  items: GradeRecord[];
  totalScore: number;
  totalMaxScore: number;
  percentage: number;
  grade: string;
}

export interface ClassSummary {
  totalAssignments: number;
  submittedAssignments?: number;
  pendingAssignments?: number;
  attendancePercentage?: number;
  currentScore?: number;
  maxScore?: number;
  currentPercentage?: number;
  totalStudents?: number;
}

export interface AnnouncementPin {
  id: string;
  title: string;
  content: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'active' | 'dropped' | 'completed';
  enrolledAt: string;
}

export interface JoinRequest {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    username: string;
    email?: string;
  };
}
