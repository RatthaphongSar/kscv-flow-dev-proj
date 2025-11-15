// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ArrowRight,
  Info,
  UserCheck,
  ClipboardList,
  Activity,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../utils/api'

// Default Mock Data (fallback if API fails)
const defaultUserAverages = {
  attendance: 92,
  assignment: 78,
  score: 84,
  activity: 15,
}

const teacherOverview = {
  title: 'ภาพรวมผู้เรียนเทอมนี้',
  notes: [
    'การเข้าเรียนเฉลี่ยของห้อง 89% ถือว่าดี',
    'คะแนนงานกลุ่มบางส่วนต่ำ ควรทำกิจกรรมปรับพื้นฐาน',
    'เตรียมสอบกลางภาคในวันที่ 15 เมษายนนี้',
  ],
}

const attendanceTrend = [
  { day: 'Mon', value: 92 },
  { day: 'Tue', value: 88 },
  { day: 'Wed', value: 95 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 93 },
  { day: 'Sat', value: 80 },
  { day: 'Sun', value: 85 },
]

const assignmentTrend = [
  { name: 'ส่งแล้ว', value: 21 },
  { name: 'ยังไม่ส่ง', value: 6 },
]

const activityStats = [
  { name: 'Clubs', value: 12 },
  { name: 'Projects', value: 5 },
  { name: 'Events', value: 3 },
]

