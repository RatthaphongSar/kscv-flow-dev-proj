// frontend/src/pages/Schedule.jsx
import PageShell from "../components/PageShell"
import { CalendarDays, User, ClipboardList } from "lucide-react"

const mockSchedule = [
  {
    day: "Mon",
    time: "09:00–10:30",
    course: "ENG-101",
    subject: "English for Communication",
    room: "KVC-302",
    teacher: "Aj. Supaporn",
    task: "อ่านบทที่ 1–2 และเตรียมตัวตอบคำถามในห้องเรียน",
  },
  {
    day: "Tue",
    time: "13:00–15:00",
    course: "CS-201",
    subject: "Web Application Development",
    room: "Lab-105",
    teacher: "Aj. Kritsada",
    task: "ทำแบบฝึกหัด Lab เรื่อง React Component ให้เสร็จก่อนคาบหน้า",
  },
  {
    day: "Fri",
    time: "10:00–12:00",
    course: "MA-110",
    subject: "Business Mathematics",
    room: "KVC-210",
    teacher: "Aj. Ratchanee",
    task: "", // อาจารย์ยังไม่ได้ระบุงาน -> จะแสดง Empty
  },
]

export default function Schedule() {
  return (
    <PageShell
      title="Schedule"
      subtitle="ตารางเรียนประจำสัปดาห์ (ตัวอย่าง)"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-sky-400" />
            <span className="text-sm font-semibold">Weekly View</span>
          </div>
          <span className="text-[11px] text-gray-500">
            * สามารถเชื่อมต่อ API ตารางเรียนจริงได้ภายหลัง
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockSchedule.map((s, idx) => {
            const hasTask = s.task && s.task.trim().length > 0

            return (
              <div
                key={idx}
                className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-3 flex flex-col gap-2"
              >
                {/* แถวบน: วันที่ + เวลา */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-gray-400">{s.day}</div>
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
                      <span>งานที่ต้องทำก่อน / หลังคาบนี้</span>
                    </div>

                    {hasTask ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
                        มีงานมอบหมาย
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-gray-400 border border-slate-700">
                        Empty
                      </span>
                    )}
                  </div>

                  {hasTask ? (
                    <p className="text-[11px] text-gray-200 leading-relaxed">
                      {s.task}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">
                      ยังไม่มีงานที่อาจารย์ระบุในระบบสำหรับคาบนี้
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
