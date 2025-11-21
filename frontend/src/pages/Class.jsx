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

  const selectedClass =
    classes.find((c) => c.id === selectedId) || classes[0];

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
        // Get class to check if student is enrolled
        const classData = await classApi.getClass(selectedId);
        
        // Check if student is in join requests
        const joinRequests = await classApi.getJoinRequests(selectedId);
        const studentRequest = joinRequests?.find(r => r.studentId === user?.id);
        
        setJoinRequestStatus(prev => ({
          ...prev,
          [selectedId]: {
            isEnrolled: classData._count?.students > 0, // Very basic check
            joinRequest: studentRequest,
            lastChecked: new Date()
          }
        }));
      } catch (err) {
        console.error("Error checking join status:", err);
      }
    };
    
    checkJoinStatus();
  }, [selectedId, userRole, user]);

  const handleRequestJoin = async () => {
    if (!selectedId) return;
    
    try {
      setJoinRequestLoading(true);
      const result = await classApi.requestToJoinClass(selectedId);
      alert('Join request sent! Please wait for teacher approval.');
      setJoinRequestStatus(prev => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          joinRequest: result
        }
      }));
    } catch (err) {
      console.error("Error requesting to join:", err);
      alert(err?.response?.data?.message || 'Failed to send join request');
    } finally {
      setJoinRequestLoading(false);
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
    <div className="w-full h-[calc(100vh-64px)] bg-[#020617] flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-[#1f2937] bg-[#020617] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f2937]">
          <h1 className="text-sm font-semibold text-gray-100">รายวิชา</h1>
          <p className="text-[11px] text-gray-400">
            วิชาที่ลงทะเบียนในภาคการศึกษานี้
          </p>
        </div>

        <div className="px-3 py-3">
          <input
            className="w-full bg-[#020617] border border-[#374151] rounded-md px-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="ค้นหารายวิชา..."
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1 min-h-0">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400">กำลังโหลด...</div>
          ) : error ? (
            <div className="px-3 py-2 text-xs text-red-400">ข้อผิดพลาด: {error}</div>
          ) : classes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">ไม่มีรายวิชา</div>
          ) : (
            classes.map((cls) => {
              const active = cls.id === selectedId;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedId(cls.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs mb-1 transition
                    ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-transparent text-gray-200 hover:bg-slate-800"
                    }`}
                >
                  <div className="font-semibold text-[13px]">{cls.code}</div>
                  <div className="text-[11px] truncate">{cls.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {cls.section} • {cls.semester || "---"}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#020617] flex-shrink-0">
          {selectedClass ? (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-100">
                    {selectedClass.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                    {selectedClass.code} • {selectedClass.section}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ห้อง: {selectedClass.room || "---"} • เซมิเสตอร์: {selectedClass.semester || "---"} • หน่วยกิต: {selectedClass.credits || 0}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Show Join Request button for students */}
                {userRole === "STUDENT" && (
                  joinRequestStatus[selectedId]?.joinRequest ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#374151] text-[11px]">
                      {joinRequestStatus[selectedId]?.joinRequest?.status === 'pending' && (
                        <div className="flex items-center gap-1 text-yellow-300">
                          <Clock size={14} />
                          <span>Pending Approval</span>
                        </div>
                      )}
                      {joinRequestStatus[selectedId]?.joinRequest?.status === 'approved' && (
                        <div className="flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 size={14} />
                          <span>Approved</span>
                        </div>
                      )}
                      {joinRequestStatus[selectedId]?.joinRequest?.status === 'rejected' && (
                        <div className="flex items-center gap-1 text-red-300">
                          <AlertCircle size={14} />
                          <span>Rejected</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestJoin}
                      disabled={joinRequestLoading}
                      className="hidden md:flex px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-[11px] disabled:opacity-50"
                    >
                      {joinRequestLoading ? "Requesting..." : "Request to Join"}
                    </button>
                  )
                )}

                <button
                  className="hidden md:flex px-3 py-1.5 rounded-md border border-[#374151] hover:bg-slate-800 text-[11px]"
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
        <div className="px-6 pt-3 border-b border-[#1f2937] bg-[#020617] flex-shrink-0">
          <div className="flex gap-4 text-xs overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 border-b-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              ภาพรวม
            </button>

            <button
              onClick={() => setActiveTab("assignment")}
              className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                activeTab === "assignment"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <FileText size={14} />
              งานที่ได้รับมอบหมาย
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                activeTab === "attendance"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Users size={14} />
              การเข้าเรียน
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                activeTab === "announcements"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Bell size={14} />
              ประกาศ
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                activeTab === "schedule"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Calendar size={14} />
              ตารางเรียน
            </button>

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("students")}
                className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                  activeTab === "students"
                    ? "border-violet-500 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Users size={14} />
                จัดการนักเรียน
              </button>
            )}

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("createAssignments")}
                className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                  activeTab === "createAssignments"
                    ? "border-violet-500 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Plus size={14} />
                สร้างงาน
              </button>
            )}

            {userRole === "TEACHER" && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`pb-2 border-b-2 flex items-center gap-1 whitespace-nowrap ${
                  activeTab === "settings"
                    ? "border-violet-500 text-gray-100"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Settings size={14} />
                ตั้งค่า
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
              activeTab === "announcements" || activeTab === "schedule" || activeTab === "students" || activeTab === "createAssignments" || activeTab === "settings"
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

            {/* Create Assignments */}
            {activeTab === "createAssignments" && (
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

                <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span>
                  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => {
                    const isClassDay = selectedClass?.day?.includes(d.slice(0,3)) || false;
                    return (
                      <div
                        key={d}
                        className={`h-10 rounded-md border text-[10px] flex items-center justify-center
                          ${
                            isClassDay
                              ? "border-violet-500 bg-violet-600/20 text-violet-200"
                              : "border-[#1f2937] bg-slate-900/40"
                          }
                        `}
                      >
                        {isClassDay ? selectedClass.time : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UPCOMING */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">คาบเรียนถัดไป</h4>
                <p>{selectedClass.day} • {selectedClass.time}</p>
                <p className="text-[11px] text-gray-400">ห้อง {selectedClass.room}</p>
              </div>

              {/* EXAMS */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">กำหนดการสอบ (ตัวอย่าง)</h4>
                <ul className="text-[11px] space-y-1">
                  <li>Midterm: 15 เม.ย. 2025 • 10:00 – 11:30</li>
                  <li>Final: 20 มิ.ย. 2025 • 09:00 – 11:00</li>
                </ul>
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
                  onClick={() => alert('(mock) ดาวน์โหลด PDF')}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-violet-600 hover:bg-violet-500"
                >
                  ดาวน์โหลด PDF
                </button>

                <button
                  onClick={() => alert('(mock) เพิ่มลง Google Calendar')}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-[#374151] hover:bg-slate-800"
                >
                  เพิ่มลง Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

