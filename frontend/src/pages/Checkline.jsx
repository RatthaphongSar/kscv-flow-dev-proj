// frontend/src/pages/Checkline.jsx
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Users,
  Send,
  Loader,
} from "lucide-react";
import { classApi } from "../api/classApi";
import { attendanceApi } from "../api/attendanceApi";
import { useAuth } from "../context/AuthContext";

// ======================================
// Mock ข้อมูล attendance – ใช้ชั่วคราว
// ======================================
const mockCheckline = [
  { id: "cl1", classId: "c1", date: "2025-03-31", status: "present", checkinTime: "09:03", note: "เข้าตรงเวลา" },
  { id: "cl2", classId: "c1", date: "2025-04-01", status: "late", checkinTime: "10:07", note: "สายเนื่องจากรถติด" },
  { id: "cl3", classId: "c1", date: "2025-04-02", status: "absent", checkinTime: "-", note: "ไม่ได้เข้าชั้นเรียน" },
];

const mockAssembly = [
  { date: "2025-03-31", status: "present", time: "07:58" },
  { date: "2025-04-01", status: "late", time: "08:06" },
  { date: "2025-04-02", status: "absent", time: "-" },
];

// ======================================
function fmt(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

const WARN_TIME = 7 * 60 + 50;
const ONTIME_TIME = 7 * 60 + 55;
const LATE_TIME = 8 * 60;

// ======================================
export default function ChecklinePage() {
  const nowInitial = new Date();
  const [now, setNow] = useState(nowInitial);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classAttendanceList, setClassAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const { user } = useAuth();

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // ใหม่! ย้อนดูสัปดาห์ย้อนหลังได้
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch classes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await classApi.getClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch attendance records when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchAttendance = async () => {
      try {
        const records = await attendanceApi.getMyAttendance(selectedClass);
        setAttendanceRecords(records || []);

        // Get summary for the class
        const summaryData = await attendanceApi.getAttendanceSummary(selectedClass);
        setSummary(summaryData);

        // Get class attendance (if teacher)
        if (user?.role === 'teacher') {
          const classRecords = await attendanceApi.getAttendanceByClass(selectedClass);
          setClassAttendanceList(classRecords || []);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceRecords([]);
      }
    };

    fetchAttendance();
  }, [selectedClass, user?.role]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Handle check-in
  const handleCheckIn = async () => {
    if (!selectedClass) return;

    try {
      setCheckingIn(true);
      setCheckInStatus(null);

      const currentTime = new Date();
      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');

      // Determine status based on time (simplified - assume 08:00 is on-time)
      const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      let status = 'present';
      if (totalMinutes >= 8 * 60) {
        status = 'late';
      }

      await attendanceApi.checkIn(
        selectedClass,
        todayStr,
        status,
        `Checked in at ${hours}:${minutes}`
      );

      setCheckInStatus({
        type: 'success',
        message: `เช็คชื่อสำเร็จ - ${status === 'present' ? 'เข้าตรงเวลา' : 'มาสาย'}`
      });

      // Refresh attendance data
      const records = await attendanceApi.getMyAttendance(selectedClass);
      setAttendanceRecords(records || []);
      setSelectedDate(todayStr);

      setTimeout(() => setCheckInStatus(null), 3000);
    } catch (err) {
      console.error("Error checking in:", err);
      setCheckInStatus({
        type: 'error',
        message: 'เช็คชื่อไม่สำเร็จ กรุณาลองใหม่'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const startOfWeek = getStartOfWeek(today);
  const targetWeekStart = new Date(startOfWeek);
  targetWeekStart.setDate(startOfWeek.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(targetWeekStart);
    d.setDate(targetWeekStart.getDate() + i);
    return d;
  });

  const classRecords = attendanceRecords.filter(r => {
    const recordDate = new Date(r.date).toISOString().slice(0, 10);
    return recordDate === r.date || r.classId === selectedClass;
  });
  const dailyRecord = classRecords.find(r => {
    const recordDate = new Date(r.date).toISOString().slice(0, 10);
    return recordDate === selectedDate;
  });
  const classInfo = classes.find(c => c.id === selectedClass);
  const assemblyRecord = mockAssembly.find(a => a.date === selectedDate);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let assemblyAlert = null;
  if (currentMinutes >= WARN_TIME && currentMinutes < ONTIME_TIME) {
    assemblyAlert = { type: "warn", text: "อีกประมาณ 5 นาทีจะถึงเวลาเข้าแถว 07:55 น." };
  } else if (currentMinutes >= ONTIME_TIME && currentMinutes < LATE_TIME) {
    assemblyAlert = { type: "info", text: "ถึงเวลาเข้าแถวแล้ว (07:55 น.)" };
  } else if (currentMinutes >= LATE_TIME && currentMinutes < LATE_TIME + 60) {
    assemblyAlert = { type: "danger", text: "เลยเวลาเข้าแถวแล้ว (>= 08:00 น.)" };
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#020617] flex">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-72 h-full border-r border-[#1f2937] bg-[#020617] flex flex-col">
        <div className="px-4 py-4 border-b border-[#1f2937]">
          <h1 className="text-sm font-semibold">ระบบเช็คชื่อ</h1>
          <p className="text-[11px] text-gray-400">ข้อมูลเช็คชื่อเรียน + การเข้าแถว</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400">กำลังโหลด...</div>
          ) : classes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">ไม่มีรายวิชา</div>
          ) : (
            classes.map(cls => {
              const active = cls.id === selectedClass;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls.id);
                    setSelectedDate(null);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2 border ${
                    active
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-transparent text-gray-300 border-[#1f2937] hover:bg-slate-800"
                }`}
              >
                <div className="font-semibold text-[13px]">{cls.code}</div>
                <div className="text-[11px]">{cls.name}</div>
              </button>
            );
            })
          )}
        </div>
      </aside>

      {/* ================= MAIN CALENDAR ================= */}
      <section className="flex-1 border-r border-[#1f2937] overflow-y-auto p-6">

        <h2 className="text-lg font-semibold mb-2">บันทึกเช็คชื่อประจำสัปดาห์</h2>

        {/* ปุ่มควบคุมสัปดาห์ย้อนหลัง */}
        <div className="flex items-center gap-2 mb-4">
          <button
            className="px-3 py-1.5 border border-[#1f2937] rounded-lg hover:bg-slate-800 text-xs"
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            ← สัปดาห์ก่อน
          </button>

          <button
            className="px-3 py-1.5 border border-[#1f2937] rounded-lg hover:bg-slate-800 text-xs"
            onClick={() => setWeekOffset(0)}
          >
            สัปดาห์นี้
          </button>

          <button
            className="px-3 py-1.5 border border-[#1f2937] rounded-lg hover:bg-slate-800 text-xs"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            สัปดาห์ถัดไป →
          </button>
        </div>

        {/* Alert เข้าแถว */}
        {assemblyAlert && weekOffset === 0 && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-xs flex items-start gap-2 ${
              assemblyAlert.type === "warn"
                ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
                : assemblyAlert.type === "danger"
                ? "border-red-500/70 bg-red-500/10 text-red-200"
                : "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            <Clock size={14} className="mt-0.5" />
            <div>
              <div className="font-medium text-[11px] uppercase tracking-wide">
                Assembly Alert • {now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <p className="mt-1">{assemblyAlert.text}</p>
            </div>
          </div>
        )}

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {weekDays.map((d, idx) => {
            const dateStr = d.toISOString().slice(0, 10);
            const rec = classRecords.find(r => r.date === dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = weekOffset === 0 && dateStr === todayStr;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(dateStr)}
                className={`rounded-xl px-3 py-3 border text-xs flex flex-col items-center ${
                  isSelected
                    ? "border-violet-500 bg-violet-600/30"
                    : "border-[#1f2937] bg-[#020617] hover:bg-slate-800"
                } ${isToday ? "ring-1 ring-violet-500/60" : ""}`}
              >
                <span className="text-gray-400 text-[10px]">{d.toLocaleDateString("th-TH", { weekday: "short" })}</span>
                <span className="text-xl">{d.getDate()}</span>

                {rec?.status === "present" && <CheckCircle2 className="text-emerald-400 mt-1" size={16} />}
                {rec?.status === "late" && <AlertTriangle className="text-yellow-400 mt-1" size={16} />}
                {rec?.status === "absent" && <XCircle className="text-red-400 mt-1" size={16} />}

                {isToday && (
                  <span className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-200 border border-violet-500/60">
                    วันนี้
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Weekly Summary */}
        <div className="border border-[#1f2937] rounded-xl p-4 bg-[#020617] mb-12">
          <h3 className="text-sm font-semibold mb-2">สรุปผลเช็คชื่อรายสัปดาห์</h3>
          {summary ? (
            <ul className="text-xs text-gray-300 space-y-1">
              <li>เข้าตรงเวลา: {summary.present || 0} ครั้ง</li>
              <li>มาสาย: {summary.late || 0} ครั้ง</li>
              <li>ขาดเรียน: {summary.absent || 0} ครั้ง</li>
              <li>เปอร์เซ็นต์เข้าเรียน: {summary.percentage || 0}%</li>
            </ul>
          ) : (
            <p className="text-xs text-gray-400">กำลังโหลดข้อมูล...</p>
          )}
        </div>
      </section>

      {/* ================= RIGHT DETAIL PANEL ================= */}
      <aside className="w-80 bg-[#020617] p-4 text-xs overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3">รายละเอียดเช็คชื่อ</h3>

        {/* STUDENT CHECK-IN BUTTON */}
        {user?.role === 'student' && weekOffset === 0 && (
          <div className="mb-4 p-3 border border-violet-500/50 rounded-lg bg-violet-500/10">
            {!selectedDate || selectedDate !== todayStr ? (
              <p className="text-xs text-gray-400 mb-2">เลือกวันนี้เพื่อรายงานตัว</p>
            ) : (
              <>
                <p className="text-xs text-gray-300 mb-2">รายงานตัวเช็คชื่อ</p>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || !selectedClass}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 rounded-lg text-white text-xs font-medium transition"
                >
                  {checkingIn ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      รายงานตัว
                    </>
                  )}
                </button>

                {checkInStatus && (
                  <div className={`mt-2 p-2 rounded text-xs text-center ${
                    checkInStatus.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50'
                      : 'bg-red-500/20 text-red-200 border border-red-500/50'
                  }`}>
                    {checkInStatus.message}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!selectedDate ? (
          <p className="text-gray-400">เลือกวันที่จากปฏิทิน</p>
        ) : (
          <>
            {/* TEACHER VIEW: STUDENT ATTENDANCE LIST */}
            {user?.role === 'teacher' && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Users size={14} className="text-violet-400" />
                  นักเรียนที่เช็คชื่อ ({selectedDate})
                </h4>

                {classAttendanceList.length === 0 ? (
                  <p className="text-gray-400">ยังไม่มีนักเรียนเช็คชื่อ</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {classAttendanceList
                      .filter(rec => {
                        const recDate = new Date(rec.date).toISOString().slice(0, 10);
                        return recDate === selectedDate;
                      })
                      .map(rec => (
                        <div
                          key={rec.id}
                          className="p-2 rounded bg-[#1f2937] border border-[#374151]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-200">{rec.student?.username}</div>
                              <div className="text-[11px] text-gray-400">{rec.student?.year || '-'} / {rec.student?.major || '-'}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                rec.status === 'present'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : rec.status === 'late'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {rec.status === 'present' && 'เข้าตรงเวลา'}
                                {rec.status === 'late' && 'มาสาย'}
                                {rec.status === 'absent' && 'ขาดเรียน'}
                              </span>
                              {rec.remark && (
                                <span className="text-[10px] text-gray-400">{rec.remark}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* STUDENT VIEW: CLASS CHECK-IN INFO */}
            {user?.role === 'student' && (
              <>
                {/* CLASS CHECK-IN */}
                <div className="space-y-3 text-gray-300 mb-6">
                  <h4 className="text-sm font-semibold">เช็คชื่อเข้าชั้นเรียน</h4>

                  {!dailyRecord ? (
                    <p className="text-gray-400">ยังไม่มีการเช็คชื่อในวันนี้</p>
                  ) : (
                    <>
                      <div>
                        <div className="text-[11px] text-gray-400">รายวิชา</div>
                        <div className="text-sm font-semibold">{classInfo?.name}</div>
                        <div className="text-[11px]">{classInfo?.code}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{fmt(selectedDate)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>เวลาเช็คชื่อ: {dailyRecord?.checkinTime || '-'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-gray-400" />
                        <span>
                          สถานะ:{" "}
                          {dailyRecord?.status === "present" && "เข้าตรงเวลา"}
                          {dailyRecord?.status === "late" && "มาสาย"}
                          {dailyRecord?.status === "absent" && "ขาดเรียน"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* ASSEMBLY */}
                <div className="space-y-3 text-gray-300 mb-6">
                  <h4 className="text-sm font-semibold flex items-center gap-1">
                    <Users size={14} className="text-violet-400" />
                    เช็คชื่อเข้าแถว (Assembly)
                  </h4>

                  {!assemblyRecord ? (
                    <p className="text-gray-400">ไม่มีข้อมูลเข้าแถววันนี้</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{fmt(selectedDate)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>เวลาเข้าแถว: {assemblyRecord.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-gray-400" />
                        <span>
                          สถานะ:{" "}
                          {assemblyRecord.status === "present" && "ตรงเวลา"}
                          {assemblyRecord.status === "late" && "สาย"}
                          {assemblyRecord.status === "absent" && "ไม่เข้าแถว"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* =================== PIPELINE TIMELINE =================== */}
            <h4 className="text-sm font-semibold mb-2">Timeline (Pipeline)</h4>
            <Pipeline
              date={selectedDate}
              classRec={dailyRecord}
              assemblyRec={assemblyRecord}
            />
          </>
        )}
      </aside>
    </div>
  );
}

// =================== PIPELINE COMPONENT ===================
function Pipeline({ date, classRec, assemblyRec }) {
  const items = [];

  if (assemblyRec) {
    items.push({
      time: assemblyRec.time,
      label: "เข้าแถว",
      status:
        assemblyRec.status === "present"
          ? "ตรงเวลา"
          : assemblyRec.status === "late"
          ? "สาย"
          : "ไม่เข้าแถว",
      color:
        assemblyRec.status === "present"
          ? "text-emerald-400"
          : assemblyRec.status === "late"
          ? "text-amber-400"
          : "text-red-400",
    });
  }

  if (classRec) {
    items.push({
      time: classRec.checkinTime,
      label: "เข้าชั้นเรียน",
      status:
        classRec.status === "present"
          ? "ตรงเวลา"
          : classRec.status === "late"
          ? "สาย"
          : "ขาดเรียน",
      color:
        classRec.status === "present"
          ? "text-emerald-400"
          : classRec.status === "late"
          ? "text-amber-400"
          : "text-red-400",
    });
  }

  if (items.length === 0) {
    return <p className="text-[11px] text-gray-500">ไม่มีข้อมูลในวันนี้</p>;
  }

  return (
    <div className="mt-3 border-l border-[#1f2937] pl-4 space-y-3">
      {items.map((it, i) => (
        <div key={i} className="relative">
          <div
            className={`absolute -left-[11px] top-1 w-2 h-2 rounded-full ${it.color}`}
          ></div>

          <div className="text-xs text-gray-300">
            <span className="font-semibold text-gray-100">{it.time}</span>
            {" · "}
            <span className={it.color}>{it.label}</span>
            {" — "}
            {it.status}
          </div>
        </div>
      ))}
    </div>
  );
}
