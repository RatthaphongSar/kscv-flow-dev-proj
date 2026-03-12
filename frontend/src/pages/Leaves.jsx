// frontend/src/pages/Leaves.jsx
import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { useTheme } from "../components/ThemeProvider"
import {
  FileText,
  Plus,
  X,
  Check,
  XCircle,
  Clock,
  Loader,
  CalendarDays,
  Paperclip,
  AlertTriangle,
} from "lucide-react"
import { apiClient } from "../utils/api"
import { useAuth } from "../context/AuthContext"

const LEAVE_TYPES = [
  { value: "sick", label: "ลาป่วย", icon: "🤒", dark: "text-rose-300 bg-rose-500/15 border-rose-500/30", light: "text-rose-700 bg-rose-50 border-rose-200" },
  { value: "personal", label: "ลากิจ", icon: "📋", dark: "text-sky-300 bg-sky-500/15 border-sky-500/30", light: "text-sky-700 bg-sky-50 border-sky-200" },
  { value: "ordination", label: "ลาบวช", icon: "🙏", dark: "text-amber-300 bg-amber-500/15 border-amber-500/30", light: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "other", label: "อื่นๆ", icon: "📝", dark: "text-gray-300 bg-gray-500/15 border-gray-500/30", light: "text-gray-700 bg-gray-50 border-gray-200" },
]

