// frontend/src/pages/Exam.jsx
import { useMemo, useState } from "react"
import PageShell from "../components/PageShell"
import { CalendarDays, Filter, Info, AlarmClock, ArrowRight } from "lucide-react"

const mockExams = [
  {
    id: "cs201-mid",
    course: "CS-201",
    courseName: "Computer Programming II",
    type: "Midterm", // Midterm | Final | Quiz
    date: "2025-04-10",
    time: "09:00–11:00",
    room: "Lab-105",
    scope: "บทที่ 1–5: Function, Array, Object, Basic Algorithm",
    note: "เตรียมเครื่องคิดเลขพื้นฐานได้ แต่ห้ามใช้มือถือ",
  },
  {
    id: "eng101-final",
    course: "ENG-101",
    courseName: "English for Communication",
    type: "Final",
    date: "2025-04-18",
    time: "13:00–15:00",
    room: "KVC-302",
    scope: "Unit 4–8: Conversation, Email Writing, Presentation",
    note: "อนุญาตให้นำ Dictionary เล่มกระดาษเข้าได้ 1 เล่ม",
  },
]

export default function Exam() {
  const [filterType, setFilterType] = useState("all") // "all" | "Midterm" | "Final"
  const [expandedId, setExpandedId] = useState(null)

  const filteredExams = useMemo(() => {
    if (filterType === "all") return mockExams
    return mockExams.filter((e) => e.type === filterType)
  }, [filterType])

  const nextExam = useMemo(() => {
    if (mockExams.length === 0) return null
    // สมมติว่า mockExams เรียงตามวันที่แล้ว
    return mockExams[0]
  }, [])

  const handleOpenExamSystem = (exam) => {
    // ตรงนี้ต่อกับระบบทำข้อสอบจริงทีหลัง เช่น navigate('/exam-system?code=...')
    alert(`(mock) เปิดระบบทำข้อสอบสำหรับวิชา ${exam.course} – ${exam.type}`)
  }

  const handleSetReminder = (exam) => {
    alert(
      `(mock) ตั้งเตือนสอบวิชา ${exam.course} วันที่ ${exam.date} เวลา ${exam.time}\n\nในระบบจริงสามารถต่อกับปฏิทิน / Notification ได้`
    )
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <PageShell
      title="Exam Schedule"
      subtitle="ตารางสอบรายวิชาที่ลงทะเบียน (mock data) – สามารถต่อกับระบบสอบ/ปฏิทินได้ภายหลัง"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-4 text-xs">
        {/* ===== Top Summary / Filter ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-violet-400" />
            <div>
              <div className="text-sm font-semibold text-gray-100">
                Upcoming Exams
              </div>
              <div className="text-[11px] text-gray-400">
                จำนวนวิชาที่มีสอบ:{" "}
                <span className="text-violet-300 font-medium">
                  {mockExams.length} วิชา (ตัวอย่าง)
                </span>
                {nextExam && (
                  <>
                    {" · ใกล้สุด: "}
                    <span className="text-emerald-300">
                      {nextExam.course} – {nextExam.date}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Filter size={12} />
              Filter:
            </span>
            <div className="flex bg-[#020617] border border-[#374151] rounded-full p-1 text-[11px]">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "Midterm", label: "Midterm" },
                { id: "Final", label: "Final" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilterType(opt.id)}
                  className={`px-3 py-1.5 rounded-full ${
                    filterType === opt.id
                      ? "bg-violet-600 text-white"
                      : "text-gray-300 hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== List ===== */}
        <div className="space-y-2">
          {filteredExams.length === 0 ? (
            <div className="text-[11px] text-gray-500 py-6 text-center border border-[#1f2937] rounded-xl">
              ยังไม่มีข้อมูลตารางสอบที่ตรงกับเงื่อนไข
            </div>
          ) : (
            filteredExams.map((e) => {
              const expanded = expandedId === e.id
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 space-y-2 hover:bg-slate-900 transition"
                >
                  {/* Row หลัก */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-100">
                          {e.course} · {e.type}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-violet-500/60 text-violet-200 bg-violet-600/10">
                          {e.courseName}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        วันที่ {e.date} · เวลา {e.time}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        ห้องสอบ:{" "}
                        <span className="text-gray-200 font-medium">
                          {e.room}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenExamSystem(e)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] flex items-center gap-1"
                      >
                        เข้าไปยังระบบทำข้อสอบ
                        <ArrowRight size={12} />
                      </button>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetReminder(e)}
                          className="px-2 py-1 rounded-lg border border-[#374151] hover:bg-slate-800 text-[10px] flex items-center gap-1 text-gray-200"
                        >
                          <AlarmClock size={11} />
                          ตั้งเตือน (mock)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(e.id)}
                          className="px-2 py-1 rounded-lg border border-[#374151] hover:bg-slate-800 text-[10px] flex items-center gap-1 text-gray-200"
                        >
                          <Info size={11} />
                          {expanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* รายละเอียดเพิ่มเติม */}
                  {expanded && (
                    <div className="mt-1 border-t border-[#1f2937] pt-2 space-y-1">
                      <div className="text-[11px] text-gray-300">
                        <span className="text-gray-400">ขอบเขตข้อสอบ: </span>
                        {e.scope}
                      </div>
                      <div className="text-[11px] text-gray-300">
                        <span className="text-gray-400">หมายเหตุ: </span>
                        {e.note}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        * ข้อมูลนี้เป็น mock – ในระบบจริงสามารถดึงจากระบบวัดผล /
                        ระบบจัดสอบของวิทยาลัยได้
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </PageShell>
  )
}
