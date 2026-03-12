import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { useTheme } from "../components/ThemeProvider"
import { GraduationCap, Loader, Award, BookOpen, Download } from "lucide-react"
import { apiClient } from "../utils/api"

const GRADE_COLORS = {
  'A':  { dark: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', light: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  'B+': { dark: 'text-sky-300 bg-sky-500/15 border-sky-500/30',           light: 'text-sky-700 bg-sky-50 border-sky-200' },
  'B':  { dark: 'text-sky-300 bg-sky-500/15 border-sky-500/30',           light: 'text-sky-700 bg-sky-50 border-sky-200' },
  'C+': { dark: 'text-amber-300 bg-amber-500/15 border-amber-500/30',     light: 'text-amber-700 bg-amber-50 border-amber-200' },
  'C':  { dark: 'text-amber-300 bg-amber-500/15 border-amber-500/30',     light: 'text-amber-700 bg-amber-50 border-amber-200' },
  'D+': { dark: 'text-orange-300 bg-orange-500/15 border-orange-500/30',   light: 'text-orange-700 bg-orange-50 border-orange-200' },
  'D':  { dark: 'text-orange-300 bg-orange-500/15 border-orange-500/30',   light: 'text-orange-700 bg-orange-50 border-orange-200' },
  'F':  { dark: 'text-rose-300 bg-rose-500/15 border-rose-500/30',         light: 'text-rose-700 bg-rose-50 border-rose-200' },
}

function getGPAStatus(gpa, isLight) {
  if (gpa >= 3.5) return { label: 'ยอดเยี่ยม', color: isLight ? 'text-emerald-700' : 'text-emerald-300', bg: isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/15 border-emerald-500/30' }
  if (gpa >= 3.0) return { label: 'ดีมาก', color: isLight ? 'text-sky-700' : 'text-sky-300', bg: isLight ? 'bg-sky-50 border-sky-200' : 'bg-sky-500/15 border-sky-500/30' }
  if (gpa >= 2.5) return { label: 'ดี', color: isLight ? 'text-violet-700' : 'text-violet-300', bg: isLight ? 'bg-violet-50 border-violet-200' : 'bg-violet-500/15 border-violet-500/30' }
  if (gpa >= 2.0) return { label: 'พอใช้', color: isLight ? 'text-amber-700' : 'text-amber-300', bg: isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/15 border-amber-500/30' }
  return { label: 'ต้องปรับปรุง', color: isLight ? 'text-rose-700' : 'text-rose-300', bg: isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/15 border-rose-500/30' }
}

export default function GradesTranscript() {
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)

  const [grades, setGrades] = useState([])
  const [gpa, setGpa] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchGrades() }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.get("/grades/transcript")
      if (response && typeof response === 'object') {
        setGrades(response.grades || [])
        setGpa(response.gpa || 0)
        setTotalCredits(response.totalCredits || 0)
      } else {
        throw new Error("Invalid grades data received")
      }
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError("ไม่สามารถโหลดผลการเรียนได้")
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGrades = filter === "all" ? grades : grades.filter(g => g.grade === filter)
  const gpaStatus = getGPAStatus(gpa, isLight)
  const gradeDistribution = grades.reduce((acc, g) => { acc[g.grade] = (acc[g.grade] || 0) + 1; return acc }, {})

  const handleExport = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4001/api'
      const token = localStorage.getItem('access_token')
      const headers = {}
      if (token) headers.Authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`
      const response = await fetch(`${API_BASE}/export/grades/csv`, { method: 'GET', headers, credentials: 'include' })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'transcript.csv'
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  // Theme helpers
  const card = isLight ? 'border border-slate-200 bg-white shadow-sm' : 'border border-white/10 bg-[#0b1220]/80 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.95)]'
  const sub = isLight ? 'text-slate-500' : 'text-slate-400'
  const heading = isLight ? 'text-slate-900' : 'text-gray-100'
  const gradeColor = (g) => (GRADE_COLORS[g] || { dark: 'text-gray-300 bg-white/5 border-white/10', light: 'text-gray-600 bg-gray-50 border-gray-200' })[isLight ? 'light' : 'dark']

  return (
    <PageShell title="Grades & Transcript" subtitle="ผลการเรียนและทรานสคริปต์">
      <div className="space-y-4">
        {/* GPA Overview */}
        <div className={`rounded-3xl backdrop-blur-xl p-5 ${card}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isLight ? 'bg-emerald-100 border border-emerald-200' : 'bg-emerald-500/15 border border-emerald-500/30'}`}>
                <GraduationCap size={18} className={isLight ? 'text-emerald-600' : 'text-emerald-300'} />
              </div>
              <div>
                <div className={`text-[11px] ${sub}`}>เกรดเฉลี่ยสะสม (GPA)</div>
                <div className={`text-2xl font-bold ${gpaStatus.color}`}>{gpa.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full border text-[11px] ${gpaStatus.bg} ${gpaStatus.color}`}>{gpaStatus.label}</span>
              <button onClick={handleExport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] transition ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className={`px-3 py-1.5 rounded-full border ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/5 text-gray-300'}`}>
              <BookOpen size={11} className="inline mr-1" /> {grades.length} วิชา
            </span>
            <span className={`px-3 py-1.5 rounded-full border ${isLight ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-violet-500/30 bg-violet-500/10 text-violet-200'}`}>
              <Award size={11} className="inline mr-1" /> {totalCredits} หน่วยกิต
            </span>
            {Object.entries(gradeDistribution).sort().map(([grade, count]) => (
              <span key={grade} className={`px-3 py-1.5 rounded-full border text-[11px] ${gradeColor(grade)}`}>
                {grade}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className={`flex items-center gap-1.5 rounded-full border p-1 w-fit overflow-x-auto ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/5'}`}>
          {["all", "A", "B+", "B", "C+", "C", "D+", "D", "F"].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] transition whitespace-nowrap ${
                filter === f
                  ? isLight ? "bg-emerald-100 text-emerald-700 font-medium" : "bg-emerald-500/25 text-emerald-200"
                  : isLight ? "text-slate-500 hover:text-slate-700" : "text-gray-400 hover:text-gray-200"
              }`}>
              {f === "all" ? "ทั้งหมด" : f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className={`rounded-3xl p-10 text-center ${card}`}>
            <div className="flex items-center justify-center gap-2">
              <Loader size={20} className={`animate-spin ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
              <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>โหลดผลการเรียน...</span>
            </div>
          </div>
        ) : error ? (
          <div className={`rounded-2xl border p-4 text-center ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-red-500/30 bg-red-900/20 text-red-300'}`}>
            {error}
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className={`rounded-2xl p-8 text-center ${isLight ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-[#0b1220]/70'}`}>
            <GraduationCap size={40} className={`mx-auto mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
            <p className={`text-sm ${sub}`}>
              {filter === "all" ? "ยังไม่มีผลการเรียน" : `ไม่มีวิชาที่ได้เกรด ${filter}`}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="block md:hidden space-y-3">
              {filteredGrades.map((g, idx) => (
                <div key={g.id || idx}
                  className={`group rounded-2xl p-4 transition ${isLight ? 'border border-slate-200 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md' : 'border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#020617] to-[#020617] hover:border-emerald-500/20 hover:-translate-y-0.5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${heading}`}>{g.name || g.exam?.class?.name}</div>
                      <div className={`text-[11px] ${sub}`}>{g.code || g.exam?.class?.code}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full border text-sm font-bold ${gradeColor(g.grade)}`}>{g.grade}</span>
                  </div>
                  <div className={`flex items-center justify-between text-[11px] mt-2 ${sub}`}>
                    <span>คะแนน: {g.score}/{g.maxScore}</span>
                    <span>{g.credit || g.exam?.class?.credits || 3} หน่วยกิต</span>
                  </div>
                  {g.percentage && (
                    <div className={`mt-2 h-1.5 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div className={`h-1.5 rounded-full transition-all ${isLight ? 'bg-emerald-400' : 'bg-emerald-500/50'}`}
                        style={{ width: `${Math.min(100, parseFloat(g.percentage))}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className={`hidden md:block rounded-2xl overflow-hidden ${isLight ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-[#0b1220]/70'}`}>
              <table className={`w-full text-xs ${heading}`}>
                <thead className={`text-[11px] border-b ${isLight ? 'text-slate-500 border-slate-200 bg-slate-50' : 'text-gray-400 border-white/10 bg-white/5'}`}>
                  <tr>
                    <th className="py-3 px-4 text-left">รหัสวิชา</th>
                    <th className="py-3 px-4 text-left">ชื่อวิชา</th>
                    <th className="py-3 px-4 text-center">คะแนน</th>
                    <th className="py-3 px-4 text-center">เปอร์เซ็นต์</th>
                    <th className="py-3 px-4 text-center">หน่วยกิต</th>
                    <th className="py-3 px-4 text-center">เกรด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((g, idx) => (
                    <tr key={g.id || idx} className={`border-b transition ${isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-white/5 hover:bg-white/5'}`}>
                      <td className={`py-3 px-4 ${sub}`}>{g.code || g.exam?.class?.code}</td>
                      <td className="py-3 px-4">{g.name || g.exam?.class?.name}</td>
                      <td className="py-3 px-4 text-center">{g.score}/{g.maxScore}</td>
                      <td className={`py-3 px-4 text-center ${sub}`}>{g.percentage ? `${g.percentage}%` : '-'}</td>
                      <td className="py-3 px-4 text-center">{g.credit || g.exam?.class?.credits || 3}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${gradeColor(g.grade)}`}>{g.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
