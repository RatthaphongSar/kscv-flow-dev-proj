// frontend/src/pages/Meeting.jsx
import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import VideoCallControls from '../components/VideoCallControls'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Mic,
  PhoneOff,
  FileText,
  Hand,
  X,
} from 'lucide-react'

// ----- Mock data: Meetings ตัวอย่าง (รอเชื่อม API) -----
const mockMeetings = [
  {
    id: 'm1',
    title: 'แนะแนวโครงงานจบ',
    course: 'CS-201 · Web Application',
    type: 'Online',
    platform: 'Microsoft Teams',
    location: 'Online',
    teacher: 'Aj. Kritsada',
    date: '2025-03-30',
    start: '09:00',
    end: '10:00',
    status: 'upcoming',
  },
  {
    id: 'm2',
    title: 'ประชุมกลุ่มวิชา English',
    course: 'ENG-101 · English for Communication',
    type: 'On-site',
    platform: '-',
    location: 'ห้อง KVC-302',
    teacher: 'Aj. Supaporn',
    date: '2025-03-31',
    start: '13:30',
    end: '15:00',
    status: 'upcoming',
  },
  {
    id: 'm3',
    title: 'ซ้อมนำเสนอ Project Midterm',
    course: 'CS-201 · Web Application',
    type: 'Online',
    platform: 'Google Meet',
    location: 'Online',
    teacher: 'Aj. Kritsada',
    date: '2025-04-01',
    start: '10:00',
    end: '11:30',
    status: 'upcoming',
  },
  {
    id: 'm4',
    title: 'ปรึกษาเกรดและวางแผนลงทะเบียน',
    course: 'Advising',
    type: 'On-site',
    platform: '-',
    location: 'ห้องอาจารย์ที่ปรึกษา',
    teacher: 'Aj. Ratchanee',
    date: '2025-04-02',
    start: '16:00',
    end: '17:00',
    status: 'upcoming',
  },
]

// helper: แปลง date string -> วันที่อ่านง่าย
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

// helper: หา start ของสัปดาห์ (จันทร์)
function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day // ให้จันทร์เป็นวันแรก
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const MAX_PARTICIPANTS = 100
const TOTAL_SLIDES = 8 // mock จำนวนสไลด์

