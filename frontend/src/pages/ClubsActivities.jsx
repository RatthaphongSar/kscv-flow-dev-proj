// frontend/src/pages/ClubsActivities.jsx
import { useState, useMemo, useEffect } from "react"
import PageShell from "../components/PageShell"
import {
  Users,
  CalendarDays,
  Search,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Check,
  PlusCircle,
  Info,
  X,
  Send,
  Loader,
} from "lucide-react"
import { apiClient } from "../utils/api"

export default function ClubsActivities() {
  const [search, setSearch] = useState("")
  const [myClubs, setMyClubs] = useState([])
  const [availableClubs, setAvailableClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedClub, setSelectedClub] = useState(null)
  const [modalMsg, setModalMsg] = useState("")

  useEffect(() => {
    fetchClubsData()
  }, [])

  const fetchClubsData = async () => {
    try {
      setLoading(true)
      setError("")

      // Call backend API to get clubs data
      const response = await apiClient.get("/api/clubs")

      if (response && response.data) {
        setMyClubs(response.data.myClubs || [])
        setAvailableClubs(response.data.availableClubs || [])
      } else {
        throw new Error("No clubs data received")
      }
    } catch (err) {
      console.error("Error fetching clubs:", err)
      setError("ไม่สามารถโหลดข้อมูลชมรมได้")
      setMyClubs([])
      setAvailableClubs([])
    } finally {
      setLoading(false)
    }
  }

  const [selectedType, setSelectedType] = useState("my")
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [interests, setInterests] = useState([])

  // Popup state
  const [openChat, setOpenChat] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openRules, setOpenRules] = useState(false)

  // Lock scroll when popup opens
  useEffect(() => {
    if (openChat || openCalendar || openRules) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [openChat, openCalendar, openRules])

  // Combine club lookup
  const allClubsById = {}
  ;[...myClubs, ...availableClubs].forEach((c) => {
    allClubsById[c.id] = c
  })

  const currentList =
    selectedType === "my" ? myClubs : availableClubs

  const filteredClubs = useMemo(() => {
    if (!search.trim()) return currentList
    const q = search.toLowerCase()
    return currentList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.focus.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q),
    )
  }, [currentList, search])

  const selectedClub =
    allClubsById[selectedClubId] ||
    filteredClubs[0] ||
    currentList[0] ||
    null

  const handleToggleInterest = (tag) => {
    setInterests((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    )
  }

  const handleJoinClub = (club) => {
    alert(`(mock) ส่งคำขอเข้าร่วม "${club.name}" แล้ว!`)
  }

  // ==========================
  // JSX Rendering
  // ==========================
  return (
    <PageShell
      title="Clubs & Activities"
      subtitle="ชมรมและกิจกรรมเสริมหลักสูตรของคุณ"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-xs space-y-4">

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader size={20} className="animate-spin text-sky-400" />
            <span className="text-gray-400">โหลดข้อมูลชมรม...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
            {error}
          </div>
        ) : (
          <>
            {/* ---------------- Header ---------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-sky-400" />
            <div>
              <div className="text-sm font-semibold text-gray-100">
                ภาพรวมชมรมเสริมของนักศึกษา
              </div>
              <div className="text-[11px] text-gray-400">
                ดูข้อมูลชมรมที่เข้าร่วม / สมัครเพิ่ม / กิจกรรมถัดไป
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {/* Toggle */}
            <div className="flex bg-[#020617] border border-[#374151] rounded-full p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedType("my")}
                className={`px-3 py-1.5 rounded-full ${
                  selectedType === "my"
                    ? "bg-violet-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                ชมรมของฉัน
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("available")}
                className={`px-3 py-1.5 rounded-full ${
                  selectedType === "available"
                    ? "bg-violet-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                สมัครชมรม
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-52">
              <Search size={14} className="absolute left-2 top-2.5 text-gray-500" />
              <input
                className="w-full bg-[#020617] border border-[#374151] rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-gray-100"
                placeholder="ค้นหาชมรม เช่น IT, Music"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ---------------- Main Layout ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr,1.7fr] gap-4">

          {/* ------ LEFT LIST ------ */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 flex flex-col min-h-[240px]">
            <div className="text-[11px] text-gray-400 mb-2">
              {selectedType === "my"
                ? `เข้าร่วมแล้วทั้งหมด ${myClubs.length} ชมรม`
                : `สมัครได้ทั้งหมด ${availableClubs.length} ชมรม`}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredClubs.length === 0 && (
                <div className="text-[11px] text-gray-500 text-center py-3">
                  ไม่พบข้อมูลตามคำค้นหา
                </div>
              )}

              {filteredClubs.map((c) => {
                const active = selectedClub?.id === c.id
                const isMine = myClubs.some((m) => m.id === c.id)

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClubId(c.id)}
                    className={`w-full text-left rounded-xl border px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-900 transition ${
                      active
                        ? "border-violet-500 bg-violet-600/20"
                        : "border-[#1f2937] bg-[#020617]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-600/40 flex items-center justify-center">
                        <Users size={15} className="text-violet-200" />
                      </div>

                      <div>
                        <div className="text-sm text-gray-100 flex items-center gap-1">
                          {c.name}
                          {isMine && (
                            <Star
                              size={11}
                              className="text-amber-300 fill-amber-300"
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          นัดพบ: {c.meet} · {c.room}
                        </div>
                        <div className="text-[10px] text-gray-500 line-clamp-1">
                          โฟกัส: {c.focus}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          isMine
                            ? "border-emerald-500/60 text-emerald-300 bg-emerald-600/10"
                            : "border-sky-500/60 text-sky-300 bg-sky-600/10"
                        }`}
                      >
                        {isMine ? "Joined" : "Available"}
                      </span>

                      {!isMine && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoinClub(c)
                          }}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-violet-500 text-violet-200 hover:bg-violet-600/20"
                        >
                          <PlusCircle size={11} />
                          สมัครเข้าร่วม
                        </button>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ------ RIGHT DETAIL ------ */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-xs space-y-3">
            {!selectedClub ? (
              <div className="text-[11px] text-gray-400">
                เลือกชมรมจากด้านซ้ายเพื่อดูรายละเอียด
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                      {selectedClub.name}
                    </h2>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <CalendarDays size={12} />
                      นัดพบ: {selectedClub.meet}
                    </div>
                  </div>

                  <div className="text-[10px] text-right text-gray-400">
                    อาจารย์ที่ปรึกษา
                    <div className="text-[11px] text-gray-200">
                      {selectedClub.advisor}
                    </div>
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                      <MapPin size={12} className="text-sky-400" />
                      สถานที่นัดพบ
                    </div>
                    <div className="text-gray-100">{selectedClub.room}</div>
                    <div className="text-[11px] text-gray-300">
                      รูปแบบ: {selectedClub.focus}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                      <Clock size={12} className="text-emerald-400" />
                      กิจกรรมถัดไป
                    </div>
                    <div className="text-gray-100">{selectedClub.nextEvent}</div>
                    <div className="text-[11px] text-gray-300">
                      {selectedClub.nextEventTime}
                    </div>
                  </div>
                </div>

                {/* Interest Tags */}
                <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                    <Star size={12} className="text-amber-300" />
                    ทักษะ / ความสนใจที่เกี่ยวข้อง
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Hackathon",
                      "Music",
                      "Volunteer",
                      "Networking",
                      "Leadership",
                    ].map((tag) => {
                      const active = interests.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleInterest(tag)}
                          className={`px-2 py-1 rounded-full border text-[10px] flex items-center gap-1 ${
                            active
                              ? "border-emerald-500 bg-emerald-600/20 text-emerald-200"
                              : "border-[#374151] text-gray-300 hover:bg-slate-900"
                          }`}
                        >
                          {active ? (
                            <Check size={10} />
                          ) : (
                            <PlusCircle size={10} />
                          )}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOpenCalendar(true)}
                    className="px-3 py-1.5 rounded-lg border border-[#374151] hover:bg-slate-900 text-[11px] text-gray-200 flex items-center gap-1"
                  >
                    <CalendarDays size={13} />
                    ดูปฏิทินกิจกรรม
                  </button>

                  <button
                    onClick={() => setOpenRules(true)}
                    className="px-3 py-1.5 rounded-lg border border-[#374151] hover:bg-slate-900 text-[11px] text-gray-200 flex items-center gap-1"
                  >
                    <Info size={12} />
                    กติกาชมรม
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* ------------------------------ POPUP --------------------------- */}
      {/* ===== Popup: Calendar ===== */}
      {openCalendar && (
        <PopupWrapper onClose={() => setOpenCalendar(false)}>
          <div className="w-full max-w-2xl bg-[#0f172a] rounded-2xl border border-[#1f2937] p-5 max-h-[90vh] overflow-y-auto animate-fadeInScale">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-100 text-sm font-semibold">
                ปฏิทินกิจกรรม - {selectedClub?.name}
              </h2>
              <button
                onClick={() => setOpenCalendar(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700 p-3 bg-slate-900"
                >
                  <div className="font-semibold text-gray-100">
                    กิจกรรมตัวอย่าง {i}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    วันที่: 2025-04-0{i} · เวลา 16:00
                  </div>
                  <div className="text-gray-300 text-[11px] mt-1">
                    รายละเอียดกิจกรรม เช่น ซ้อมงาน / ประชุมเตรียมงานประจำสัปดาห์
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopupWrapper>
      )}

      {/* ===== Popup: Rules ===== */}
      {openRules && (
        <PopupWrapper onClose={() => setOpenRules(false)}>
          <div className="w-full max-w-lg bg-[#0f172a] rounded-2xl border border-[#1f2937] p-5 max-h-[85vh] overflow-y-auto animate-fadeInScale">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-100 text-sm font-semibold">
                กติกาชมรม – {selectedClub?.name}
              </h2>
              <button
                onClick={() => setOpenRules(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="text-xs text-gray-300 space-y-3 pl-4 list-disc">
              <li>สมาชิกต้องเข้าร่วมกิจกรรมไม่น้อยกว่า 70% ต่อเทอม</li>
              <li>ต้องรักษาอุปกรณ์และทรัพย์สินของชมรม</li>
              <li>แจ้งล่วงหน้าหากไม่สามารถเข้าร่วมกิจกรรมได้</li>
              <li>ห้ามนำชื่อชมรมไปใช้ในงานที่ไม่เกี่ยวข้อง</li>
              <li>ต้องปฏิบัติตามระเบียบวิทยาลัยทุกข้อ</li>
            </ul>
          </div>
        </PopupWrapper>
        )}

        <p className="text-[11px] text-gray-500">
          * ข้อมูลอัดฉากจากระบบ Backend
        </p>
          </>
        )}
      </div>
    </PageShell>
  )
}

// =========================
// POPUP WRAPPER COMPONENT
// =========================
function PopupWrapper({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
