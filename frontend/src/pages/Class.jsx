// frontend/src/pages/Class.jsx
import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Users,
  X,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  BookOpen,
  Settings,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ClassAnnouncements from "../components/class/ClassAnnouncements";
import ClassSchedule from "../components/class/ClassSchedule";
import ClassStudents from "../components/class/ClassStudents";
import ClassManagement from "../components/class/ClassManagement";
import ClassAssignmentCreator from "../components/class/ClassAssignmentCreator";
import ClassScheduleManager from "../components/class/ClassScheduleManager";
import JoinRequestModal from "../components/class/JoinRequestModal";
import JoinConfirmationModal from "../components/class/JoinConfirmationModal";
import ExamScheduleModal from "../components/class/ExamScheduleModal";
import PDFExportModal from "../components/class/PDFExportModal";
import GoogleCalendarModal from "../components/class/GoogleCalendarModal";
import ErrorAlertModal from "../components/ErrorAlertModal";
import { classApi } from "../api/classApi";

// format date
function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClassPage() {
  const { user } = useAuth();
  const userRole = user?.role || "STUDENT"; // Get from auth context, default STUDENT
  
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [isJoinConfirmationModalOpen, setIsJoinConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace mock assignments with real API data
  const [assignments, setAssignments] = useState({});
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  
  // Real attendance data from API
  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Teacher: class stats and progress data
  const [classStats, setClassStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Student progress data
  const [studentProgress, setStudentProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  
  // Configuration status
  const [configStatus, setConfigStatus] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  
  // Student join request status
  const [joinRequestStatus, setJoinRequestStatus] = useState({});
  const [joinRequestLoading, setJoinRequestLoading] = useState(false);

  // Schedule data for modal
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Exam data
  const [examList, setExamList] = useState([]);
  const [examLoading, setExamLoading] = useState(false);

  // Modal states for PDF and Google Calendar
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isGoogleCalendarModalOpen, setIsGoogleCalendarModalOpen] = useState(false);
  // Fetch classes from API on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await classApi.getClasses();
        console.log('Fetched classes:', data);
        
        // No fallback to mock - use only real data
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedId(data[0].id);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err.message);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  // Fetch assignments for selected class
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        const data = await classApi.getClassAssignments(selectedId);
        console.log('Fetched assignments for class:', selectedId, data);
        setAssignments(prev => ({
          ...prev,
          [selectedId]: data || []
        }));
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setAssignments(prev => ({
          ...prev,
          [selectedId]: []
        }));
      } finally {
        setAssignmentsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [selectedId]);

  // Fetch attendance for selected class
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchAttendance = async () => {
      try {
        setAttendanceLoading(true);
        const data = await classApi.getAttendance(selectedId);
        console.log('Fetched attendance for class:', selectedId, data);
        setAttendance(prev => ({
          ...prev,
          [selectedId]: data || []
        }));
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendance(prev => ({
          ...prev,
          [selectedId]: []
        }));
      } finally {
        setAttendanceLoading(false);
      }
    };
    
    fetchAttendance();
  }, [selectedId]);

  // Fetch schedule for selected class
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchSchedule = async () => {
      try {
        setScheduleLoading(true);
        const data = await classApi.getSchedule(selectedId);
        console.log('Fetched schedule for class:', selectedId, data);
        setScheduleData(data || []);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setScheduleData([]);
      } finally {
        setScheduleLoading(false);
      }
    };
    
    fetchSchedule();
  }, [selectedId]);

  // Fetch exams for selected class
  useEffect(() => {
    if (!selectedId) return;
    
    const fetchExams = async () => {
      try {
        setExamLoading(true);
        const data = await classApi.getExams(selectedId);
        console.log('Fetched exams for class:', selectedId, data);
        setExamList(data || []);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExamList([]);
      } finally {
        setExamLoading(false);
      }
    };
    
    fetchExams();
  }, [selectedId]);

  const selectedClass =
    classes.find((c) => c.id === selectedId) || classes[0];

  // Check if current user is the teacher of the selected class
  const isTeacher = selectedClass?.teacherId === user?.id && userRole === "TEACHER";

  const currentAssignments = assignments[selectedClass?.id] || [];

  const selectedAssignment =
    currentAssignments.find((a) => a.id === selectedAssignmentId) ||
    currentAssignments[0] ||
    null;

  useEffect(() => {
    if (!selectedId) return;
    const list = assignments[selectedId] || [];
    setSelectedAssignmentId(list[0]?.id ?? null);
  }, [selectedId, assignments]);

  useEffect(() => {
    if (activeTab !== "assignment") return;
    if (!selectedAssignmentId && currentAssignments.length > 0) {
      setSelectedAssignmentId(currentAssignments[0].id);
    }
  }, [activeTab, currentAssignments, selectedAssignmentId]);

  // Fetch class stats for teacher (students, submissions, attendance)
  useEffect(() => {
    if (!selectedId || userRole !== "TEACHER") return;
    
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch students in class
        const students = await classApi.getClassStudents(selectedId);
        const studentCount = (students || []).length;
        
        // Fetch assignments submissions count
        const classAssignments = assignments[selectedId] || [];
        let totalSubmissions = 0;
        for (const assignment of classAssignments) {
          try {
            const submissions = await classApi.getSubmissions(selectedId, assignment.id);
            totalSubmissions += (submissions || []).length;
          } catch (err) {
            console.error(`Error fetching submissions for assignment ${assignment.id}:`, err);
          }
        }
        
        // Fetch attendance summary
        const attendanceData = await classApi.getAttendance(selectedId);
        const attendanceCount = (attendanceData || []).length;
        
        // Calculate attendance stats
        const presentCount = (attendanceData || []).filter(a => a.status === 'present').length;
        const absentCount = (attendanceData || []).filter(a => a.status === 'absent').length;
        const lateCount = (attendanceData || []).filter(a => a.status === 'late').length;
        
        setClassStats(prev => ({
          ...prev,
          [selectedId]: {
            studentCount,
            assignmentCount: classAssignments.length,
            submissionCount: totalSubmissions,
            attendanceCount,
            presentCount,
            absentCount,
            lateCount,
            lastUpdated: new Date()
          }
        }));
      } catch (err) {
        console.error("Error fetching class stats:", err);
        setClassStats(prev => ({
          ...prev,
          [selectedId]: {
            studentCount: 0,
            assignmentCount: 0,
            submissionCount: 0,
            attendanceCount: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0
          }
        }));
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [selectedId, userRole, assignments]);

  // Fetch configuration status and check for missing required fields
  useEffect(() => {
    if (!selectedId) return;
    
    const checkConfig = async () => {
      try {
        setConfigLoading(true);
        const classData = await classApi.getClass(selectedId);
        
        const issues = [];
        
        // Check required fields
        if (!classData.name) issues.push({ field: 'name', message: 'ชื่อวิชา' });
        if (!classData.code) issues.push({ field: 'code', message: 'รหัสวิชา' });
        if (!classData.teacherId) issues.push({ field: 'teacher', message: 'อาจารย์ผู้สอน' });
        if (!classData.credits) issues.push({ field: 'credits', message: 'หน่วยกิต' });
        if (!classData.section) issues.push({ field: 'section', message: 'ห้องเรียน/กลุ่ม' });
        
        setConfigStatus(prev => ({
          ...prev,
          [selectedId]: {
            issues,
            isComplete: issues.length === 0,
            lastChecked: new Date()
          }
        }));
      } catch (err) {
        console.error("Error checking config:", err);
        setConfigStatus(prev => ({
          ...prev,
          [selectedId]: {
            issues: [],
            isComplete: false,
            lastChecked: new Date()
          }
        }));
      } finally {
        setConfigLoading(false);
      }
    };
    
    checkConfig();
  }, [selectedId]);

  // Fetch student progress (for student role)
  useEffect(() => {
    if (!selectedId || userRole !== "STUDENT" || !user?.id) return;
    
    const fetchProgress = async () => {
      try {
        setProgressLoading(true);
        
        // Fetch student's attendance summary
        const attendanceSummary = await classApi.getAttendanceSummary(selectedId, user.id);
        
        // Fetch student's grades
        const gradesSummary = await classApi.getStudentGrades(selectedId, user.id);
        
        // Count submitted assignments for this student
        const classAssignments = assignments[selectedId] || [];
        let submittedCount = 0;
        for (const assignment of classAssignments) {
          try {
            const submissions = await classApi.getSubmissions(selectedId, assignment.id);
            const studentSubmission = submissions?.find(s => s.studentId === user.id);
            if (studentSubmission && studentSubmission.status === 'submitted') {
              submittedCount++;
            }
          } catch (err) {
            console.error(`Error fetching submission status:`, err);
          }
        }
        
        setStudentProgress(prev => ({
          ...prev,
          [selectedId]: {
            attendanceSummary: attendanceSummary || { total: 0, present: 0, percentage: 0 },
            gradesSummary: gradesSummary || { totalScore: 0, totalMaxScore: 0, percentage: 0 },
            submittedAssignments: submittedCount,
            totalAssignments: classAssignments.length,
            lastUpdated: new Date()
          }
        }));
      } catch (err) {
        console.error("Error fetching student progress:", err);
        setStudentProgress(prev => ({
          ...prev,
          [selectedId]: {
            attendanceSummary: { total: 0, present: 0, percentage: 0 },
            gradesSummary: { totalScore: 0, totalMaxScore: 0, percentage: 0 },
            submittedAssignments: 0,
            totalAssignments: 0
          }
        }));
      } finally {
        setProgressLoading(false);
      }
    };
    
    fetchProgress();
  }, [selectedId, userRole, user, assignments]);

  // Fetch student's join request status
  useEffect(() => {
    if (!selectedId || userRole !== "STUDENT") return;
    
    const checkJoinStatus = async () => {
      try {
        // Use the enrollmentStatus from the class data
        const selectedClassData = classes.find(c => c.id === selectedId);
        
        if (selectedClassData) {
          const isEnrolled = selectedClassData.enrollmentStatus === 'active';
          const hasPendingRequest = selectedClassData.enrollmentStatus === 'pending';
          
          setJoinRequestStatus(prev => ({
            ...prev,
            [selectedId]: {
              isEnrolled: isEnrolled,
              hasPendingRequest: hasPendingRequest,
              joinRequest: null,
              lastChecked: new Date()
            }
          }));
        }
      } catch (err) {
        console.error("Error checking join status:", err);
      }
    };
    
    checkJoinStatus();
  }, [selectedId, userRole, user, classes]);

  const handleRequestJoin = () => {
    // Open confirmation modal instead of directly requesting
    setIsJoinConfirmationModalOpen(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedId) return;
    
    try {
      setJoinRequestLoading(true);
      const result = await classApi.requestToJoinClass(selectedId);
      
      // Update status to show pending approval
      setJoinRequestStatus(prev => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          joinRequest: result,
          isEnrolled: false, // Not yet approved, so still "not enrolled"
          hasPendingRequest: true // Mark as having pending request
        }
      }));

      // Refresh classes to update enrollment status
      const updatedClasses = await classApi.getClasses();
      setClasses(updatedClasses);
    } catch (err) {
      console.error("Error requesting to join:", err);
      console.log("Error object details:", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        data: err?.data,
        dataMessage: err?.data?.message,
        dataError: err?.data?.error,
      });
      // Error message is now properly extracted by api.js wrapper
      // The Error.message contains data?.message || data?.error || "HTTP {status}"
      const errorMsg = err?.message || 'Failed to send join request';
      
      // If already enrolled, mark it as such
      if (errorMsg.includes('Already enrolled')) {
        setJoinRequestStatus(prev => ({
          ...prev,
          [selectedId]: {
            ...prev[selectedId],
            isEnrolled: true,
            hasPendingRequest: false
          }
        }));
        setErrorMessage('คุณลงทะเบียนในห้องเรียนนี้แล้ว');
      } 
      // If join request already pending, mark it as pending
      else if (errorMsg.includes('Join request already pending')) {
        setJoinRequestStatus(prev => ({
          ...prev,
          [selectedId]: {
            ...prev[selectedId],
            hasPendingRequest: true,
            isEnrolled: false
          }
        }));
        setErrorMessage('(คำขอลงทะเบียนค้างอยู่) ' + errorMsg);
      }
      else {
        setErrorMessage(errorMsg);
      }
      setShowErrorAlert(true);
      setIsJoinConfirmationModalOpen(false); // Close confirmation modal to show error
    } finally {
      setJoinRequestLoading(false);
    }
  };

  const handleUploadFiles = async (classId, assignmentId, files) => {
    if (!files || files.length === 0) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      // Upload files to backend
      const response = await fetch(`/api/classes/${classId}/assignments/${assignmentId}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Update assignment with uploaded file URLs
      if (selectedAssignment) {
        setAssignments(prev => ({
          ...prev,
          [classId]: (prev[classId] || []).map(a =>
            a.id === assignmentId
              ? { ...a, files: result.data.files || [] }
              : a
          ),
        }));
      }

      alert('ไฟล์อัพโหลดสำเร็จ');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`ไม่สามารถอัพโหลดไฟล์: ${error.message}`);
    }
  };

  const renderStatusBadge = (assignment) => {
    if (!assignment) return null;
    if (assignment.status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[11px]">
          <CheckCircle2 size={12} />
          ส่งแล้ว
        </span>
      );
    }
    if (assignment.status === "late") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-[11px]">
          <AlertCircle size={12} />
          ส่งแล้ว (เกินกำหนด)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-200 border border-slate-600 text-[11px]">
        ยังไม่ส่ง
      </span>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#020617] bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_90%_15%,rgba(14,165,233,0.08),transparent_50%)] flex flex-col lg:flex-row overflow-hidden">

      <aside className="w-full lg:w-72 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0b1220]/80 backdrop-blur-xl flex flex-col overflow-hidden max-h-24 sm:max-h-28 lg:max-h-none shadow-[0_24px_70px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-4 py-2 lg:py-3 border-b border-white/10">
          <h1 className="text-xs lg:text-sm font-semibold text-gray-100 tracking-wide">รายวิชา</h1>
          <p className="text-[10px] lg:text-[11px] text-gray-400">
            วิชาที่ลงทะเบียนในภาคการศึกษานี้
          </p>
        </div>

        <div className="px-2 lg:px-3 py-2 lg:py-3">
          <input
            className="w-full bg-[#0b1220]/80 border border-white/10 rounded-full px-3 lg:px-4 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="ค้นหารายวิชา..."
          />
        </div>

        <div className="flex-1 overflow-y-auto px-1 lg:px-2 pb-2 lg:pb-3 space-y-0.5 lg:space-y-1 min-h-0">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400">กำลังโหลด...</div>
          ) : error ? (
            <div className="px-3 py-2 text-xs text-red-400">ข้อผิดพลาด: {error}</div>
          ) : classes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">ไม่มีรายวิชา</div>
          ) : (
            <>
              {/* Enrolled Classes (For Students) */}
              {userRole === "STUDENT" && classes.some(c => c.enrollmentStatus === 'active') && (
                <>
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    ลงทะเบียนแล้ว
                  </div>
                  {classes
                    .filter(c => c.enrollmentStatus === 'active')
                    .map((cls) => {
                      const active = cls.id === selectedId;
                      return (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedId(cls.id)}
                          className={`w-full text-left rounded-xl px-2.5 lg:px-3.5 py-2 text-xs mb-1 transition truncate border border-transparent
                            ${
                              active
                                ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/80 text-white border-white/10 shadow-[0_12px_30px_-20px_rgba(99,102,241,0.8)]"
                                : "bg-white/5 text-gray-200 hover:bg-white/10 border-white/5"
                            }`}
                        >
                          <div className="font-semibold text-[12px] lg:text-[13px]">{cls.code}</div>
                          <div className="text-[10px] lg:text-[11px] truncate">{cls.name}</div>
                          <div className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5 lg:mt-1">
                            {cls.section} • {cls.semester || "---"}
                          </div>
                        </button>
                      );
                    })}
                </>
              )}

              {/* Available Classes (For Students) or All Classes (For Teachers) */}
              {userRole === "STUDENT" && classes.some(c => c.enrollmentStatus !== 'active') && (
                <>
                  <div className="px-3 py-2 mt-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    วิชาที่สามารถขอเข้าร่วม
                  </div>
                  {classes
                    .filter(c => c.enrollmentStatus !== 'active')
                    .map((cls) => {
                      const active = cls.id === selectedId;
                      return (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedId(cls.id)}
                          className={`w-full text-left rounded-xl px-3.5 py-2 text-xs mb-1 transition opacity-80 border border-transparent
                            ${
                              active
                                ? "bg-gradient-to-r from-violet-600/80 to-indigo-600/70 text-white border-white/10"
                                : "bg-white/5 text-gray-300 hover:bg-white/10 border-white/5"
                            }`}
                        >
                          <div className="font-semibold text-[13px]">{cls.code}</div>
                          <div className="text-[11px] truncate">{cls.name}</div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {cls.section} • {cls.semester || "---"}
                          </div>
                          <div className="text-[9px] text-amber-300 mt-1">ยังไม่ได้ลงทะเบียน</div>
                        </button>
                      );
                    })}
                </>
              )}

              {/* All Classes (For Teachers) */}
              {userRole === "TEACHER" && (
                <>
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    วิชาที่สอน
                  </div>
                  {classes.map((cls) => {
                    const active = cls.id === selectedId;
                    return (
                        <button
                        key={cls.id}
                        onClick={() => setSelectedId(cls.id)}
                          className={`w-full text-left rounded-xl px-3.5 py-2 text-xs mb-1 transition border border-transparent
                          ${
                            active
                              ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/80 text-white border-white/10 shadow-[0_12px_30px_-20px_rgba(99,102,241,0.8)]"
                              : "bg-white/5 text-gray-200 hover:bg-white/10 border-white/5"
                          }`}
                      >
                        <div className="font-semibold text-[13px]">{cls.code}</div>
                        <div className="text-[11px] truncate">{cls.name}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {cls.section} • {cls.semester || "---"}
                        </div>
                        {cls._count?.students > 0 && (
                          <div className="text-[9px] text-emerald-400 mt-1">
                            👥 {cls._count.students} นักเรียน
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#0b1220]/70 backdrop-blur-xl flex-shrink-0 gap-2 sm:gap-4">
          {selectedClass ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-100 truncate">
                    {selectedClass.name}
                  </h2>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-white/5 text-violet-200 border border-white/10 whitespace-nowrap">
                    {selectedClass.code}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                  ห้อง: {selectedClass.room || "---"} • เซมิเสตอร์: {selectedClass.semester || "---"}
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Show Join Request button for students */}
                {userRole === "STUDENT" && (
                  // Show status if already enrolled or has pending request
                  (joinRequestStatus[selectedId]?.isEnrolled || joinRequestStatus[selectedId]?.hasPendingRequest) ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px]">
                      {joinRequestStatus[selectedId]?.hasPendingRequest && (
                        <div className="flex items-center gap-1 text-yellow-300">
                          <Clock size={14} />
                          <span>ส่งคำขอแล้ว รอการอนุมัติ</span>
                        </div>
                      )}
                      {joinRequestStatus[selectedId]?.isEnrolled && !joinRequestStatus[selectedId]?.hasPendingRequest && (
                        <div className="flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 size={14} />
                          <span>ลงทะเบียนแล้ว</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestJoin}
                      disabled={joinRequestLoading}
                      className="hidden md:flex px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-[11px] disabled:opacity-50 transition text-white shadow-[0_12px_30px_-20px_rgba(99,102,241,0.8)]"
                    >
                      {joinRequestLoading ? "กำลังส่ง..." : "+ ขอเข้าห้องเรียน"}
                    </button>
                  )
                )}

                <button
                  className="hidden md:flex px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] transition"
                  onClick={() => setIsScheduleOpen(true)}
                >
                  ดูตารางเรียนวิชานี้
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">ไม่มีรายวิชา</div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-3 sm:px-6 pt-2 sm:pt-3 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl flex-shrink-0 overflow-x-auto">
          <div className="flex gap-2 text-xs overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-[11px] sm:text-xs border ${
                activeTab === "overview"
                  ? "border-violet-400/60 bg-white/10 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              ภาพรวม
            </button>

            {userRole === "STUDENT" && (
              <button
                onClick={() => setActiveTab("assignment")}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                  activeTab === "assignment"
                    ? "border-violet-400/60 bg-white/10 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <FileText size={12} className="hidden sm:block" />
                งาน
              </button>
            )}

            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                activeTab === "attendance"
                  ? "border-violet-400/60 bg-white/10 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Users size={12} className="hidden sm:block" />
              เข้าเรียน
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                activeTab === "announcements"
                  ? "border-violet-400/60 bg-white/10 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Bell size={12} className="hidden sm:block" />
              ประกาศ
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                activeTab === "schedule"
                  ? "border-violet-400/60 bg-white/10 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Calendar size={12} className="hidden sm:block" />
              ตาราง
            </button>

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("scheduleManager")}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                  activeTab === "scheduleManager"
                    ? "border-violet-400/60 bg-white/10 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Calendar size={12} className="hidden sm:block" />
                จัดการ
              </button>
            )}

            {userRole === "TEACHER" && (
              <button
                onClick={() => setIsJoinRequestModalOpen(true)}
                className="px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 relative text-[11px] sm:text-xs"
              >
                <Users size={12} className="hidden sm:block" />
                คำขอ
              </button>
            )}

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("createAssignments")}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                  activeTab === "createAssignments"
                    ? "border-violet-400/60 bg-white/10 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Plus size={12} className="hidden sm:block" />
                สร้าง
              </button>
            )}

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs border ${
                  activeTab === "settings"
                    ? "border-violet-400/60 bg-white/10 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Settings size={12} className="hidden sm:block" />
                ตั้ง
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4">
          {!selectedClass && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">{loading ? "กำลังโหลดรายวิชา..." : "ไม่มีรายวิชา"}</p>
            </div>
          )}

          {selectedClass && (
            <div className={`${
              activeTab === "announcements" || activeTab === "schedule" || activeTab === "students" || activeTab === "createAssignments" || activeTab === "settings" || activeTab === "scheduleManager"
                ? "grid gap-3 md:gap-4"
                : "grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2"
            }`}>
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  {/* Configuration Status */}
                  {userRole === "TEACHER" && (
                    <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 md:col-span-2">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        {configStatus[selectedId]?.isComplete ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <AlertCircle size={16} className="text-yellow-400" />
                        )}
                        สถานะการตั้งค่าวิชา
                      </h3>
                      
                      {configStatus[selectedId]?.issues?.length === 0 ? (
                        <p className="text-xs text-emerald-300">✓ ตั้งค่าวิชาเรียบร้อยแล้ว</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-yellow-300">จำเป็นต้องตั้งค่าสิ่งต่อไปนี้:</p>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {configStatus[selectedId]?.issues?.map((issue, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="text-yellow-400">•</span>
                                {issue.message}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => setActiveTab("settings")}
                            className="mt-2 px-3 py-1.5 text-[11px] rounded-md bg-violet-600 hover:bg-violet-500"
                          >
                            ไปตั้งค่า
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Class Information */}
                  <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-2">ข้อมูลรายวิชา</h3>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>รหัสวิชา: <span className="text-gray-100 font-medium">{selectedClass?.code || "---"}</span></li>
                      <li>ชื่อวิชา: <span className="text-gray-100 font-medium">{selectedClass?.name || "---"}</span></li>
                      <li>อาจารย์ผู้สอน: <span className="text-gray-100 font-medium">{selectedClass?.teacher?.username || "---"}</span></li>
                      <li>หน่วยกิต: <span className="text-gray-100 font-medium">{selectedClass?.credits || 0}</span></li>
                      <li>ห้องเรียน: <span className="text-gray-100 font-medium">{selectedClass?.room || "---"}</span></li>
                      <li>เซมิเสตอร์: <span className="text-gray-100 font-medium">{selectedClass?.semester || "---"}</span></li>
                    </ul>
                  </div>

                  {/* Progress Summary - Teacher View */}
                  {userRole === "TEACHER" && (
                    <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">สรุปความคืบหน้า</h3>
                      {statsLoading ? (
                        <p className="text-xs text-gray-400">กำลังโหลด...</p>
                      ) : (
                        <ul className="text-xs text-gray-300 space-y-2">
                          <li>จำนวนนักเรียน: <span className="text-emerald-300 font-medium">{classStats[selectedId]?.studentCount || 0}</span> คน</li>
                          <li>จำนวนการบ้าน: <span className="text-emerald-300 font-medium">{classStats[selectedId]?.assignmentCount || 0}</span> ชิ้น</li>
                          <li>การส่งงาน: <span className="text-emerald-300 font-medium">{classStats[selectedId]?.submissionCount || 0}</span> รายการ</li>
                          <li className="pt-1 border-t border-[#1f2937]">
                            <div className="text-[11px] text-gray-400 mb-1">สรุปการเข้าเรียน:</div>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <div className="text-center p-1 bg-emerald-600/10 rounded border border-emerald-500/30">
                                <p className="font-bold text-emerald-300">{classStats[selectedId]?.presentCount || 0}</p>
                                <p className="text-[10px]">เข้าเรียน</p>
                              </div>
                              <div className="text-center p-1 bg-yellow-600/10 rounded border border-yellow-500/30">
                                <p className="font-bold text-yellow-300">{classStats[selectedId]?.lateCount || 0}</p>
                                <p className="text-[10px]">สาย</p>
                              </div>
                              <div className="text-center p-1 bg-red-600/10 rounded border border-red-500/30">
                                <p className="font-bold text-red-300">{classStats[selectedId]?.absentCount || 0}</p>
                                <p className="text-[10px]">ขาด</p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Progress Summary - Student View */}
                  {userRole === "STUDENT" && (
                    <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">ความคืบหน้าของฉัน</h3>
                      {progressLoading ? (
                        <p className="text-xs text-gray-400">กำลังโหลด...</p>
                      ) : (
                        <ul className="text-xs text-gray-300 space-y-2">
                          <li>
                            งานที่ส่ง: 
                            <span className="ml-1 text-blue-300 font-medium">
                              {studentProgress[selectedId]?.submittedAssignments || 0} / {studentProgress[selectedId]?.totalAssignments || 0} ชิ้น
                            </span>
                          </li>
                          <li>
                            การเข้าเรียน: 
                            <span className="ml-1 text-blue-300 font-medium">
                              {studentProgress[selectedId]?.attendanceSummary?.percentage || 0}%
                            </span>
                            <span className="text-[10px] text-gray-500 ml-1">
                              ({studentProgress[selectedId]?.attendanceSummary?.present || 0}/{studentProgress[selectedId]?.attendanceSummary?.total || 0} ครั้ง)
                            </span>
                          </li>
                          {studentProgress[selectedId]?.gradesSummary?.totalMaxScore > 0 && (
                            <li>
                              คะแนน: 
                              <span className="ml-1 text-blue-300 font-medium">
                                {studentProgress[selectedId]?.gradesSummary?.totalScore || 0} / {studentProgress[selectedId]?.gradesSummary?.totalMaxScore || 0}
                              </span>
                              <span className="text-[10px] text-gray-500 ml-1">
                                ({studentProgress[selectedId]?.gradesSummary?.percentage || 0}%)
                              </span>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}

            {/* ASSIGNMENT */}
            {activeTab === "assignment" && (
              <>
                {/* Assignment List */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3">
                    รายการงานที่ได้รับมอบหมาย
                  </h3>

                  {currentAssignments.length === 0 ? (
                    <p className="text-[11px] text-gray-400">
                      ยังไม่มีงานที่ถูกมอบหมายในวิชานี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentAssignments.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedAssignmentId(a.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                            selectedAssignment && selectedAssignment.id === a.id
                              ? "border-violet-500 bg-violet-600/20"
                              : "border-[#1f2937] bg-[#020617] hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[13px]">
                              {a.title}
                            </span>
                            {renderStatusBadge(a)}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span>
                              ประเภท: <span className="text-gray-300">{a.type}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              กำหนดส่ง: {formatDate(a.dueDate)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-gray-500">
                    * UI ตัวอย่าง – เชื่อมหลังบ้านเมื่อพร้อม
                  </p>
                </div>

                {/* Assignment Detail */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3">
                    รายละเอียดงาน & การส่งไฟล์
                  </h3>

                  {!selectedAssignment ? (
                    <p className="text-[11px] text-gray-400">
                      เลือกงานจากด้านซ้ายเพื่อดูรายละเอียดและส่งไฟล์
                    </p>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3">

                      <div>
                        <p className="text-[11px] text-gray-400 mb-1">ชื่องาน</p>
                        <p className="text-sm font-semibold text-gray-100">
                          {selectedAssignment.title}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">
                            วันที่มอบหมาย
                          </p>
                          <p>{formatDate(selectedAssignment.givenAt)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">
                            กำหนดส่ง
                          </p>
                          <p>{formatDate(selectedAssignment.dueDate)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">
                          คำสั่งจากอาจารย์
                        </p>
                        <p className="text-[12px] leading-relaxed text-gray-200">
                          {selectedAssignment.description}
                        </p>
                      </div>

                      <div className="border-t border-[#1f2937] pt-3 mt-1">
                        <p className="text-[11px] text-gray-400 mb-1">
                          สถานะการส่งงาน
                        </p>
                        {renderStatusBadge(selectedAssignment)}
                        {selectedAssignment.submittedAt && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            ส่งล่าสุดเมื่อ{" "}
                            {new Date(
                              selectedAssignment.submittedAt
                            ).toLocaleString("th-TH")}
                          </p>
                        )}
                      </div>

                      {/* Upload */}
                      <div className="border-t border-[#1f2937] pt-3 mt-1">
                        <p className="text-[11px] text-gray-400 mb-1">
                          แนบไฟล์ส่งงาน
                        </p>

                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#374151] hover:border-violet-500 hover:bg-violet-600/10 cursor-pointer text-[11px] text-gray-200">
                          <Upload size={14} />
                          <span>เลือกไฟล์จากเครื่องของคุณ</span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                            onChange={(e) =>
                              handleUploadFiles(
                                selectedClass.id,
                                selectedAssignment.id,
                                e.target.files
                              )
                            }
                          />
                        </label>

                        <p className="mt-1 text-[10px] text-gray-500">
                          * ตัวอย่างการส่งงานจริง – รอเชื่อม API
                        </p>
                      </div>

                      {/* Uploaded Files */}
                      {selectedAssignment.files &&
                        selectedAssignment.files.length > 0 && (
                          <div className="border-t border-[#1f2937] pt-3 mt-1">
                            <p className="text-[11px] text-gray-400 mb-1">
                              ไฟล์ที่แนบแล้ว
                            </p>
                            <ul className="text-[11px] text-gray-200 space-y-1">
                              {selectedAssignment.files.map((f, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center justify-between rounded-md bg-slate-900/70 px-2 py-1"
                                >
                                  <span className="truncate">{f.name}</span>
                                  <span className="text-[10px] text-gray-500 ml-2">
                                    {(f.size / 1024).toFixed(1)} KB
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Attendance */}
            {activeTab === "attendance" && (
              <>
                {attendanceLoading ? (
                  <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-400">
                    <h3 className="text-sm font-semibold mb-3">การเข้าเรียน</h3>
                    <p>กำลังโหลด...</p>
                  </div>
                ) : (
                  <>
                    {userRole === "TEACHER" ? (
                      // Teacher view: summary of class attendance
                      <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300 md:col-span-2">
                        <h3 className="text-sm font-semibold mb-3">สรุปการเข้าเรียนของชั้นเรียน</h3>
                        
                        {attendance[selectedId]?.length === 0 ? (
                          <p className="text-[11px] text-gray-400">ยังไม่มีบันทึกการเข้าเรียน</p>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-center">
                                <p className="text-xl font-bold text-emerald-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'present').length}
                                </p>
                                <p className="text-[10px]">เข้าเรียน</p>
                              </div>
                              <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-500/30 text-center">
                                <p className="text-xl font-bold text-yellow-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'late').length}
                                </p>
                                <p className="text-[10px]">สาย</p>
                              </div>
                              <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/30 text-center">
                                <p className="text-xl font-bold text-red-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'absent').length}
                                </p>
                                <p className="text-[10px]">ขาด</p>
                              </div>
                            </div>
                            
                            <div className="text-[11px] text-gray-400">
                              <p>รวม: {attendance[selectedId]?.length || 0} ครั้ง</p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      // Student view: their own attendance summary
                      <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300">
                        <h3 className="text-sm font-semibold mb-3">สถานะการเข้าเรียนของฉัน</h3>
                        
                        {attendance[selectedId]?.length === 0 ? (
                          <p className="text-[11px] text-gray-400">ยังไม่มีบันทึกการเข้าเรียน</p>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-center">
                                <p className="text-lg font-bold text-emerald-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'present').length}
                                </p>
                                <p className="text-[10px]">เข้าเรียน</p>
                              </div>
                              <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-500/30 text-center">
                                <p className="text-lg font-bold text-yellow-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'late').length}
                                </p>
                                <p className="text-[10px]">สาย</p>
                              </div>
                              <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/30 text-center">
                                <p className="text-lg font-bold text-red-300">
                                  {(attendance[selectedId] || []).filter(a => a.status === 'absent').length}
                                </p>
                                <p className="text-[10px]">ขาด</p>
                              </div>
                            </div>
                            
                            <div className="text-[11px] space-y-1">
                              <p>รวมทั้งหมด: <span className="text-gray-100 font-medium">{attendance[selectedId]?.length || 0}</span> ครั้ง</p>
                              {attendance[selectedId] && attendance[selectedId].length > 0 && (
                                <p>ร้อยละการเข้าเรียน: 
                                  <span className="text-blue-300 font-medium">
                                    {Math.round((attendance[selectedId].filter(a => a.status === 'present').length / attendance[selectedId].length) * 100)}%
                                  </span>
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="hidden md:block"></div>
              </>
            )}

            {/* Announcements */}
            {activeTab === "announcements" && (
              <div className="col-span-full">
                <ClassAnnouncements classId={selectedId} userRole={userRole} />
              </div>
            )}

            {/* Schedule */}
            {activeTab === "schedule" && (
              <div className="col-span-full">
                <ClassSchedule classId={selectedId} />
              </div>
            )}

            {/* Students Management */}
            {activeTab === "students" && (
              <div className="col-span-full">
                <ClassStudents classId={selectedId} userRole={userRole} />
              </div>
            )}

            {/* Schedule Manager - Teacher Only */}
            {activeTab === "scheduleManager" && userRole === "TEACHER" && (
              <div className="col-span-full">
                <ClassScheduleManager classId={selectedId} className={selectedClass?.name} />
              </div>
            )}

            {/* Assignment Creator - Teacher Only */}
            {activeTab === "createAssignments" && userRole === "TEACHER" && (
              <div className="col-span-full">
                <ClassAssignmentCreator classId={selectedId} userRole={userRole} />
              </div>
            )}

            {/* Settings / Class Management */}
            {activeTab === "settings" && (
              <div className="col-span-full">
                <ClassManagement 
                  classId={selectedId} 
                  userRole={userRole} 
                  onClassSelect={setSelectedId}
                  onClassDelete={(deletedId) => {
                    setClasses((prevClasses) => {
                      const updated = prevClasses.filter(c => c.id !== deletedId);
                      if (selectedId === deletedId) {
                        setSelectedId(updated[0]?.id || null);
                      }
                      return updated;
                    });
                  }}
                />
              </div>
            )}
            </div>
          )}
        </div>
      </section>

      {/* Popup ตารางเรียน (แบบ FULL UPGRADE) */}
      {isScheduleOpen && selectedClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
              <span className="text-sm text-gray-100 flex items-center gap-2">
                <Calendar size={16} className="text-violet-400" /> 
                ตารางเรียน • {selectedClass?.name || "---"}
              </span>
              <button className="p-1 rounded-md hover:bg-slate-800" onClick={() => setIsScheduleOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 text-xs text-gray-300 space-y-5">

              {/* COURSE SUMMARY */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1f2937] p-3 bg-[#020617]">
                  <h4 className="text-[11px] text-gray-400">รายวิชา</h4>
                  <p className="text-sm font-semibold text-gray-100">{selectedClass?.name || "---"}</p>
                  <p className="text-[11px] text-gray-400">{selectedClass?.code || "---"} • {selectedClass?.section || "---"}</p>
                </div>

                <div className="rounded-xl border border-[#1f2937] p-3 bg-[#020617]">
                  <h4 className="text-[11px] text-gray-400">อาจารย์ผู้สอน</h4>
                  <p className="text-sm font-semibold text-gray-100">{selectedClass?.teacher?.username || "---"}</p>
                  <p className="text-[11px] text-gray-400">ห้อง {selectedClass?.room || "---"}</p>
                </div>
              </div>

              {/* WEEKLY TIMETABLE */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">ตารางเรียนรายสัปดาห์</h4>

                {scheduleLoading ? (
                  <p className="text-xs text-gray-400">กำลังโหลด...</p>
                ) : scheduleData.length > 0 ? (
                  <div className="space-y-2">
                    {scheduleData.map((item, idx) => {
                      const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
                      const dayLabel = dayNames[item.dayOfWeek] || `Day ${item.dayOfWeek}`;
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-violet-600/10 border border-violet-500/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-violet-300">{dayLabel}</p>
                              <p className="text-[11px] text-gray-300">{item.startTime} – {item.endTime}</p>
                            </div>
                            {item.room && (
                              <p className="text-[10px] text-gray-400">ห้อง {item.room}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">ไม่มีตารางเรียน</p>
                )}
              </div>

              {/* UPCOMING */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">คาบเรียนถัดไป</h4>
                {scheduleData.length > 0 ? (
                  <>
                    <p className="text-sm">{scheduleData[0]?.startTime} – {scheduleData[0]?.endTime}</p>
                    {scheduleData[0]?.room && (
                      <p className="text-[11px] text-gray-400">ห้อง {scheduleData[0].room}</p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-gray-400">ไม่มีตารางเรียน</p>
                )}
              </div>

              {/* EXAMS */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">กำหนดการสอบ</h4>
                  {isTeacher && (
                    <button
                      onClick={() => setIsExamModalOpen(true)}
                      className="px-2 py-1 text-[10px] bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 rounded border border-violet-500/30 transition"
                    >
                      + จัดการ
                    </button>
                  )}
                </div>
                {examList && examList.length > 0 ? (
                  <ul className="text-[11px] space-y-2">
                    {examList.map(exam => (
                      <li key={exam.id} className="p-2 rounded bg-gray-800/50 border border-[#1f2937]">
                        <span className="font-medium">{exam.name}</span> • {new Date(exam.examDate).toLocaleDateString('th-TH')} • {exam.startTime} – {exam.endTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-gray-400">ไม่มีกำหนดการสอบ</p>
                )}
              </div>

              {/* ATTENDANCE STATS */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-3">สรุปการเข้าเรียน</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40">
                    <p className="text-xl font-bold text-emerald-300">12</p>
                    <p className="text-[10px]">เข้าเรียน</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-600/20 border border-yellow-500/40">
                    <p className="text-xl font-bold text-yellow-300">2</p>
                    <p className="text-[10px]">สาย</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/40">
                    <p className="text-xl font-bold text-red-300">1</p>
                    <p className="text-[10px]">ขาดเรียน</p>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">โน้ตการเรียนรายวิชา</h4>
                <textarea
                  className="w-full bg-[#0f172a] border border-[#1f2937] rounded-lg p-2 text-xs h-20 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="บันทึกโน้ต หรือสิ่งที่ต้องเตรียมตัว..."
                ></textarea>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setIsPDFModalOpen(true)}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-violet-600 hover:bg-violet-500"
                >
                  ดาวน์โหลด PDF
                </button>

                <button
                  onClick={() => setIsGoogleCalendarModalOpen(true)}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-[#374151] hover:bg-slate-800"
                >
                  เพิ่มลง Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      <JoinRequestModal 
        isOpen={isJoinRequestModalOpen} 
        onClose={() => setIsJoinRequestModalOpen(false)} 
        classId={selectedId}
        className={selectedClass?.name}
      />

      {/* Join Confirmation Modal */}
      <JoinConfirmationModal 
        isOpen={isJoinConfirmationModalOpen} 
        onClose={() => setIsJoinConfirmationModalOpen(false)} 
        className={selectedClass?.name}
        classCode={selectedClass?.code}
        teacherName={selectedClass?.teacher?.username || 'Unknown'}
        onConfirm={handleConfirmJoin}
        isLoading={joinRequestLoading}
      />

      {/* Exam Schedule Modal */}
      <ExamScheduleModal 
        isOpen={isExamModalOpen} 
        onClose={() => setIsExamModalOpen(false)} 
        classId={selectedId}
        className={selectedClass?.name}
      />

      {/* PDF Export Modal */}
      <PDFExportModal 
        isOpen={isPDFModalOpen} 
        onClose={() => setIsPDFModalOpen(false)} 
        classId={selectedId}
        className={selectedClass?.name}
      />

      {/* Google Calendar Modal */}
      <GoogleCalendarModal 
        isOpen={isGoogleCalendarModalOpen} 
        onClose={() => setIsGoogleCalendarModalOpen(false)} 
        classId={selectedId}
        className={selectedClass?.name}
      />

      {/* Error Alert Modal */}
      <ErrorAlertModal
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="เกิดข้อผิดพลาด"
        message={errorMessage}
      />
    </div>
  );
}
