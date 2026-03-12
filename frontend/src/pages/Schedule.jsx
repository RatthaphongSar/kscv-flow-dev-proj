// frontend/src/pages/Schedule.jsx
import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { CalendarDays, User, ClipboardList, Loader } from "lucide-react"
import { apiClient } from "../utils/api"
import { useI18n } from "../context/I18nContext"

export default function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState("weekly")
  const taskCount = schedule.filter((item) => item.task && item.task.trim().length > 0).length
  const dayCount = new Set(schedule.map((item) => item.dayOfWeek ?? item.day)).size
  const { t } = useI18n()

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Call backend API to get schedule
      const response = await apiClient.get("/schedule")
      
      // API returns array directly
      if (Array.isArray(response)) {
        setSchedule(response)
      } else {
        throw new Error("Invalid schedule data received")
      }
    } catch (err) {
      console.error("Error fetching schedule:", err)
      setError("schedule.error")
      setSchedule([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Schedule"
      subtitle="ตารางเรียนประจำสัปดาห์"
    >
      <div className="space-y-4" data-testid="schedule-view">
        <div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 backdrop-blur-xl p-5 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.95)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <CalendarDays size={18} className="text-violet-300" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{t("schedule.overview")}</div>
                <div className="text-base font-semibold text-gray-100">
                  {viewMode === "weekly" ? t("schedule.weeklyView") : t("schedule.monthlyView")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                data-testid="schedule-toggle"
                onClick={() => setViewMode("weekly")}
                className={`px-4 py-1.5 rounded-full text-[11px] transition ${
                  viewMode === "weekly"
                    ? "bg-violet-500/25 text-violet-200"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t("common.weekly")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("monthly")}
                className={`px-4 py-1.5 rounded-full text-[11px] transition ${
                  viewMode === "monthly"
                    ? "bg-sky-500/25 text-sky-200"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t("common.monthly")}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300">
              {t("schedule.totalPeriods", null, { count: schedule.length })}
            </span>
            <span className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
              {t("schedule.tasks", null, { count: taskCount })}
            </span>
            <span className="px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-200">
              {t("schedule.daysUsed", null, { count: dayCount || 0 })}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 backdrop-blur-xl p-10 text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader size={20} className="animate-spin text-violet-300" />
              <span className="text-gray-300">{t("schedule.loading")}</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
            {t(error)}
          </div>
        ) : schedule.length === 0 ? (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-900/20 p-4 text-center text-yellow-300">
            {t("schedule.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {schedule.map((s, idx) => {
              const hasTask = s.task && s.task.trim().length > 0
              const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                s.dayOfWeek || 0
              ] || s.day

              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#020617] to-[#020617] p-4 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)] transition hover:border-violet-500/30 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">{dayLabel}</span>
                    <span className="px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-200">
                      {s.time}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] text-gray-400">
                      {s.course} · ห้อง {s.room}
                    </div>
                    <div className="text-sm text-gray-100 font-semibold mt-1">
                      {s.subject}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-300">
                    <User size={12} className="text-violet-300" />
                    <span>ผู้สอน: {s.teacher}</span>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                        <ClipboardList size={12} className="text-emerald-300" />
                        <span>งานที่ต้องทำ</span>
                      </div>

                      {hasTask ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
                          มีงาน
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-gray-400 border border-slate-700">
                          ไม่มี
                        </span>
                      )}
                    </div>

                    {hasTask ? (
                      <p className="text-[11px] text-gray-200 leading-relaxed">
                        {s.task}
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic">
                        ยังไม่มีงานมอบหมาย
                      </p>
                    )}
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
