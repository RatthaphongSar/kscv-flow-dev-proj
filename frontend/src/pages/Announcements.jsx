import { useState } from "react"
import PageShell from "../components/PageShell"
import { Bell, Bookmark, BookmarkCheck, Info, Share2, X } from "lucide-react"

// === MOCK ===
const mockAnnouncements = [
  {
    id: "a1",
    title: "เลื่อนสอบกลางภาค CS-201",
    tag: "Course",
    time: "5 mins ago",
    desc: "เลื่อนสอบกลางภาคจาก 10:00 เป็น 13:00 ในวันเดิม ห้อง Lab-105",
    detail:
      "สาเหตุการเลื่อนสอบ: ห้อง Lab ใช้ซ่อมบำรุงเครื่องคอมพิวเตอร์\nนักศึกษาต้องเตรียมอุปกรณ์ให้พร้อมก่อนเข้าห้องสอบ",
  },
  {
    id: "a2",
    title: "ปิดปรับปรุงระบบทะเบียน",
    tag: "System",
    time: "30 mins ago",
    desc: "ระบบลงทะเบียนรายวิชาจะปิดปรับปรุงวันอาทิตย์ 21:00–23:00",
    detail:
      "ระบบจะไม่สามารถลงทะเบียน เพิ่ม–ถอนรายวิชา หรือเข้าดูผลการเรียนได้ในช่วงเวลาดังกล่าว",
  },
  {
    id: "a3",
    title: "กิจกรรมจิตอาสาปลูกต้นไม้",
    tag: "Activity",
    time: "2 hours ago",
    desc: "ชมรมสิ่งแวดล้อมเชิญร่วมกิจกรรมจิตอาสา ณ สวนสาธารณะกาฬสินธุ์",
    detail:
      "เตรียมหมวก แว่นตา และน้ำดื่ม\nกิจกรรมจะเริ่มเวลา 08:30 น. เป็นต้นไป",
  },
]

const FILTERS = ["All", "Course", "System", "Activity"]

export default function Announcements() {
  const [filter, setFilter] = useState("All")
  const [bookmark, setBookmark] = useState({})
  const [modal, setModal] = useState({ open: false, data: null })

  const toggleBookmark = (id) => {
    setBookmark((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const openDetail = (data) => {
    setModal({ open: true, data })
  }

  const filtered =
    filter === "All"
      ? mockAnnouncements
      : mockAnnouncements.filter((a) => a.tag === filter)

  return (
    <PageShell
      title="Announcements"
      subtitle="ข่าวประกาศจากวิทยาลัยและอาจารย์ผู้สอน"
      right="Ready to connect to /api/announcements"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-4">
        
        {/* ==== Header + Filter ==== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bell size={16} className="text-amber-400" />
            ล่าสุด
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full border ${
                  filter === f
                    ? "bg-amber-500 text-black border-amber-400"
                    : "border-[#374151] text-gray-300 hover:bg-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ==== Cards Grid ==== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {filtered.map((a) => (
            <AnnouncementCard
              key={a.id}
              data={a}
              bookmarked={bookmark[a.id]}
              onBookmark={() => toggleBookmark(a.id)}
              onDetail={() => openDetail(a)}
            />
          ))}
        </div>

        <p className="text-[11px] text-gray-500">
          * ข้อมูลเป็น mock data — สามารถ map จาก API จริงได้ทันที
        </p>
      </div>

      {/* ===== MODAL ===== */}
      {modal.open && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#020617] border border-[#1f2937] rounded-xl p-4 space-y-3">
            {/* header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-100 font-semibold">
                  {modal.data.title}
                </div>
                <div className="text-[10px] text-gray-400">{modal.data.time}</div>
              </div>

              <button
                className="p-2 rounded-lg hover:bg-slate-800"
                onClick={() => setModal({ open: false, data: null })}
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs whitespace-pre-line text-gray-300 border border-[#1f2937] rounded-lg p-3">
              {modal.data.detail}
            </div>

            <button
              className="w-full px-3 py-2 mt-2 rounded-lg border border-amber-500 text-amber-300 text-xs hover:bg-amber-500/10 flex items-center justify-center gap-1"
              onClick={() => alert("(mock) แชร์ประกาศ")}
            >
              <Share2 size={12} />
              แชร์ประกาศนี้
            </button>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function AnnouncementCard({ data, bookmarked, onBookmark, onDetail }) {
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3 relative">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-gray-100 truncate">
          {data.title}
        </h3>
        <span className="text-[10px] text-gray-500">{data.time}</span>
      </div>

      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-[10px] mb-2">
        {data.tag}
      </span>

      <p className="text-xs text-gray-300 mb-2">{data.desc}</p>

      <button
        onClick={onDetail}
        className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1"
      >
        <Info size={11} />
        ดูรายละเอียด
      </button>
    </div>
  )
}