const STATUS_MAP = {
  pending: { label: "รอดำเนินการ", icon: Clock, dark: "text-amber-300 bg-amber-500/15 border-amber-500/30", light: "text-amber-700 bg-amber-50 border-amber-300" },
  approved: { label: "อนุมัติ", icon: Check, dark: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30", light: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  rejected: { label: "ไม่อนุมัติ", icon: XCircle, dark: "text-rose-300 bg-rose-500/15 border-rose-500/30", light: "text-rose-700 bg-rose-50 border-rose-300" },
}

export default function Leaves() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN"

  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("all")
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  })

  useEffect(() => { fetchLeaves() }, [filter])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      setError("")
      const params = filter !== "all" ? `?status=${filter}` : ""
      const data = await apiClient.get(`/leaves/my${params}`)
      setLeaves(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching leaves:", err)
      setError("ไม่สามารถโหลดข้อมูลใบลาได้")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type || !form.startDate || !form.endDate) return
    try {
      setSubmitting(true)
      await apiClient.post("/leaves", {
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason || undefined,
      })
      setForm({ type: "sick", startDate: "", endDate: "", reason: "" })
      setShowForm(false)
      fetchLeaves()
    } catch (err) {
      console.error("Error submitting leave:", err)
      setError("ไม่สามารถยื่นใบลาได้")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproval = async (id, status) => {
    try {
      await apiClient.patch(`/leaves/${id}/status`, { status })
      fetchLeaves()
    } catch (err) {
      setError("ไม่สามารถอัปเดตสถานะได้")
    }
  }

  const handleAttachDoc = async (id) => {
    const docUrl = prompt("กรุณาใส่ URL ใบรับรองแพทย์:")
    if (!docUrl) return
    try {
      await apiClient.post(`/leaves/${id}/attach-doctor-cert`, { docUrl })
      fetchLeaves()
    } catch (err) {
      setError("ไม่สามารถแนบเอกสารได้")
    }
  }

  const getDaysDiff = (start, end) => {
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1
  }

  const pendingCount = leaves.filter((l) => l.status === "pending").length
  const approvedCount = leaves.filter((l) => l.status === "approved").length

  // Theme-aware style helpers
  const card = isLight
    ? "rounded-2xl border border-slate-200 bg-white shadow-sm"
    : "rounded-2xl border border-white/10 bg-[#0b1220]/80 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]"
  const cardHover = isLight
    ? "hover:border-violet-300 hover:shadow-md"
    : "hover:border-violet-500/20 hover:-translate-y-0.5"
  const input = isLight
    ? "border-slate-200 bg-white text-slate-900 focus:ring-violet-500 placeholder-slate-400"
    : "border-white/10 bg-white/5 text-gray-100 focus:ring-violet-500/50 placeholder-gray-500"
  const sub = isLight ? "text-slate-500" : "text-gray-400"
  const muted = isLight ? "text-slate-400" : "text-gray-500"

  return (
    <PageShell title="Leave Request" subtitle="ระบบยื่นใบลา" right={`ทั้งหมด ${leaves.length} รายการ`}>
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className={`rounded-3xl p-5 ${isLight ? 'border border-slate-200 bg-white shadow-sm' : 'border border-white/10 bg-[#0b1220]/80 backdrop-blur-xl shadow-[0_30px_90px_-70px_rgba(0,0,0,0.95)]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isLight ? 'bg-violet-100 border border-violet-200' : 'bg-violet-500/15 border border-violet-500/30'}`}>
                <FileText size={18} className={isLight ? 'text-violet-600' : 'text-violet-300'} />
              </div>
              <div>
                <div className={`text-[11px] ${sub}`}>ระบบใบลา</div>
                <div className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>
                  {isTeacher ? "อนุมัติ/ปฏิเสธใบลา" : "ยื่นใบลาออนไลน์"}
                </div>
              </div>
            </div>
            {!isTeacher && (
              <button type="button" onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-violet-600 hover:bg-violet-500 transition text-white shadow-lg shadow-violet-500/20">
                {showForm ? <X size={14} /> : <Plus size={14} />}
                {showForm ? "ปิดฟอร์ม" : "ยื่นใบลาใหม่"}
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className={`px-3 py-1.5 rounded-full border ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/5 text-gray-300'}`}>
              ทั้งหมด {leaves.length} รายการ
            </span>
            <span className={`px-3 py-1.5 rounded-full border ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
              รอดำเนินการ {pendingCount}
            </span>
            <span className={`px-3 py-1.5 rounded-full border ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              อนุมัติ {approvedCount}
            </span>
          </div>
        </div>

        {/* Leave Request Form */}
        {showForm && !isTeacher && (
          <div className={`rounded-2xl p-5 ${isLight ? 'border border-violet-200 bg-violet-50/50 shadow-sm' : 'border border-violet-500/30 bg-[#0b1220]/90 backdrop-blur-xl shadow-lg'}`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>
              <Plus size={16} className={isLight ? 'text-violet-600' : 'text-violet-300'} /> ยื่นใบลาใหม่
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-[11px] mb-2 ${sub}`}>ประเภทการลา</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LEAVE_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                      className={`px-3 py-2.5 rounded-xl border text-xs transition flex items-center gap-2 ${
                        form.type === t.value
                          ? (isLight ? t.light : t.dark) + " ring-1 ring-violet-400/30"
                          : isLight ? "border-slate-200 bg-white text-slate-500 hover:bg-slate-50" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}>
                      <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] mb-1.5 ${sub}`}>วันที่เริ่มลา</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 ${input}`} />
                </div>
                <div>
                  <label className={`block text-[11px] mb-1.5 ${sub}`}>วันที่สิ้นสุด</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required min={form.startDate}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 ${input}`} />
                </div>
              </div>
              {form.type === "sick" && form.startDate && form.endDate && getDaysDiff(form.startDate, form.endDate) > 2 && (
                <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[11px] ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>ลาป่วยเกิน 2 วัน ต้องแนบใบรับรองแพทย์</span>
                </div>
              )}
              <div>
                <label className={`block text-[11px] mb-1.5 ${sub}`}>เหตุผล (ไม่บังคับ)</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="ระบุเหตุผลการลา..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 resize-none ${input}`} />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className={`px-4 py-2 rounded-xl border text-xs transition ${isLight ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting || !form.startDate || !form.endDate}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-medium text-white transition flex items-center gap-2">
                  {submitting ? <><Loader size={14} className="animate-spin" /> กำลังยื่น...</> : <><FileText size={14} /> ยื่นใบลา</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className={`flex items-center gap-1.5 rounded-full border p-1 w-fit ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/5'}`}>
          {[{ value: "all", label: "ทั้งหมด" }, { value: "pending", label: "รอดำเนินการ" }, { value: "approved", label: "อนุมัติ" }, { value: "rejected", label: "ไม่อนุมัติ" }].map((f) => (
            <button key={f.value} type="button" onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-[11px] transition ${
                filter === f.value
                  ? isLight ? "bg-violet-100 text-violet-700 font-medium" : "bg-violet-500/25 text-violet-200"
                  : isLight ? "text-slate-500 hover:text-slate-700" : "text-gray-400 hover:text-gray-200"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={`rounded-2xl border p-4 text-center text-sm ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-500/30 bg-rose-900/20 text-rose-300'}`}>
            {error}
          </div>
        )}

        {/* Leave List */}
        {loading ? (
          <div className={`rounded-3xl p-10 text-center ${isLight ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-[#0b1220]/70'}`}>
            <div className="flex items-center justify-center gap-2">
              <Loader size={20} className={`animate-spin ${isLight ? 'text-violet-600' : 'text-violet-300'}`} />
              <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>โหลดข้อมูลใบลา...</span>
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <div className={`rounded-2xl p-8 text-center ${isLight ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-[#0b1220]/70'}`}>
            <FileText size={40} className={`mx-auto mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
            <p className={`text-sm ${sub}`}>
              {filter === "all" ? "ยังไม่มีใบลา" : `ไม่มีใบลาที่ ${STATUS_MAP[filter]?.label || filter}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map((leave) => {
              const typeInfo = LEAVE_TYPES.find((t) => t.value === leave.type) || LEAVE_TYPES[3]
              const statusInfo = STATUS_MAP[leave.status] || STATUS_MAP.pending
              const StatusIcon = statusInfo.icon
              const days = getDaysDiff(leave.startDate, leave.endDate)
              const needsDoc = leave.type === "sick" && days > 2 && !leave.docUrl

              return (
                <div key={leave.id} className={`group ${card} p-4 transition ${cardHover}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] ${isLight ? typeInfo.light : typeInfo.dark}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] flex items-center gap-1 ${isLight ? statusInfo.light : statusInfo.dark}`}>
                          <StatusIcon size={12} /> {statusInfo.label}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                        <CalendarDays size={13} className={isLight ? 'text-violet-600' : 'text-violet-300'} />
                        <span>
                          {new Date(leave.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                          {" — "}
                          {new Date(leave.endDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-500' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                          {days} วัน
                        </span>
                      </div>
                      {leave.reason && <p className={`text-[11px] mt-2 leading-relaxed ${sub}`}>เหตุผล: {leave.reason}</p>}
                      {needsDoc && leave.status === "pending" && (
                        <button onClick={() => handleAttachDoc(leave.id)}
                          className={`mt-2 flex items-center gap-1.5 text-[11px] transition ${isLight ? 'text-amber-600 hover:text-amber-700' : 'text-amber-300 hover:text-amber-200'}`}>
                          <Paperclip size={12} /> <span>แนบใบรับรองแพทย์ (จำเป็น)</span>
                        </button>
                      )}
                      {leave.docUrl && (
                        <div className={`mt-2 flex items-center gap-1.5 text-[11px] ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`}>
                          <Paperclip size={12} />
                          <a href={leave.docUrl} target="_blank" rel="noreferrer" className="underline">ดูใบรับรองแพทย์</a>
                        </div>
                      )}
                    </div>
                    {isTeacher && leave.status === "pending" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleApproval(leave.id, "approved")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] transition ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30'}`}>
                          <Check size={13} /> อนุมัติ
                        </button>
                        <button onClick={() => handleApproval(leave.id, "rejected")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] transition ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-rose-600/20 border-rose-500/30 text-rose-300 hover:bg-rose-600/30'}`}>
                          <XCircle size={13} /> ไม่อนุมัติ
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`mt-3 pt-2 flex items-center justify-between text-[10px] ${isLight ? 'border-t border-slate-100 text-slate-400' : 'border-t border-white/5 text-gray-500'}`}>
                    <span>ยื่นเมื่อ {new Date(leave.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {leave.student?.username && <span>โดย {leave.student.username}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
