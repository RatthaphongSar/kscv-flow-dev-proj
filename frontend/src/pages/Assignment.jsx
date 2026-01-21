import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { classApi } from "../api/classApi"
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
} from "lucide-react"

// Mock assignments - temporary fallback
const mockAssignments = [
  {
    id: 1,
    title: "Frontend Layout – KVC Portal",
    courseCode: "CS-201",
    courseName: "Web Application Development",
    due: "2025-04-02 23:59",
    status: "in_progress",
  },
  {
    id: 2,
    title: "Essay: Globalization",
    courseCode: "ENG-101",
    courseName: "English for Communication",
    due: "2025-04-05 17:00",
    status: "not_started",
  },
  {
    id: 3,
    title: "Worksheet: Business Math #1",
    courseCode: "MA-110",
    courseName: "Business Mathematics",
    due: "2025-04-01 23:59",
    status: "submitted",
  },
]

function statusBadge(status) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
        <CheckCircle2 size={11} />
        ส่งแล้ว
      </span>
    )
  }
  if (status === "late") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40">
        <AlertCircle size={11} />
        ส่งช้า
      </span>
    )
  }
  if (status === "missing") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-200 border border-red-700/60">
        <XCircle size={11} />
        ไม่ได้ส่ง
      </span>
    )
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40">
        กำลังทำ
      </span>
    )
  }
  // not_started
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-200 border border-slate-600">
      ยังไม่เริ่ม
    </span>
  )
}

export default function Assignment() {
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all classes and their assignments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const classData = await classApi.getClasses()
        setClasses(classData || [])

        // Fetch assignments for each class
        const allAssignments = []
        for (const cls of (classData || [])) {
          try {
            const classAssignments = await classApi.getClassAssignments(cls.id)
            // Add class info to each assignment for display
            const withClassInfo = (classAssignments || []).map(a => ({
              ...a,
              class: cls,
              courseCode: cls.code,
              courseName: cls.name,
            }))
            allAssignments.push(...withClassInfo)
          } catch (err) {
            console.error(`Error fetching assignments for class ${cls.id}:`, err)
          }
        }
        setAssignments(allAssignments)
      } catch (err) {
        console.error("Error fetching data:", err)
        // Fallback to mock data
        setAssignments(mockAssignments)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const total = assignments.length
  const submitted = assignments.filter(a => a.status === "submitted").length
  const inProgress = assignments.filter(a => a.status === "in_progress").length
  const notStarted = assignments.filter(a => a.status === "not_started").length

  return (
    <PageShell
      title="Assignments"
      subtitle="ภาพรวมงานที่ได้รับมอบหมายจากทุกวิชา และสถานะการส่งของคุณ"
      right={loading ? "กำลังโหลด..." : `${total} งาน`}
    >
      <div className="grid gap-4 lg:grid-cols-[1.8fr,1.1fr]">
        {/* ===== MAIN LIST ===== */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-sky-400" />
              <span className="text-sm font-semibold">งานที่ต้องติดตาม</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-[#374151] text-gray-300 hover:bg-slate-800"
            >
              <Filter size={12} />
              ตัวกรอง (ตัวอย่าง)
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 text-xs" data-testid="assignments-list">
            {loading ? (
              <div className="text-center py-4 text-gray-400">กำลังโหลด...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-4 text-gray-400">ไม่มีงานที่ได้รับมอบหมาย</div>
            ) : (
              assignments.map(a => (
                <div
                  key={a.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 hover:bg-slate-900"
                >
                  <div>
                    <div className="text-sm text-gray-100">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-violet-300 font-medium">{a.courseCode}</span>
                        <span className="text-gray-500">·</span>
                        <span>{a.courseName}</span>
                      </span>
                      <span className="text-gray-500">·</span>
                    <span className="inline-flex items-center gap-1">
                      ส่งภายใน
                      <Clock size={11} className="inline text-gray-400" />
                      {a.due}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-violet-300/80">
                    ดูรายละเอียด / ส่งไฟล์งานได้ที่หน้า <span className="font-semibold">Class</span> ของรายวิชานั้น
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end md:items-end gap-1">
                  {statusBadge(a.status)}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* ===== SUMMARY / SIDE CARD ===== */}
        <div className="space-y-3">
          {/* Summary card */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
            <h3 className="text-sm font-semibold text-gray-100 mb-2">
              สรุปสถานะงาน (ตัวอย่าง)
            </h3>
            <div className="space-y-2 text-[11px] text-gray-300">
              <div className="flex items-center justify-between">
                <span>งานทั้งหมด</span>
                <span className="font-semibold text-gray-100">{total} ชิ้น</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  ส่งแล้ว
                </span>
                <span className="font-semibold text-emerald-300">{submitted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>กำลังทำอยู่</span>
                <span className="font-semibold text-amber-300">{inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ยังไม่เริ่ม</span>
                <span className="font-semibold text-slate-200">{notStarted}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-500">
              * เมื่อเชื่อมต่อ API จริง ค่าพวกนี้สามารถคำนวณจากสถานะงานของผู้ใช้ในทุกวิชาได้อัตโนมัติ
            </p>
          </div>

          {/* Hint card */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-[11px] text-gray-300 space-y-2">
            <h3 className="text-sm font-semibold text-gray-100">
              วิธีใช้งานหน้า Assignments
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>ดูภาพรวมว่างานไหนใกล้ถึงกำหนดส่งจากทุกวิชาพร้อมสถานะ</li>
              <li>หากต้องการอ่านคำสั่งละเอียด / แนบไฟล์ ให้กดไปที่หน้า <span className="font-semibold">Class</span> แล้วเลือกวิชานั้น</li>
              <li>ภายหลังสามารถเพิ่มตัวกรองตามวิชา สถานะ หรือช่วงเวลาส่งได้</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
