// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { classApi } from '../api/classApi'
import { announcementApi } from '../api/announcementApi'
import {
  Search,
  ChevronRight,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  X,
  Users,
  Link2,
  Copy,
  Pin,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  Plus,
} from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  
  // state สำหรับ create announcement modal
  const [createAnnouncementModal, setCreateAnnouncementModal] = useState({
    open: false,
    selectedClassId: '',
    formData: { title: '', content: '', category: 'ประกาศ', image: null, imagePreview: null },
    submitting: false,
  })

  // state สำหรับ feed (deprecated - will be refactored with real API)
  const [shareModal, setShareModal] = useState({
    open: false,
    post: null,
    url: '',
    tab: 'user', // user | group | link
  })

  // Load user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch classes
        if (user?.role === 'student') {
          const classesData = await classApi.getClasses()
          setClasses(classesData?.slice(0, 5) || [])
        } else if (user?.role === 'teacher') {
          const classesData = await classApi.getClasses()
          setClasses(classesData || [])
        }
        
        // Fetch announcements
        const announcementsData = await announcementApi.getAnnouncements(undefined, 0, 10)
        setAnnouncements(announcementsData?.data || [])
        
        // TODO: Fetch upcoming meetings from meetings API
        // setUpcomingMeetings(...)
      } catch (err) {
        console.error('Error loading home data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [user])

  // ล็อก body scroll เมื่อมี popup แชร์
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (shareModal.open) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [shareModal.open])

  const sharePost = (post) => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/announcements#post-${post.id}`
        : ''
    setShareModal({
      open: true,
      post,
      url,
      tab: 'user',
    })
  }

  const handleCopyLink = async () => {
    if (!shareModal.url) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareModal.url)
        alert('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว')
      }
    } catch (e) {
      console.log('copy error', e)
    }
  }

  const handleNativeShare = async () => {
    if (!shareModal.url || !shareModal.post) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareModal.post.title,
          text: shareModal.post.excerpt,
          url: shareModal.url,
        })
      } else {
        await handleCopyLink()
      }
    } catch (e) {
      console.log('native share error', e)
    }
  }



  // Comment handlers removed - feed functionality deprecated

  // Announcement handlers
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      setCreateAnnouncementModal({
        ...createAnnouncementModal,
        submitting: true,
      })

      const { title, content, category, imagePreview } = createAnnouncementModal.formData
      const classId = createAnnouncementModal.selectedClassId

      if (!title || !content || !classId) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน')
        return
      }

      await announcementApi.createAnnouncement({
        title,
        content,
        category,
        classId,
        image: imagePreview || undefined,
      })

      // Reset and reload
      setCreateAnnouncementModal({
        open: false,
        selectedClassId: '',
        formData: { title: '', content: '', category: 'ประกาศ', image: null, imagePreview: null },
        submitting: false,
      })

      // Reload announcements
      const announcementsData = await announcementApi.getAnnouncements(undefined, 0, 10)
      setAnnouncements(announcementsData?.data || [])
    } catch (err) {
      console.error('Error creating announcement:', err)
      alert('เกิดข้อผิดพลาดในการสร้างประกาศ')
    } finally {
      setCreateAnnouncementModal({
        ...createAnnouncementModal,
        submitting: false,
      })
    }
  }

  return (
    <div className="w-full bg-[#020617] text-gray-100 px-4 py-4">
      <div className="w-full flex flex-col gap-5">
        
        {/* ===== WELCOME GREETING ===== */}
        <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-r from-violet-600/20 to-indigo-600/20 p-4">
          <p className="text-sm text-gray-200">
            สวัสดี{user?.fullname ? `, ${user.fullname}` : ''} 👋
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {user?.role === 'student' 
              ? 'ยินดีต้อนรับกลับมายังพอร์ทัลนักศึกษา' 
              : user?.role === 'teacher'
              ? 'ยินดีต้อนรับกลับมายังพอร์ทัลอาจารย์'
              : 'ยินดีต้อนรับกลับมายังพอร์ทัลระบบ'}
          </p>
        </div>

        {/* ===== QUICK STATUS / TODAY'S SCHEDULE ===== */}
        {user?.role === 'student' && (
          <div className="grid gap-3 md:grid-cols-3">
            {/* Classes Today */}
            <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-violet-400" />
                <h3 className="text-xs font-semibold">ชั้นเรียนวันนี้</h3>
              </div>
              <p className="text-2xl font-bold text-gray-100">{classes.length || 0}</p>
              <p className="text-[11px] text-gray-500">รายวิชาที่เรียน</p>
            </div>

            {/* Attendance */}
            <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-emerald-400" />
                <h3 className="text-xs font-semibold">การเช็คชื่อ</h3>
              </div>
              <p className="text-2xl font-bold text-gray-100">89%</p>
              <p className="text-[11px] text-gray-500">อัตราการเข้าเรียน</p>
            </div>

            {/* Assignments */}
            <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-amber-400" />
                <h3 className="text-xs font-semibold">งานที่มอบหมาย</h3>
              </div>
              <p className="text-2xl font-bold text-gray-100">3</p>
              <p className="text-[11px] text-gray-500">งานที่ยังไม่ส่ง</p>
            </div>
          </div>
        )}

        {/* ===== HERO + SLIDER / MAP ===== */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Hero Left */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] lg:col-span-2">
            {/* BG SVG light effects */}
            <svg
              className="absolute -right-24 -top-24 w-[420px] h-[420px] opacity-40"
              viewBox="0 0 600 600"
              fill="none"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d="M300,100 C430,110 520,200 520,300 C520,400 430,490 300,500 C170,490 80,400 80,300 C80,200 170,110 300,100 Z"
                  transform={`scale(${1 + i * 0.08}) translate(${-(i * 24)}, ${
                    -(i * 24)
                  })`}
                  stroke="#6366F1"
                  strokeOpacity={0.5 - i * 0.08}
                  strokeWidth="1.2"
                />
              ))}
            </svg>

            <div className="relative z-10 px-6 py-6 md:px-8 md:py-8 space-y-5">
              <div>
                <p className="uppercase tracking-widest text-violet-300 text-[10px] mb-1">
                  Kalasin Vocational College
                </p>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  KVC Portal{' '}
                  <span className="text-violet-400">Student &amp; Staff Hub</span>
                </h1>
                <p className="mt-2 text-sm text-gray-300 max-w-xl">
                  ศูนย์กลางข่าวสาร ตารางเรียน การลา งานที่มอบหมาย และชุมชนออนไลน์
                  สำหรับนักศึกษาและอาจารย์ในที่เดียว
                </p>
              </div>

              {/* Search */}
              <form
                className="mt-3"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <div className="relative max-w-xl">
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    className="w-full bg-[#020617] border border-[#1f2937] rounded-full pl-10 pr-28 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="ค้นหาหลักสูตร / ข่าวสาร / กิจกรรม"
                  />
                  <button className="absolute right-1 top-1 bg-violet-600 hover:bg-violet-500 border border-violet-500 text-white px-4 py-1.5 rounded-full text-xs font-medium">
                    ค้นหา
                  </button>
                </div>
              </form>

              {/* CTA */}
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="/register"
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-full text-xs font-medium border border-violet-500"
                >
                  สมัครบริการนักศึกษา
                </a>
                <a
                  href="/announcements"
                  className="px-4 py-2 rounded-full border border-gray-600 text-xs text-gray-100 hover:bg-gray-800 flex items-center gap-1"
                >
                  ดูข่าวประกาศทั้งหมด <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* ขวา: ข่าวเด่น + แผนที่ */}
          <div className="flex flex-col gap-3">
            {/* Slider Card - Mock removed, will integrate real news API */}
            <div className="w-full rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-100">
                  ข่าวเด่นวันนี้
                </h2>
                <span className="text-[11px] text-gray-400">
                  Coming soon - API integration needed
                </span>
              </div>

              <div className="mt-1 h-28 md:h-32 rounded-xl border border-[#111827] bg-[#020617] flex items-center justify-center">
                <p className="text-[11px] text-gray-500">
                  ข่าวประกาศจะแสดงที่นี่เมื่อเชื่อมต่อกับระบบข่าว
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* ===== IMPORTANT ALERTS ===== */}
        {user?.role === 'student' && (
          <div className="rounded-2xl border border-amber-600/50 bg-amber-600/10 p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-200">การลาจากการเรียน</p>
              <p className="text-xs text-amber-100 mt-1">
                คุณมีใบลาที่ยังไม่ได้รับอนุมัติ 1 ใบ - <a href="/leaves" className="underline hover:no-underline">ดูรายละเอียด</a>
              </p>
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT: FEED + SIDEBAR ===== */}
        <div className="grid gap-4 lg:grid-cols-[2fr,1.15fr]">
          {/* FEED */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-100">
                ฟีดข่าวสาร &amp; ประกาศล่าสุด
              </h2>
              <div className="flex items-center gap-2">
                {user?.role === 'teacher' && (
                  <button
                    onClick={() => setCreateAnnouncementModal({ ...createAnnouncementModal, open: true })}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white"
                  >
                    <Plus size={12} />
                    โพส์ประกาศ
                  </button>
                )}
                <a
                  href="/announcements"
                  className="text-[11px] text-gray-400 hover:text-violet-300 flex items-center gap-1"
                >
                  ดูทั้งหมด <ChevronRight size={12} />
                </a>
              </div>
            </div>

            {/* Announcements Feed */}
            <div className="space-y-2">
              {announcements.length === 0 ? (
                <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-center">
                  <p className="text-[11px] text-gray-500">ยังไม่มีประกาศข่าวสาร</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 hover:border-[#374151] transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/50 text-[10px] text-violet-200 mb-1">
                          {announcement.category}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-100">
                          {announcement.title}
                        </h3>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          โดย {announcement.author?.fullname || announcement.author?.username}
                          {' • '}
                          {new Date(announcement.createdAt).toLocaleDateString('th-TH', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-gray-200 leading-relaxed mb-2">
                      {announcement.excerpt || announcement.content}
                    </p>

                    {/* Image if exists */}
                    {announcement.image && (
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-32 object-cover rounded-lg border border-[#111827] mb-2"
                      />
                    )}

                    {/* Class Info */}
                    <div className="text-[10px] text-gray-400">
                      {announcement.class?.code} - {announcement.class?.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-3">
            {/* Quick Stats & Menu */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">
                ลิงก์ด่วน
              </h3>
              <div className="space-y-2">
                <a href="/classes" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-[#1f2937]">
                  <span className="text-[11px] text-gray-300">📚 ห้องเรียน & รายวิชา</span>
                  <ChevronRight size={12} className="text-gray-500" />
                </a>
                <a href="/meetings" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-[#1f2937]">
                  <span className="text-[11px] text-gray-300">📹 ห้องประชุม / บรรยายเสริม</span>
                  <ChevronRight size={12} className="text-gray-500" />
                </a>
                <a href="/assignments" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-[#1f2937]">
                  <span className="text-[11px] text-gray-300">✏️ งานที่มอบหมาย</span>
                  <ChevronRight size={12} className="text-gray-500" />
                </a>
                <a href="/leaves" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-[#1f2937]">
                  <span className="text-[11px] text-gray-300">🏥 การลา / ลาป่วย</span>
                  <ChevronRight size={12} className="text-gray-500" />
                </a>
                <a href="/checkline" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-[#1f2937]">
                  <span className="text-[11px] text-gray-300">✅ เช็คชื่อ / ปฏิทิน</span>
                  <ChevronRight size={12} className="text-gray-500" />
                </a>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-2">
                ตารางเรียนใกล้ที่สุด
              </h3>
              {classes.length === 0 ? (
                <p className="text-[11px] text-gray-500">ไม่มีรายวิชาในวันนี้</p>
              ) : (
                <div className="space-y-2">
                  {classes.slice(0, 3).map((cls, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg border border-[#111827] bg-[#020617]">
                      <div className="w-10 h-10 rounded bg-violet-600/20 flex items-center justify-center text-[11px] font-semibold text-violet-300">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-200 truncate">{cls.code}</div>
                        <div className="text-[10px] text-gray-500">{cls.name}</div>
                      </div>
                    </div>
                  ))}
                  {classes.length > 3 && (
                    <a href="/classes" className="text-[11px] text-violet-300 hover:text-violet-200 flex items-center gap-1">
                      ดูตารางเรียนทั้งหมด <ChevronRight size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* About */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <h3 className="text-sm font-semibold text-gray-100 mb-1">
                เกี่ยวกับวิทยาลัยอาชีวศึกษากาฬสินธุรกิจาฬสินธุ์
              </h3>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                วิทยาลัยอาชีวศึกษากาฬสินธุ์ (KVC) มุ่งเน้นการสร้างบุคลากรสายอาชีพ
                ที่พร้อมสู่ตลาดแรงงานและการศึกษาต่อ
                ผ่านหลักสูตรที่ทันสมัยและการเรียนรู้ผ่านสถานการณ์จริงร่วมกับสถานประกอบการ
              </p>
              <ul className="mt-2 text-[11px] text-gray-400 space-y-1 list-disc pl-4">
                <li>สาขาวิชาครอบคลุมทั้งสายเทคโนโลยีและสายบริหารธุรกิจ</li>
                <li>เน้น Project-based Learning และความร่วมมือกับภาคอุตสาหกรรม</li>
                <li>สนับสนุนกิจกรรมชมรมและชุมชนการเรียนรู้ออนไลน์</li>
              </ul>
            </div>


          </aside>
        </div>
      </div>

      {/* ===== SHARE POPUP ===== */}
      {shareModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-xl bg-[#020617] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
              <div className="text-xs">
                <div className="text-sm font-semibold text-gray-100">
                  แชร์โพสต์
                </div>
                <div className="text-[11px] text-gray-400 line-clamp-1">
                  {shareModal.post?.title}
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-slate-800"
                onClick={() => setShareModal((s) => ({ ...s, open: false }))}
              >
                <X size={16} className="text-gray-300" />
              </button>
            </div>

            {/* tabs */}
            <div className="px-4 pt-3 text-[11px] flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-full border ${
                  shareModal.tab === 'user'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
                onClick={() =>
                  setShareModal((s) => ({ ...s, tab: 'user' }))
                }
              >
                แชร์ให้ผู้ใช้
              </button>
              <button
                className={`px-3 py-1.5 rounded-full border ${
                  shareModal.tab === 'group'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
                onClick={() =>
                  setShareModal((s) => ({ ...s, tab: 'group' }))
                }
              >
                แชร์ให้กลุ่ม
              </button>
              <button
                className={`px-3 py-1.5 rounded-full border ${
                  shareModal.tab === 'link'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'border-[#374151] text-gray-300 hover:bg-slate-800'
                }`}
                onClick={() =>
                  setShareModal((s) => ({ ...s, tab: 'link' }))
                }
              >
                ลิงก์ & แพลตฟอร์ม
              </button>
            </div>

            {/* body */}
            <div className="p-4 text-xs max-h-[60vh] overflow-y-auto">
              {shareModal.tab === 'user' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-gray-400">
                    Share feature coming soon - API integration needed
                  </div>
                </div>
              )}

              {shareModal.tab === 'group' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-gray-400">
                    Share feature coming soon - API integration needed
                  </div>
                </div>
              )}

              {shareModal.tab === 'link' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-gray-400 mb-1">
                    คัดลอกลิงก์หรือแชร์ไปยังแพลตฟอร์มอื่น
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-[#020617] border border-[#374151] flex-1 overflow-hidden">
                      <Link2 size={13} className="text-gray-500 shrink-0" />
                      <span className="text-[10px] text-gray-400 truncate">
                        {shareModal.url || '-'}
                      </span>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-md border border-violet-500 text-violet-200 hover:bg-violet-600/20 text-[11px] flex items-center gap-1"
                      onClick={handleCopyLink}
                    >
                      <Copy size={12} />
                      คัดลอก
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-400 mb-1">
                    แชร์ผ่าน Native share / แพลตฟอร์มอื่น (ตัวอย่าง)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-800 text-[11px] flex items-center gap-1"
                      onClick={handleNativeShare}
                    >
                      <Share2 size={12} />
                      Native Share
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-800 text-[11px]"
                      onClick={() =>
                        alert('TODO: Implement Line / Messenger sharing')
                      }
                    >
                      Line / Messenger
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-800 text-[11px]"
                      onClick={() =>
                        alert('TODO: Implement Facebook / IG sharing')
                      }
                    >
                      Facebook / IG
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-2">
                    * เมื่อเชื่อมต่อ Backend จริง สามารถบันทึก log การแชร์,
                    ส่ง notification ให้ผู้รับ และเชื่อมกับ API
                    ของแต่ละแพลตฟอร์มได้
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE ANNOUNCEMENT MODAL ===== */}
      {createAnnouncementModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl bg-[#020617] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-sm font-semibold text-gray-100">สร้างประกาศข่าวสาร</h2>
              <button
                onClick={() =>
                  setCreateAnnouncementModal({
                    ...createAnnouncementModal,
                    open: false,
                  })
                }
                className="p-1 hover:bg-slate-800 rounded-lg"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateAnnouncement} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Class Selection */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">เลือกห้องเรียน *</label>
                <select
                  value={createAnnouncementModal.selectedClassId}
                  onChange={(e) =>
                    setCreateAnnouncementModal({
                      ...createAnnouncementModal,
                      selectedClassId: e.target.value,
                    })
                  }
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">-- เลือกห้องเรียน --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">หมวดหมู่</label>
                <select
                  value={createAnnouncementModal.formData.category}
                  onChange={(e) =>
                    setCreateAnnouncementModal({
                      ...createAnnouncementModal,
                      formData: {
                        ...createAnnouncementModal.formData,
                        category: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="ประกาศ">ประกาศ</option>
                  <option value="ข่าวกิจกรรม">ข่าวกิจกรรม</option>
                  <option value="ชุมชน & ชมรม">ชุมชน & ชมรม</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">หัวข้อ *</label>
                <input
                  type="text"
                  value={createAnnouncementModal.formData.title}
                  onChange={(e) =>
                    setCreateAnnouncementModal({
                      ...createAnnouncementModal,
                      formData: {
                        ...createAnnouncementModal.formData,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="กรอกหัวข้อประกาศ"
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">เนื้อหา *</label>
                <textarea
                  rows={6}
                  value={createAnnouncementModal.formData.content}
                  onChange={(e) =>
                    setCreateAnnouncementModal({
                      ...createAnnouncementModal,
                      formData: {
                        ...createAnnouncementModal.formData,
                        content: e.target.value,
                      },
                    })
                  }
                  placeholder="กรอกเนื้อหาประกาศ"
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Image Preview */}
              {createAnnouncementModal.formData.imagePreview && (
                <div className="relative rounded-lg overflow-hidden bg-[#1f2937] p-2">
                  <img 
                    src={createAnnouncementModal.formData.imagePreview} 
                    alt="preview" 
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCreateAnnouncementModal({
                        ...createAnnouncementModal,
                        formData: {
                          ...createAnnouncementModal.formData,
                          image: null,
                          imagePreview: null,
                        },
                      })
                    }
                    className="absolute top-3 right-3 p-1 bg-red-600 hover:bg-red-500 rounded-md"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">รูปภาพ (ไม่บังคับ)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setCreateAnnouncementModal({
                          ...createAnnouncementModal,
                          formData: {
                            ...createAnnouncementModal.formData,
                            image: file,
                            imagePreview: reader.result,
                          },
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 file:bg-violet-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:text-[10px] file:cursor-pointer hover:border-[#4b5563]"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center gap-2 p-4 border-t border-[#1f2937]">
              <button
                onClick={() =>
                  setCreateAnnouncementModal({
                    ...createAnnouncementModal,
                    open: false,
                  })
                }
                className="px-3 py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-800 text-[11px]"
                disabled={createAnnouncementModal.submitting}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={createAnnouncementModal.submitting}
                className="ml-auto px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[11px] font-medium"
              >
                {createAnnouncementModal.submitting ? 'กำลังสร้าง...' : 'สร้างประกาศ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
