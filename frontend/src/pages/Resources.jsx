// frontend/src/pages/Resources.jsx
import { useState, useMemo } from "react"
import PageShell from "../components/PageShell"
import { FileText, Download, User, Tag, Search, Filter } from "lucide-react"

const mockFiles = [
  {
    name: "Lecture 01 – Introduction to Web Development.pdf",
    course: "CS-201",
    topic: "Introduction to Web",
    size: "1.2 MB",
    uploader: "Aj. Kritsada",
    type: "PDF",
  },
  {
    name: "Vocabulary – Unit 3.docx",
    course: "ENG-101",
    topic: "Unit 3 – Daily Conversation",
    size: "450 KB",
    uploader: "Aj. Ratchanee",
    type: "DOCX",
  },
  {
    name: "Lab Exercise – Network Basic.pptx",
    course: "CS-105",
    topic: "Network Lab: Week 2",
    size: "2.8 MB",
    uploader: "Aj. Suchawadee",
    type: "PPTX",
  },
]

export default function Resources() {
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")

  // --- Course & Type options ---
  const courses = ["ALL", ...new Set(mockFiles.map((f) => f.course))]
  const types = ["ALL", ...new Set(mockFiles.map((f) => f.type))]

  // =============== FILTER SYSTEM (PRO) ===============
  const filteredFiles = useMemo(() => {
    return mockFiles.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.topic.toLowerCase().includes(search.toLowerCase()) ||
        f.uploader.toLowerCase().includes(search.toLowerCase())

      const matchCourse = courseFilter === "ALL" || f.course === courseFilter
      const matchType = typeFilter === "ALL" || f.type === typeFilter

      return matchSearch && matchCourse && matchType
    })
  }, [search, courseFilter, typeFilter])

  return (
    <PageShell
      title="Resources / Materials"
      subtitle="ไฟล์เอกสารและสื่อการสอนจากรายวิชาต่าง ๆ"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-xs space-y-4">

        {/* ⚙️ FILTER BAR */}
        <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3 space-y-3">

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter size={16} className="text-violet-400" />
            ระบบค้นหาและกรองไฟล์ทั้งหมด
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            <input
              className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-8 py-2 text-xs text-gray-100 
              placeholder:text-gray-500 focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
              placeholder="ค้นหาไฟล์ตามชื่อ หัวข้อ ผู้สอน หรือคำสำคัญ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Course Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400">กรองตามรายวิชา</span>
              <select
                className="bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-gray-100"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400">ประเภทไฟล์</span>
              <select
                className="bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-gray-100"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          * ข้อมูลตัวอย่าง — สามารถเชื่อม API เพื่อดึงไฟล์จริงได้ทันที
        </div>

        {/* =============== RESULT LIST =============== */}
        {filteredFiles.length === 0 ? (
          <p className="text-center text-gray-400 py-6">ไม่พบไฟล์ที่ตรงกับการค้นหา</p>
        ) : (
          filteredFiles.map((f, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#1f2937] bg-[#020617] px-4 py-4 hover:bg-slate-900 transition flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              {/* LEFT */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                  <FileText size={18} className="text-violet-400" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-100">{f.name}</div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Tag size={11} className="text-sky-400" />
                    <span>หัวข้อ: {f.topic}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <User size={11} className="text-emerald-400" />
                    <span>อัปโหลดโดย: {f.uploader}</span>
                  </div>

                  <div className="text-[11px] text-gray-400 flex gap-2">
                    <span className="text-gray-500">รายวิชา:</span>
                    <span className="text-gray-300">{f.course}</span>
                  </div>

                  <div className="text-[11px] text-gray-400 flex gap-2">
                    <span>ประเภท:</span>
                    <span className="text-violet-300">{f.type}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-start md:items-end gap-2 text-[11px]">
                <span className="text-gray-500">{f.size}</span>

                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px]"
                  onClick={() => alert(`(mock) ดาวน์โหลดไฟล์: ${f.name}`)}
                >
                  <Download size={13} />
                  ดาวน์โหลด
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  )
}
