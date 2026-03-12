// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Info,
  UserCheck,
  ClipboardList,
  Activity,
  FileSpreadsheet,
  TrendingUp,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../utils/api'

// Default fallback data
const defaultUserAverages = {
  attendance: 0,
  assignment: 0,
  score: 0,
  activity: 0,
}

const teacherOverview = {
  title: 'ภาพรวมผู้เรียนเทอมนี้',
  notes: [
    'การเข้าเรียนเฉลี่ยของห้อง 89% ถือว่าดี',
    'คะแนนงานกลุ่มบางส่วนต่ำ ควรทำกิจกรรมปรับพื้นฐาน',
    'เตรียมสอบกลางภาคในวันที่ 15 เมษายนนี้',
  ],
}

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
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [grades, setGrades] = useState([])
  const [assignmentTrend, setAssignmentTrend] = useState([{ name: 'ส่งแล้ว', value: 0 }, { name: 'ยังไม่ส่ง', value: 0 }])
  const [activityStats, setActivityStats] = useState([{ name: 'Clubs', value: 0 }, { name: 'Events', value: 0 }])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [popup, setPopup] = useState({
    open: false,
    type: null,
    title: '',
    content: null,
  })
  const maxAssignmentValue = Math.max(...assignmentTrend.map((item) => item.value), 1)
  const maxActivityValue = Math.max(...activityStats.map((item) => item.value), 1)

  // Load data from API on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [transcript, attRecords, clubsData] = await Promise.allSettled([
          apiClient.get('/grades/transcript'),
          apiClient.get('/attendance/my'),
          apiClient.get('/clubs/my'),
        ])

        const transcriptData = transcript.status === 'fulfilled' ? transcript.value : null
        const attendanceData = attRecords.status === 'fulfilled' ? attRecords.value : []
        const clubs = clubsData.status === 'fulfilled' ? clubsData.value : []

        // --- Grades ---
        if (transcriptData?.gpa !== undefined) {
          setUserAverages(prev => ({ ...prev, score: Math.round(transcriptData.gpa * 100) / 100 }))
        }
        if (Array.isArray(transcriptData?.grades)) {
          setGrades(transcriptData.grades)
        }

        // --- Attendance ---
        const attArr = Array.isArray(attendanceData) ? attendanceData : []
        setAttendanceRecords(attArr)
        if (attArr.length > 0) {
          const presentCount = attArr.filter(a => a.status === 'present').length
          const attendancePercent = Math.round((presentCount / attArr.length) * 100)
          setUserAverages(prev => ({ ...prev, attendance: attendancePercent }))

          // Build per-day attendance trend from real data
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const dayBuckets = {}
          attArr.forEach(a => {
            const d = new Date(a.date || a.createdAt).getDay()
            if (!dayBuckets[d]) dayBuckets[d] = { total: 0, present: 0 }
            dayBuckets[d].total++
            if (a.status === 'present') dayBuckets[d].present++
          })
          const trend = Object.entries(dayBuckets).map(([d, v]) => ({
            day: dayNames[d],
            value: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
          }))
          if (trend.length > 0) setAttendanceTrend(trend)
        }

        // --- Clubs / Activities ---
        const clubArr = Array.isArray(clubs) ? clubs : []
        const actCount = clubArr.reduce((sum, c) => sum + (c.club?.activities?.length || 0), 0)
        setActivityStats([
          { name: 'Clubs', value: clubArr.length },
          { name: 'Events', value: actCount },
        ])
        setUserAverages(prev => ({ ...prev, activity: clubArr.length + actCount }))

        setLastSync(new Date())
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

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      setExportError('')
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4001/api'
      const token = localStorage.getItem('access_token')
      const headers = {}
      if (token) {
        headers.Authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`
      }
      const response = await fetch(`${API_BASE}/export/dashboard/excel`, {
        method: 'GET',
        headers,
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('ดาวน์โหลดรายงานไม่สำเร็จ')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-report-${user?.username || 'user'}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(err.message || 'ดาวน์โหลดรายงานไม่สำเร็จ')
    } finally {
      setExporting(false)
    }
  }

  const attendancePercent = userAverages.attendance || 0
  const scoreAverage = userAverages.score || 0
  const recentGrades = grades.slice(0, 5)
  const recentAttendance = attendanceRecords.slice(0, 5)
  const healthStatus = attendancePercent >= 85 ? 'ดีมาก' : attendancePercent >= 75 ? 'พอใช้' : 'ต้องปรับปรุง'
  const healthColor = attendancePercent >= 85 ? 'text-emerald-300' : attendancePercent >= 75 ? 'text-amber-300' : 'text-rose-300'
  const scoreStatus = scoreAverage >= 3 ? 'ยอดเยี่ยม' : scoreAverage >= 2 ? 'อยู่ในเกณฑ์ดี' : 'ต้องติดตาม'
  const scoreColor = scoreAverage >= 3 ? 'text-violet-300' : scoreAverage >= 2 ? 'text-sky-300' : 'text-rose-300'

  return (
    <div className="h-[calc(100vh-112px)] w-full bg-[#020617] text-gray-100 px-4 py-4">
      <div className="h-full rounded-2xl border border-[#1f2937] bg-[#020617] overflow-y-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">
              ข้อมูลภาพรวมการเรียนของคุณ
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="text-right text-xs text-gray-400">
              <div>Term: 2 / 2025</div>
              <div>
                {loading ? 'กำลังอัปเดตข้อมูล...' : `Last sync: ${lastSync ? new Date(lastSync).toLocaleString('th-TH') : '-'}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-xs flex items-center gap-2"
              >
                <FileSpreadsheet size={14} />
                {exporting ? 'กำลังเตรียมรายงาน...' : 'ดาวน์โหลดรายงาน Excel'}
              </button>
            </div>
          </div>
        </div>
        {exportError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {exportError}
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI label="Attendance" value={`${userAverages.attendance}%`} color="text-emerald-400" icon={<UserCheck size={14} />} />
          <KPI label="Assignments" value={`${userAverages.assignment}%`} color="text-sky-400" icon={<ClipboardList size={14} />} />
          <KPI label="Scores (avg)" value={`${userAverages.score}%`} color="text-violet-400" icon={<Info size={14} />} />
          <KPI label="Activities" value={userAverages.activity} color="text-amber-300" icon={<Activity size={14} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <TrendingUp size={14} /> ความสม่ำเสมอการเข้าเรียน
            </div>
            <div className={`text-xl font-semibold mt-2 ${healthColor}`}>{attendancePercent}%</div>
            <div className="text-[11px] text-gray-400 mt-1">สถานะ: {healthStatus}</div>
          </div>
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <Info size={14} /> แนวโน้มผลการเรียน
            </div>
            <div className={`text-xl font-semibold mt-2 ${scoreColor}`}>{scoreAverage}</div>
            <div className="text-[11px] text-gray-400 mt-1">สถานะ: {scoreStatus}</div>
          </div>
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <Activity size={14} /> การมีส่วนร่วมกิจกรรม
            </div>
            <div className="text-xl font-semibold mt-2 text-amber-300">{userAverages.activity} รายการ</div>
            <div className="text-[11px] text-gray-400 mt-1">ต่อเทอมปัจจุบัน</div>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">ผลการสอบล่าสุด</h2>
              <span className="text-[11px] text-gray-400">{grades.length} รายการ</span>
            </div>
            <div className="mt-3 space-y-2">
              {recentGrades.length > 0 ? recentGrades.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-[#1f2937] bg-[#0b1220] px-3 py-2">
                  <div>
                    <div className="text-xs text-gray-200">{g.exam?.title || g.exam?.name || 'Exam'}</div>
                    <div className="text-[10px] text-gray-400">
                      {(g.exam?.class?.code || '')} {g.exam?.class?.name || ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-violet-300">{g.score ?? '-'}/{g.maxScore ?? '-'}</div>
                    <div className="text-[10px] text-gray-500">{g.createdAt ? new Date(g.createdAt).toLocaleDateString('th-TH') : ''}</div>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-gray-500">ยังไม่มีข้อมูลคะแนนล่าสุด</div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">การเข้าเรียนล่าสุด</h2>
              <span className="text-[11px] text-gray-400">{attendanceRecords.length} รายการ</span>
            </div>
            <div className="mt-3 space-y-2">
              {recentAttendance.length > 0 ? recentAttendance.map((att) => (
                <div key={att.id} className="flex items-center justify-between rounded-lg border border-[#1f2937] bg-[#0b1220] px-3 py-2">
                  <div>
                    <div className="text-xs text-gray-200">{att.class?.name || 'Class'}</div>
                    <div className="text-[10px] text-gray-400">{att.date ? new Date(att.date).toLocaleDateString('th-TH') : new Date(att.createdAt).toLocaleDateString('th-TH')}</div>
                  </div>
                  <div className="text-[11px] text-gray-300">{att.status || '-'}</div>
                </div>
              )) : (
                <div className="text-xs text-gray-500">ยังไม่มีข้อมูลการเข้าเรียนล่าสุด</div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Trend Chart */}
        <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
          <h2 className="text-sm font-semibold mb-2">Weekly Attendance Trend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {attendanceTrend.map((item) => (
              <button
                key={item.day}
                type="button"
                onClick={() => onLineClick(item)}
                className="rounded-lg border border-[#1f2937] bg-[#0b1220] px-3 py-2 text-left hover:bg-slate-900"
              >
                <div className="text-[11px] text-gray-400">{item.day}</div>
                <div className="text-lg font-semibold text-violet-400">{item.value}%</div>
              </button>
            ))}
          </div>
        </div>

        {/* Activities & Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Assignments Bar Chart */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">Assignments Status</h2>
            <div className="space-y-3">
              {assignmentTrend.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onBarClick({ activeLabel: item.name, value: item.value })}
                  className="w-full text-left rounded-lg border border-[#1f2937] bg-[#0b1220] px-3 py-2 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.round((item.value / maxAssignmentValue) * 100)}%`,
                        backgroundColor: COLORS[idx],
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activities Pie Chart */}
          <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
            <h2 className="text-sm font-semibold mb-2">Activities Distribution</h2>
            <div className="space-y-3">
              {activityStats.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onPieClick(item)}
                  className="w-full text-left rounded-lg border border-[#1f2937] bg-[#0b1220] px-3 py-2 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.round((item.value / maxActivityValue) * 100)}%`,
                        backgroundColor: COLORS[idx],
                      }}
                    />
                  </div>
                </button>
              ))}
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
