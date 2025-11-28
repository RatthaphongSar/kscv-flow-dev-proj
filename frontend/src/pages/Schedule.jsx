// frontend/src/pages/Schedule.jsx
import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { CalendarDays, User, ClipboardList, Loader } from "lucide-react"
import { apiClient } from "../utils/api"

export default function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Call backend API to get schedule
      const response = await apiClient.get("/api/schedule")
      
      if (response && response.data) {
        setSchedule(response.data)
      } else {
        throw new Error("No schedule data received")
      }
    } catch (err) {
      console.error("Error fetching schedule:", err)
      setError("ไม่สามารถโหลดตารางเรียนได้")
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
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-sky-400" />
            <span className="text-sm font-semibold">Weekly View</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader size={20} className="animate-spin text-sky-400" />
            <span className="text-gray-400">โหลดตารางเรียน...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
            {error}
          </div>
        ) : schedule.length === 0 ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 text-center text-yellow-300">
            ยังไม่มีตารางเรียน
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {schedule.map((s, idx) => {
              const hasTask = s.task && s.task.trim().length > 0
              const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                s.dayOfWeek || 0
              ] || s.day

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-3 flex flex-col gap-2"
                >
                  {/* แถวบน: วันที่ + เวลา */}
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-gray-400">{dayLabel}</div>
                    <div className="text-[11px] text-sky-300">{s.time}</div>
                  </div>

                  {/* รายวิชา */}
                  <div>
                    <div className="text-[11px] text-gray-400">
                      {s.course} · ห้อง {s.room}
                    </div>
                    <div className="text-sm text-gray-100 font-semibold">
                      {s.subject}
                    </div>
                  </div>

                  {/* ผู้สอน */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                    <User size={12} className="text-violet-300" />
                    <span>ผู้สอน: {s.teacher}</span>
                  </div>

                  {/* Task / งานที่ต้องทำ */}
                  <div className="mt-1 rounded-lg border border-[#1f2937] bg-slate-900/40 px-2.5 py-2">
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