export default function MeetingPage() {
  const { user } = useAuth()

  const isTeacherUser =
    user?.role === 'teacher' ||
    user?.role === 'TEACHER' ||
    user?.isTeacher === true

  const [filter, setFilter] = useState('all') // all | today | week
  const [selectedId, setSelectedId] = useState(mockMeetings[0]?.id || null)
  const [viewMode, setViewMode] = useState('list') // list | week

  // state ห้องประชุม
  const [joinedMeetingId, setJoinedMeetingId] = useState(null)
  const [meetingStartedByTeacher, setMeetingStartedByTeacher] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [isPresenting, setIsPresenting] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(1)
  const [presentationStartAt, setPresentationStartAt] = useState(null)
  const [participantsCount] = useState(32) // mock ผู้เข้าร่วม
  const [handRaised, setHandRaised] = useState(false)
  const [handsRaisedCount, setHandsRaisedCount] = useState(3) // mock คนที่ยกมือแล้ว
  const [roomEvents, setRoomEvents] = useState([]) // log การเข้าออก / นำเสนอ / เชิญ

  const [showRoomModal, setShowRoomModal] = useState(false)
  const [inviteName, setInviteName] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfWeek = getStartOfWeek(today)

  // helper เล็ก ๆ สำหรับเพิ่ม log กิจกรรม
  const addRoomEvent = (text) => {
    setRoomEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date(),
        text,
      },
      ...prev,
    ])
  }

  // กรอง meeting ตาม filter
  const filteredMeetings = useMemo(() => {
    return mockMeetings.filter((m) => {
      const d = new Date(m.date + 'T00:00:00')
      d.setHours(0, 0, 0, 0)

      if (filter === 'today') {
        return d.getTime() === today.getTime()
      }
      if (filter === 'week') {
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 7)
        return d >= startOfWeek && d < endOfWeek
      }
      return true // all
    })
  }, [filter, startOfWeek, today])

  const selectedMeeting =
    filteredMeetings.find((m) => m.id === selectedId) ||
    filteredMeetings[0] ||
    null

  const isJoined = selectedMeeting && joinedMeetingId === selectedMeeting.id

  // วันที่ในสัปดาห์ (7 วัน)
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + idx)
    return d
  })

  const resetRoomState = (keepMeeting = false) => {
    setIsPresenting(false)
    setHandRaised(false)
    setMicOn(true)
    setCurrentSlide(1)
    setPresentationStartAt(null)
    if (!keepMeeting) {
      setMeetingStartedByTeacher(false)
      setRoomEvents([])
    }
  }

  // teacher กดเริ่ม / ปิดห้อง meeting
  const handleToggleMeetingStart = () => {
    if (!selectedMeeting) return
    if (!isTeacherUser) return

    if (meetingStartedByTeacher) {
      // ปิดห้อง
      setMeetingStartedByTeacher(false)
      setJoinedMeetingId(null)
      setShowRoomModal(false)
      resetRoomState(false)
      addRoomEvent('อาจารย์ได้ปิดห้อง Meeting แล้ว (จำลอง)')
    } else {
      setMeetingStartedByTeacher(true)
      resetRoomState(true)
      addRoomEvent('อาจารย์ได้เริ่มห้อง Meeting แล้ว (จำลอง)')
    }
  }

  const handleJoinLeave = () => {
    if (!selectedMeeting) return

    // นักศึกษาห้ามเริ่มห้องเอง
    if (!meetingStartedByTeacher && !isTeacherUser) {
      alert('รอให้อาจารย์เริ่มห้อง Meeting ก่อน')
      return
    }

    if (joinedMeetingId === selectedMeeting.id) {
      // ออกจากห้อง
      setJoinedMeetingId(null)
      resetRoomState(true)
      setShowRoomModal(false)
      addRoomEvent('คุณได้ออกจากห้อง Meeting (จำลอง)')
      return
    }

    // เข้าห้อง
    setJoinedMeetingId(selectedMeeting.id)
    resetRoomState(true)
    // setShowRoomModal(true) // Let navbar show instead
    addRoomEvent('คุณได้เข้าร่วมห้อง Meeting (จำลอง)')
  }

  const toggleMic = () => {
    if (!isJoined) return
    setMicOn((prev) => {
      const next = !prev
      addRoomEvent(
        `คุณได้${next ? 'เปิด' : 'ปิด'}ไมโครโฟนของคุณ (จำลอง)`
      )
      return next
    })
  }

  const togglePresentation = () => {
    if (!isJoined) return
    setIsPresenting((prev) => {
      const next = !prev
      if (next) {
        const now = new Date()
        setPresentationStartAt(now)
        addRoomEvent(
          `คุณได้เริ่มนำเสนอสไลด์เวลา ${now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          })} น. (จำลอง)`
        )
      } else {
        addRoomEvent('คุณได้หยุดการนำเสนอสไลด์ (จำลอง)')
        setPresentationStartAt(null)
      }
      return next
    })
  }

  const goPrevSlide = () => {
    if (!isPresenting) return
    setCurrentSlide((s) => {
      const next = Math.max(1, s - 1)
      addRoomEvent(`เลื่อนสไลด์ไปหน้า ${next} (จำลอง)`)
      return next
    })
  }

  const goNextSlide = () => {
    if (!isPresenting) return
    setCurrentSlide((s) => {
      const next = Math.min(TOTAL_SLIDES, s + 1)
      addRoomEvent(`เลื่อนสไลด์ไปหน้า ${next} (จำลอง)`)
      return next
    })
  }

  const toggleHand = () => {
    if (!isJoined) return
    setHandRaised((prev) => {
      const next = !prev
      setHandsRaisedCount((c) => c + (next ? 1 : -1))
      addRoomEvent(
        `คุณได้${next ? 'ยกมือขอพูด' : 'ลดมือแล้ว'} (จำลอง)`
      )
      return next
    })
  }

  const handleInvite = () => {
    const name = inviteName.trim()
    if (!name) return
    addRoomEvent(`คุณได้เชิญ "${name}" เข้าร่วม Meeting (จำลอง)`)
    setInviteName('')
  }

  return (
    <div className={`h-[calc(100vh-112px)] w-full bg-[#020617] text-gray-100 flex flex-col ${isJoined && joinedMeetingId ? 'pt-[60px]' : ''}`}>
      {/* Top navbar - Fixed position when user is in a meeting */}
      {isJoined && joinedMeetingId ? (
        <div className="hidden lg:fixed lg:top-[56px] lg:left-0 lg:right-0 lg:z-50 lg:bg-gradient-to-r lg:from-slate-900 lg:to-slate-800 lg:border-b lg:border-[#1f2937] lg:px-4 lg:py-3 lg:flex lg:items-center lg:justify-between lg:shadow-lg">
          <div className="text-sm font-semibold text-white">
            ห้องประชุม: {selectedMeeting?.title}
          </div>
          <VideoCallControls onEndCall={handleJoinLeave} isNavbar={true} />
        </div>
      ) : null}

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 px-2 sm:px-4 py-4 rounded-2xl border border-[#1f2937] bg-[#020617] overflow-hidden flex flex-col lg:flex-row lg:pt-0">
          {/* Show video navbar on mobile inside the main area */}
          {isJoined && joinedMeetingId && (
            <div className="lg:hidden w-full bg-gradient-to-r from-slate-900 to-slate-800 border-b border-[#1f2937] px-3 py-2 flex items-center justify-between shadow-lg mb-2 rounded-lg shrink-0">
              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                ห้องประชุม: {selectedMeeting?.title}
              </div>
              <VideoCallControls onEndCall={handleJoinLeave} isNavbar={true} />
            </div>
          )}
          {/* Sidebar: Filter + Upcoming list สั้น ๆ */}
        <aside className="w-full lg:w-72 border-r border-[#1f2937] bg-[#020617] flex flex-col max-h-40 sm:max-h-48 lg:max-h-none mb-4 lg:mb-0">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-[#1f2937]">
            <h1 className="text-xs sm:text-sm font-semibold text-gray-100">
              การนัดหมาย / Meeting
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-400">
              นัดหมายที่เกี่ยวกับรายวิชาและอาจารย์ที่ปรึกษา
            </p>
          </div>

          {/* Filters */}
          <div className="px-3 sm:px-4 py-2 sm:py-3">
            <p className="text-[10px] sm:text-[11px] text-gray-400 mb-1.5">ช่วงเวลา</p>
            <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-[11px]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 sm:px-2 py-0.5 sm:py-1 rounded-full border text-xs ${
                  filter === 'all'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setFilter('today')}
                className={`px-2 sm:px-2 py-0.5 sm:py-1 rounded-full border text-xs ${
                  filter === 'today'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
              >
                วันนี้
              </button>
              <button
                type="button"
                onClick={() => setFilter('week')}
                className={`px-2 sm:px-2 py-0.5 sm:py-1 rounded-full border text-xs ${
                  filter === 'week'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
              >
                ภายในสัปดาห์
              </button>
            </div>
          </div>

          {/* รายการ Upcoming สั้น ๆ */}
          <div className="px-3 sm:px-4 pb-2 sm:pb-3 text-[10px] sm:text-[11px] text-gray-400">
            รวม {filteredMeetings.length} นัดหมาย
          </div>

          <div className="flex-1 overflow-y-auto px-2 sm:px-2 pb-2 sm:pb-3 space-y-0.5 sm:space-y-1">
            {filteredMeetings.length === 0 && (
              <div className="text-[10px] sm:text-[11px] text-gray-500 px-2">
                ยังไม่มีการนัดหมายในช่วงเวลานี้
              </div>
            )}

            {filteredMeetings.map((m) => {
              const active = selectedMeeting && m.id === selectedMeeting.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs mb-0.5 sm:mb-1 transition
                    ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-transparent text-gray-200 hover:bg-slate-800'
                    }`}
                >
                  <div className="font-semibold text-xs sm:text-[13px] truncate">
                    {m.title}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-gray-300 truncate">
                    {m.course}
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">
                    <span>{formatDateLabel(m.date)}</span>
                    <span className="text-[8px] sm:text-[10px]">
                      {m.start} - {m.end}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main: Calendar + รายละเอียด */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#020617] gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-100 truncate">
                  Meeting & Schedule
                </h2>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40 whitespace-nowrap">
                  View
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                ดูภาพรวมการนัดหมายทั้งหมด
              </p>
            </div>

            {/* สลับโหมดแสดงผล */}
            <div className="flex flex-col items-end gap-2 text-[10px] sm:text-[11px] flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[10px] sm:text-xs ${
                    viewMode === 'list'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  รายการ
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[10px] sm:text-xs ${
                    viewMode === 'week'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  สัปดาห์
                </button>
              </div>

              {/* ปุ่มควบคุมสิทธิ์เริ่มห้อง */}
              <button
                type="button"
                onClick={handleToggleMeetingStart}
                disabled={!isTeacherUser}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[10px] sm:text-[11px] whitespace-nowrap ${
                  isTeacherUser
                    ? meetingStartedByTeacher
                      ? 'bg-red-600/90 border-red-500 text-white hover:bg-red-500'
                      : 'bg-emerald-600/90 border-emerald-500 text-white hover:bg-emerald-500'
                    : 'border-[#374151] bg-slate-900/40 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isTeacherUser
                  ? meetingStartedByTeacher
                    ? 'ปิด'
                    : 'เริ่ม'
                  : 'รอ'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex bg-[#020617] min-w-0 overflow-hidden">
            {/* ซ้าย: Calendar / List */}
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-[#1f2937] overflow-y-auto min-w-0">
              {viewMode === 'week' ? (
                <WeekView
                  weekDays={weekDays}
                  filteredMeetings={filteredMeetings}
                  selectedMeeting={selectedMeeting}
                  setSelectedId={setSelectedId}
                  today={today}
                />
              ) : (
                <ListView
                  filteredMeetings={filteredMeetings}
                  selectedMeeting={selectedMeeting}
                  setSelectedId={setSelectedId}
                />
              )}
            </div>

            {/* ขวา: Meeting Detail Panel */}
            <div className="w-full lg:w-80 bg-[#020617] text-xs p-2 sm:p-4 max-h-24 sm:max-h-32 lg:max-h-none overflow-y-auto">
              <h3 className="text-sm font-semibold mb-3">
                รายละเอียดนัดหมาย
              </h3>

              {!selectedMeeting ? (
                <p className="text-gray-400">
                  เลือกนัดหมายจากด้านซ้ายเพื่อดูรายละเอียด
                </p>
              ) : (
                <div className="space-y-2 text-gray-300">
                  <div>
                    <div className="text-[11px] text-gray-400">หัวข้อ</div>
                    <div className="text-sm font-semibold">
                      {selectedMeeting.title}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-400">
                      รายวิชา / ประเภท
                    </div>
                    <div>{selectedMeeting.course}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>
                      {formatDateLabel(selectedMeeting.date)} ·{' '}
                      {selectedMeeting.start} - {selectedMeeting.end}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span>อาจารย์ผู้สอน: {selectedMeeting.teacher}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>สถานที่: {selectedMeeting.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-gray-400" />
                    <span>
                      รูปแบบ: {selectedMeeting.type} (
                      {selectedMeeting.platform})
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] text-gray-400 mb-1">
                      สถานะ (ตัวอย่าง)
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[11px]">
                      {meetingStartedByTeacher
                        ? 'ห้องเปิดแล้ว (รอผู้เข้าร่วม)'
                        : 'กำลังจะถึง / Upcoming'}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-2">
                      * เมื่อเชื่อมต่อ API จริง สามารถใช้สถานะจริงจากระบบ
                      เช่น "กำลังดำเนินการ", "ยกเลิก", "สิ้นสุดแล้ว"
                    </p>
                  </div>

                  {/* ปุ่มควบคุมการเข้าร่วม */}
                  <div className="pt-3 space-y-2">
                    <button
                      className={`w-full text-xs py-2 rounded-lg flex items-center justify-center gap-2 ${
                        !meetingStartedByTeacher && !isTeacherUser
                          ? 'bg-slate-800 text-gray-500 border border-[#374151] cursor-not-allowed'
                          : isJoined
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                      }`}
                      onClick={handleJoinLeave}
                      disabled={!meetingStartedByTeacher && !isTeacherUser}
                    >
                      {isJoined ? (
                        <>
                          <PhoneOff size={14} />
                          ออกจากห้อง Meeting (จำลอง)
                        </>
                      ) : (
                        <>
                          <Video size={14} />
                          {meetingStartedByTeacher || isTeacherUser
                            ? 'เข้าห้อง Meeting (จำลอง)'
                            : 'รออาจารย์เริ่มห้อง Meeting'}
                        </>
                      )}
                    </button>

                    {isJoined && (
                      <button
                        className="w-full border border-[#374151] hover:bg-slate-900 text-xs py-2 rounded-lg"
                        onClick={() => setShowRoomModal(true)}
                      >
                        เปิดหน้าต่างห้องประชุม / นำเสนอสไลด์
                      </button>
                    )}

                    <button className="w-full border border-[#374151] hover:bg-slate-900 text-xs py-2 rounded-lg">
                      เพิ่มลงใน Calendar ส่วนตัว
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ===== POPUP ห้องประชุม / สไลด์ ===== */}
      {isJoined && showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 p-0 lg:p-4">
          <div className="w-full lg:max-w-5xl max-h-[90vh] bg-[#020617] border lg:border border-[#1f2937] rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header popup */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-[#1f2937] flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="text-xs min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-gray-100">
                    ห้องประชุม – {selectedMeeting?.title}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400">
                    {selectedMeeting &&
                      `${formatDateLabel(selectedMeeting.date)} · ${
                        selectedMeeting.start
                      } - ${selectedMeeting.end}`}
                  </span>
                </div>
                <div className="text-[9px] sm:text-[11px] text-gray-500 mt-1">
                  ผู้เข้าร่วม {participantsCount} / {MAX_PARTICIPANTS} คน · ยกมือแล้ว {handsRaisedCount} คน
                </div>
                {presentationStartAt && (
                  <div className="text-[9px] sm:text-[11px] text-blue-300 mt-1">
                    เริ่มนำเสนอเวลา{' '}
                    {presentationStartAt.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    น.
                  </div>
                )}
              </div>
              <button
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-700 flex-shrink-0"
                onClick={() => setShowRoomModal(false)}
              >
                <X size={16} className="text-gray-300" />
              </button>
            </div>

            {/* Body popup */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              {/* Left: Slide area */}
              <div className="flex-1 p-2 sm:p-3 lg:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between text-xs mb-0.5 sm:mb-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-200">
                    <FileText size={12} sm:size={14} className="text-blue-400" />
                    <span className="text-xs sm:text-sm">สไลด์</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-gray-400">
                    {currentSlide} / {TOTAL_SLIDES}
                  </span>
                </div>

                <div
                  className="
                    flex-1
                    rounded-xl sm:rounded-2xl
                    bg-gradient-to-br from-blue-900/70 via-slate-900 to-slate-950
                    border border-blue-700/40
                    flex items-center justify-center
                    text-[11px] sm:text-[12px] md:text-[13px] text-blue-100 text-center px-3 sm:px-6
                    min-h-[180px] sm:min-h-[240px] md:min-h-[320px] lg:min-h-[420px]
                  "
                >
                  {isPresenting
                    ? 'กำลังนำเสนอสไลด์'
                    : 'คลิก "เริ่มนำเสนอ" เพื่อเริ่ม'}
                </div>

                {/* Slide controls */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] mt-1 sm:mt-2 flex-shrink-0">
                  <button
                    onClick={togglePresentation}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-xs ${
                      isPresenting
                        ? 'bg-red-600/90 border-red-500 text-white hover:bg-red-500'
                        : 'bg-blue-600/90 border-blue-500 text-white hover:bg-blue-500'
                    }`}
                  >
                    {isPresenting ? 'หยุด' : 'เริ่ม'}
                  </button>
                  <button
                    onClick={goPrevSlide}
                    disabled={!isPresenting || currentSlide === 1}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-xs"
                  >
                    ก่อน
                  </button>
                  <button
                    onClick={goNextSlide}
                    disabled={!isPresenting || currentSlide === TOTAL_SLIDES}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-xs"
                  >
                    ถัดไป
                  </button>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 ml-1 sm:ml-2">
                    * การนำเสนอสไลด์จำลอง
                  </span>
                </div>
              </div>

              {/* Right controls – คุมสิทธิ์ / log / เชิญคน */}
              <div className="w-full lg:w-60 lg:min-w-0 border-t lg:border-t-0 lg:border-l border-[#1f2937] p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 text-xs overflow-y-auto flex flex-col max-h-48 lg:max-h-none lg:min-h-0">
                {/* Mic */}
                <div className="space-y-0.5 sm:space-y-1 flex-shrink-0">
                  <div className="text-[10px] sm:text-[11px] text-gray-400">ไมโครโฟน</div>
                  <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={toggleMic}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs"
                    >
                      <Mic
                        size={12}
                        className={micOn ? 'text-emerald-400' : 'text-red-400'}
                      />
                      <span className="hidden sm:inline text-xs">{micOn ? 'ปิด' : 'เปิด'}</span>
                    </button>
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border text-[9px] sm:text-[10px] shrink-0 ${
                        micOn
                          ? 'border-emerald-400 text-emerald-200'
                          : 'border-red-400 text-red-200'
                      }`}
                    >
                      {micOn ? 'เปิด' : 'ปิด'}
                    </span>
                  </div>
                </div>

                {/* Hand raise */}
                <div className="space-y-0.5 sm:space-y-1 flex-shrink-0">
                  <div className="text-[10px] sm:text-[11px] text-gray-400">ยกมือ</div>
                  <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={toggleHand}
                      className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md border text-xs ${
                        handRaised
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-[#374151] bg-slate-900 text-gray-200 hover:bg-slate-800'
                      }`}
                    >
                      <Hand size={12} />
                      <span className="hidden sm:inline text-xs">{handRaised ? 'ลด' : 'ยก'}</span>
                    </button>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">
                      {handsRaisedCount} คน
                    </span>
                  </div>
                </div>

                {/* Invite user (mock) */}
                <div className="space-y-0.5 sm:space-y-1 flex-shrink-0">
                  <div className="text-[10px] sm:text-[11px] text-gray-400">เชิญ</div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <input
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="ชื่อ..."
                      className="flex-1 min-w-0 bg-[#020617] border border-[#374151] rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleInvite}
                      disabled={!inviteName.trim()}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-[#374151] text-[10px] sm:text-[11px] hover:bg-slate-900 disabled:opacity-40 shrink-0"
                    >
                      เชิญ
                    </button>
                  </div>
                </div>

                {/* Info + event log */}
                <div className="text-[9px] sm:text-[10px] text-gray-500 pt-1 sm:pt-2 border-t border-[#1f2937] space-y-1 sm:space-y-2 flex-1 flex flex-col min-h-0">
                  <div className="flex-shrink-0 line-clamp-3">
                    * ห้องประชุมจำลอง (UI demo)
                  </div>

                  <div className="border border-[#1f2937] rounded-lg overflow-y-auto px-1.5 sm:px-2 py-1 sm:py-1.5 flex-1 min-h-0">
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 sticky top-0 bg-[#020617]">
                      กิจกรรม
                    </div>
                    {roomEvents.length === 0 ? (
                      <div className="text-[9px] text-gray-500">
                        ยังไม่มีกิจกรรม
                      </div>
                    ) : (
                      roomEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex gap-1 text-[8px] sm:text-[9px] text-gray-300 mb-0.5"
                        >
                          <span className="text-gray-500 shrink-0">
                            {ev.time.toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="break-words">{ev.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Leave from popup */}
                <button
                  className="w-full text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white flex-shrink-0"
                  onClick={handleJoinLeave}
                >
                  <PhoneOff size={13} />
                  ออกจากห้อง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  )
}

/* ========== Sub components ========= */

function WeekView({
  weekDays,
  filteredMeetings,
  selectedMeeting,
  setSelectedId,
  today,
}) {
  return (
    <div className="px-6 py-4">
      {/* แถบวันในสัปดาห์ */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((d, idx) => {
          const dateStr = d.toISOString().slice(0, 10)
          const hasMeeting = filteredMeetings.some((m) => m.date === dateStr)
          const isToday = d.toDateString() === today.toDateString()

          return (
            <div
              key={idx}
              className={`rounded-xl border px-2 py-2 text-center text-xs cursor-default
                ${
                  isToday
                    ? 'border-violet-500 bg-violet-600/20'
                    : 'border-[#1f2937] bg-[#020617]'
                }`}
            >
              <div className="text-[11px] text-gray-400">
                {d.toLocaleDateString('th-TH', {
                  weekday: 'short',
                })}
              </div>
              <div className="text-base font-semibold">{d.getDate()}</div>
              {hasMeeting && (
                <div className="mt-1 text-[10px] text-violet-300">มีนัด</div>
              )}
            </div>
          )
        })}
      </div>

      {/* timeline แบบง่าย: list group ตามวัน */}
      <div className="space-y-4">
        {weekDays.map((d, idx) => {
          const dateStr = d.toISOString().slice(0, 10)
          const meetingsOfDay = filteredMeetings.filter(
            (m) => m.date === dateStr
          )
          if (meetingsOfDay.length === 0) return null

          return (
            <div key={idx} className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-gray-400">
                  {d.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
                <div className="h-px flex-1 bg-[#1f2937]" />
              </div>

              <div className="space-y-2">
                {meetingsOfDay.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg border px-3 py-2 cursor-pointer transition
                      ${
                        selectedMeeting && selectedMeeting.id === m.id
                          ? 'border-violet-500 bg-violet-600/20'
                          : 'border-[#1f2937] bg-[#020617] hover:bg-slate-900'
                      }`}
                    onClick={() => setSelectedId(m.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[13px]">
                        {m.title}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={12} />
                        <span>
                          {m.start} - {m.end}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-300">
                      {m.course}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListView({ filteredMeetings, selectedMeeting, setSelectedId }) {
  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-semibold mb-3">
        รายการนัดหมายทั้งหมด
      </h3>
      {filteredMeetings.length === 0 ? (
        <p className="text-xs text-gray-400">
          ยังไม่มีนัดหมายในช่วงเวลานี้
        </p>
      ) : (
        <div className="space-y-2 text-xs">
          {filteredMeetings.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border px-3 py-2 cursor-pointer transition
                ${
                  selectedMeeting && selectedMeeting.id === m.id
                    ? 'border-violet-500 bg-violet-600/20'
                    : 'border-[#1f2937] bg-[#020617] hover:bg-slate-900'
                }`}
              onClick={() => setSelectedId(m.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[13px]">{m.title}</div>
                <span className="text-[10px] text-gray-400">
                  {formatDateLabel(m.date)} · {m.start} - {m.end}
                </span>
              </div>
              <div className="text-[11px] text-gray-300">{m.course}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
