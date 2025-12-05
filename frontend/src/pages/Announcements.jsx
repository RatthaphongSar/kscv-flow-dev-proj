import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { Bell, Bookmark, BookmarkCheck, Info, Share2, X, Loader } from "lucide-react"
import { apiClient } from "../utils/api"

const FILTERS = ["All", "Course", "System", "Activity"]

export default function Announcements() {
  const [filter, setFilter] = useState("All")
  const [bookmark, setBookmark] = useState({})
  const [modal, setModal] = useState({ open: false, data: null })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError("")

      // Call backend API to get announcements
      const response = await apiClient.get("/announcements")

      // API returns array directly
      if (Array.isArray(response)) {
        setAnnouncements(response)
      } else {
        throw new Error("Invalid announcements data received")
      }
    } catch (err) {
      console.error("Error fetching announcements:", err)
      setError("ไม่สามารถโหลดประกาศได้")
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = (id) => {
    setBookmark((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const openDetail = (data) => {
    setModal({ open: true, data })
  }

  const filtered =
    filter === "All"
      ? announcements
      : announcements.filter((a) => a.tag === filter)

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

        {/* ==== Loading / Error / Empty ==== */}
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader size={20} className="animate-spin text-amber-400" />
            <span className="text-gray-400">โหลดประกาศ...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 text-center text-yellow-300">
            ไม่มีประกาศ
          </div>
        ) : (
          <>
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
          </>
        )}

        <p className="text-[11px] text-gray-500">
          * ข้อมูลอัดฉากจากระบบ Backend
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