const COLORS = ['#8b5cf6', '#22c55e', '#0ea5e9', '#facc15']

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Dashboard() {
  const { user } = useAuth()
  const [chartDetail, setChartDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userAverages, setUserAverages] = useState(defaultUserAverages)
  const [attendanceData, setAttendanceData] = useState([])
  const [popup, setPopup] = useState({
    open: false,
    type: null,
    title: '',
    content: null,
  })

  // Load data from API on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get transcript (grades)
        const transcript = await apiClient.get('/grades/transcript')
        
        // Get attendance
        const attendanceRecords = await apiClient.get('/attendance/my')
        
        // Process transcript data
        if (transcript?.gpa !== undefined) {
          setUserAverages(prev => ({
            ...prev,
            score: Math.round(transcript.gpa * 100) / 100
          }))
        }
        
        // Process attendance data
        if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
          const presentCount = attendanceRecords.filter(a => a.status === 'present').length
          const totalCount = attendanceRecords.length
          const attendancePercent = Math.round((presentCount / totalCount) * 100)
          setUserAverages(prev => ({
            ...prev,
            attendance: attendancePercent
          }))
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err.message || 'Failed to load data')
        setLoading(false)
      }
    }
    
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // ปิด Popup ด้วย ESC
  useEffect(() => {
    const close = (e) => e.key === 'Escape' && closePopup()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const openPopup = (type, title, content) => {
    setPopup({ open: true, type, title, content })
  }

  const closePopup = () => {
    setPopup({ open: false, type: null, title: '', content: null })
  }

  const onBarClick = (data) => {
    if (!data?.activeLabel) return
    openPopup(
      'assignment',
      `รายละเอียดงาน: ${data.activeLabel}`,
      <>
        {data.activeLabel === 'ยังไม่ส่ง' ? (
          <ul className="text-xs space-y-1 text-gray-300">
            <li>• นักศึกษา 001 - ยังไม่ส่ง</li>
            <li>• นักศึกษา 014 - ยังไม่ส่ง</li>
            <li>• นักศึกษา 020 - ยังไม่ส่ง</li>
            <li>• นักศึกษา 027 - ยังไม่ส่ง</li>
            <li>• นักศึกษา 033 - ยังไม่ส่ง</li>
            <li>• นักศึกษา 045 - ยังไม่ส่ง</li>
          </ul>
        ) : (
          <p className="text-xs text-gray-300">
            ส่งแล้วทั้งหมด {data.value} รายการ 🎉
          </p>
        )}
      </>
    )
  }

  const onPieClick = (data) => {
    openPopup(
      'activity',
      `กิจกรรม: ${data.name}`,
      <p className="text-xs text-gray-300">
        คุณเข้าร่วมกิจกรรม {data.name} ทั้งหมด {data.value} ครั้ง
      </p>
    )
  }

  const onLineClick = (data) => {
    openPopup(
      'attendance',
      `สถิติการเข้าเรียนวัน ${data.day}`,
      <p className="text-xs text-gray-300">
        คุณเข้าเรียน {data.value}% ของวัน {data.day}
      </p>
    )
  }

  return (
    <div className="h-[calc(100vh-112px)] w-full bg-[#020617] text-gray-100 px-4 py-4">
      <div className="h-full rounded-2xl border border-[#1f2937] bg-[#020617] overflow-hidden p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">
              ข้อมูลภาพรวมการเรียนของคุณ
            </p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <div>Term: 2 / 2025</div>
            <div>Last sync: 5 mins ago</div>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI label="Attendance" value={`${userAverages.attendance}%`} color="text-emerald-400" icon={<UserCheck size={14} />} />
          <KPI label="Assignments" value={`${userAverages.assignment}%`} color="text-sky-400" icon={<ClipboardList size={14} />} />
          <KPI label="Scores (avg)" value={`${userAverages.score}%`} color="text-violet-400" icon={<Info size={14} />} />
          <KPI label="Activities" value={userAverages.activity} color="text-amber-300" icon={<Activity size={14} />} />
        </div>

        {/* Teacher Overview + User Avg Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Teacher Panel */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">📘 ภาพรวมจากอาจารย์ผู้สอน</h2>
            <p className="text-[11px] text-gray-400 mb-3">
              บทสรุปภาพรวมของเทอม (ข้อมูลที่อาจารย์โพสต์)
            </p>

            <ul className="text-xs text-gray-300 space-y-2">
              {teacherOverview.notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  {n}
                </li>
              ))}
            </ul>

            <button
              className="mt-4 text-xs px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 flex items-center gap-2"
              onClick={() =>
                openPopup('teacher', 'รายละเอียดเพิ่มเติม', 
                  <ul className="text-xs text-gray-300 space-y-2">
                    {teacherOverview.notes.map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                    <li>• มีกิจกรรมเสริมเพิ่มเติมช่วงสัปดาห์หน้า</li>
                    <li>• อาจารย์พร้อมตอบคำถามผ่านระบบแชท</li>
                  </ul>
                )
              }
            >
              ดูรายละเอียดทั้งหมด <ArrowRight size={14} />
            </button>
          </div>

          {/* User Performance Panel */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">📊 ค่าเฉลี่ยสรุปผลสำหรับคุณ</h2>
            <p className="text-[11px] text-gray-400 mb-3">
              ค่าประเมินรวมจากการเรียนและกิจกรรม (เฉพาะบัญชีผู้ใช้)
            </p>

            <div className="space-y-3 text-xs">
              <AvgRow label="Attendance" value={`${userAverages.attendance}%`} />
              <AvgRow label="Assignments" value={`${userAverages.assignment}%`} />
              <AvgRow label="Scores" value={`${userAverages.score}%`} />
              <AvgRow label="Activities" value={userAverages.activity} />
            </div>

            <button
              className="mt-4 text-xs px-3 py-1.5 rounded-md border border-[#374151] hover:bg-slate-800 flex items-center gap-2"
              onClick={() =>
                openPopup('analysis', 'วิเคราะห์ผลการเรียนเพิ่มเติม',
                  <p className="text-xs text-gray-300">
                    ระบบกำลังพัฒนาการวิเคราะห์เชิงลึก เช่นจุดอ่อนรายวิชา,
                    ความสม่ำเสมอในการส่งงาน, และคำแนะนำเฉพาะรายบุคคล
                  </p>
                )
              }
            >
              วิเคราะห์ผลการเรียนเพิ่มเติม
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Attendance Trend Chart */}
        <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
          <h2 className="text-sm font-semibold mb-2">Weekly Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceTrend}
                onClick={(state) => state.activePayload && onLineClick(state.activePayload[0].payload)}
              >
                <CartesianGrid stroke="#1f2937" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid #4b5563' }} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activities & Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Assignments Bar Chart */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">Assignments Status</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assignmentTrend}
                  onClick={(e) => onBarClick(e.activePayload?.[0]?.payload)}
                >
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#020617', border: '1px solid #4b5563' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {assignmentTrend.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activities Pie Chart */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">Activities Distribution</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityStats}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={40}
                    onClick={onPieClick}
                  >
                    {activityStats.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* ================= POPUP ================= */}
      {popup.open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div
            className="w-full max-w-md bg-[#020617] border border-[#1f2937] rounded-2xl p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close BTN */}
            <button
              className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-800"
              onClick={closePopup}
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-semibold mb-2">{popup.title}</h2>
            <div className="text-xs text-gray-300">
              {popup.content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------- Components ----------------

function KPI({ label, value, color, icon }) {
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
      <div className="text-[11px] text-gray-400 flex items-center gap-2">
        {icon} {label}
      </div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  )
}

function AvgRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#1f2937] pb-1">
      <span>{label}</span>
      <span className="text-violet-300 font-semibold">{value}</span>
    </div>
  )
}
