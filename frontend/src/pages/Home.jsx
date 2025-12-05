// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { classApi } from '../api/classApi'
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
} from 'lucide-react'
import Slider from 'react-slick'
import CampusMap from '../components/CampusMap'

// สไลด์ภาพ Highlight (สามารถต่อ API ภายหลังได้)
const slides = [
  {
    id: 1,
    img: '/images/news1.jpg',
    title: 'โครงการปฐมนิเทศนักศึกษาใหม่',
    desc: 'ต้อนรับนักศึกษาใหม่ ประจำปีการศึกษา 2568',
  },
  {
    id: 2,
    img: '/images/news2.jpg',
    title: 'การแข่งขันทักษะวิชาชีพ',
    desc: 'นักศึกษาคว้ารางวัลระดับประเทศ',
  },
  {
    id: 3,
    img: '/images/news3.jpg',
    title: 'กิจกรรมเปิดโลกวิชาการ',
    desc: 'แนะนำหลักสูตรและอาชีพในอนาคต',
  },
]

// Feed ข่าว/โพสต์จากแอดมิน (mock)
const posts = [
  {
    id: 1,
    category: 'ประกาศ',
    title: 'กำหนดการปฐมนิเทศนักศึกษาใหม่ 2568',
    excerpt:
      'ขอเชิญนักศึกษาใหม่ทุกสาขาเข้าร่วมปฐมนิเทศ ในวันที่ 10 มิ.ย. 2568 เวลา 08.30 น. ณ หอประชุมใหญ่ของวิทยาลัย …',
    image: '/images/news1.jpg',
    time: 'วันนี้ · 09:30 น.',
    reactions: 24,
    comments: 6,
  },
  {
    id: 2,
    category: 'ข่าวกิจกรรม',
    title: 'ผลการแข่งขันทักษะวิชาชีพ ระดับชาติ',
    excerpt:
      'ทีมนักศึกษาแผนกเทคโนโลยีสารสนเทศ คว้ารางวัลชนะเลิศจากการแข่งขันพัฒนาเว็บแอปพลิเคชัน ระดับชาติ ประจำปี 2568 …',
    image: '/images/news2.jpg',
    time: 'เมื่อวานนี้ · 15:10 น.',
    reactions: 42,
    comments: 12,
  },
  {
    id: 3,
    category: 'ชุมชน & ชมรม',
    title: 'รับสมัครสมาชิกชมรมใหม่ ภาคเรียนที่ 1/2568',
    excerpt:
      'เชิญชวนนักศึกษาทุกชั้นปีเข้าร่วมชมรมต่าง ๆ ของวิทยาลัย อาทิ ชมรม IT, ชมรมดนตรี, ชมรมจิตอาสา สมัครได้ผ่านระบบ Portal …',
    image: '',
    time: '2 วันที่แล้ว',
    reactions: 15,
    comments: 3,
  },
]

// mock รายชื่อ User / Group สำหรับแชร์ (รอเชื่อม API จริง)
const mockUsers = [
  { id: 'u1', name: 'Suchawadee S.', role: 'IT Student ปี 2' },
  { id: 'u2', name: 'Kritsada T.', role: 'อาจารย์แผนก IT' },
  { id: 'u3', name: 'Ratchanee W.', role: 'อาจารย์ที่ปรึกษา' },
]

const mockGroups = [
  { id: 'g1', name: 'CS-201 – Sec 2', members: 32 },
  { id: 'g2', name: 'ENG-101 – Sec 1', members: 28 },
  { id: 'g3', name: 'ชมรม IT Club', members: 45 },
]

// mock comment ต่อโพสต์ (ตัวอย่าง – รอเชื่อม API)
const mockComments = {
  1: [
    {
      id: 'c1',
      author: 'Suchawadee S.',
      role: 'IT Student ปี 2',
      content: 'ตื่นเต้นรอวันปฐมนิเทศเลยค่ะ 🎉',
      time: '5 นาทีที่แล้ว',
      pinned: true,
    },
    {
      id: 'c2',
      author: 'Kritsada T.',
      role: 'อาจารย์แผนก IT',
      content: 'อย่าลืมเตรียมเอกสารให้ครบตามที่แจ้งในประกาศนะครับ',
      time: '20 นาทีที่แล้ว',
      pinned: false,
    },
  ],
  2: [
    {
      id: 'c3',
      author: 'Ratchanee W.',
      role: 'อาจารย์ที่ปรึกษา',
      content: 'ภูมิใจในนักศึกษาทุกคนมากค่ะ ✨',
      time: 'เมื่อวานนี้',
      pinned: false,
    },
  ],
  3: [],
}

// หลักสูตรตัวอย่าง (โชว์ใน Sidebar)
const courses = [
  { id: 1, name: 'เทคโนโลยีสารสนเทศ' },
  { id: 2, name: 'ดิจิทัลมีเดีย' },
  { id: 3, name: 'วิศวกรรมซอฟต์แวร์' },
  { id: 4, name: 'ระบบเครือข่าย (ปวส.)' },
  { id: 5, name: 'โลจิสติกส์' },
  { id: 6, name: 'ธุรกิจค้าปลีก' },
]

export default function Home() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [feedState, setFeedState] = useState(() =>
    Object.fromEntries(
      posts.map((p) => [
        p.id,
        {
          liked: false,
          likes: p.reactions,
        },
      ]),
    ),
  )

  // state สำหรับ share popup
  const [shareModal, setShareModal] = useState({
    open: false,
    post: null,
    url: '',
    tab: 'user', // user | group | link
  })

  // state สำหรับ comment
  const [comments, setComments] = useState(mockComments)
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null)
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})

  // Load user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch classes
        if (user?.role === 'student') {
          const classesData = await classApi.getClasses()
          setClasses(classesData?.slice(0, 5) || [])
        }
        
        // TODO: Fetch upcoming meetings from meetings API
        // setUpcomingMeetings(...)
        
        // TODO: Fetch announcements from announcements API
        // setAnnouncements(...)
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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  const toggleLike = (id) => {
    setFeedState((prev) => {
      const current = prev[id]
      if (!current) return prev
      const liked = !current.liked
      return {
        ...prev,
        [id]: {
          liked,
          likes: current.likes + (liked ? 1 : -1),
        },
      }
    })
  }

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

  const handleShareToUser = (user) => {
    alert(`(จำลอง) แชร์โพสต์ให้ ${user.name} แล้ว`)
  }

  const handleShareToGroup = (group) => {
    alert(`(จำลอง) แชร์โพสต์ไปยังกลุ่ม "${group.name}" แล้ว`)
  }

  // ====== Comment handlers ======
  const handleToggleComments = (postId) => {
    setOpenCommentsPostId((prev) => (prev === postId ? null : postId))
  }

  const handleToggleExpandComments = (postId) => {
    setExpandedCommentsPostId((prev) => (prev === postId ? null : postId))
  }

  const handlePinComment = (postId, commentId) => {
    setComments((prev) => {
      const list = prev[postId] || []
      const target = list.find((c) => c.id === commentId && c.pinned)
      let next
      if (target) {
        // unpin ทั้งหมด
        next = list.map((c) => ({ ...c, pinned: false }))
      } else {
        // pin อันเดียว
        next = list.map((c) => ({ ...c, pinned: c.id === commentId }))
      }
      return { ...prev, [postId]: next }
    })
  }

  const handleDraftChange = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }))
  }

  const handleQuickMention = (postId, userName) => {
    setCommentDrafts((prev) => {
      const base = prev[postId] || ''
      const space = base && !base.endsWith(' ') ? ' ' : ''
      return { ...prev, [postId]: `${base}${space}@${userName} ` }
    })
  }

  const handleAddComment = (postId) => {
    const text = (commentDrafts[postId] || '').trim()
    if (!text) return
    setComments((prev) => {
      const list = prev[postId] || []
      const newComment = {
        id: `new-${Date.now()}`,
        author: 'คุณ',
        role: 'Student',
        content: text,
        time: 'เมื่อสักครู่',
        pinned: false,
      }
      return { ...prev, [postId]: [...list, newComment] }
    })
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
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
            {/* Slider Card */}
            <div className="w-full rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-100">
                  ข่าวเด่นวันนี้
                </h2>
                <span className="text-[11px] text-gray-400">
                  ข้อมูลตัวอย่าง · พร้อมต่อ API
                </span>
              </div>

              <div className="mt-1 h-28 md:h-32">
                <Slider {...sliderSettings}>
                  {slides.map((s) => (
                    <div key={s.id} className="px-1">
                      <div className="flex h-24 md:h-28 overflow-hidden rounded-xl border border-[#111827] bg-[#020617]">
                        {/* รูป: 40% */}
                        <div className="w-2/5">
                          <img
                            src={s.img}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* ข้อความ: 60% */}
                        <div className="w-3/5 p-2.5 flex flex-col justify-between">
                          <div>
                            <h3 className="text-[12px] font-semibold text-gray-100 line-clamp-2">
                              {s.title}
                            </h3>
                            <p className="mt-1 text-[10px] text-gray-400 line-clamp-2">
                              {s.desc}
                            </p>
                          </div>
                          <a
                            href="/announcements"
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-violet-300 hover:text-violet-200"
                          >
                            อ่านเพิ่มเติม <ChevronRight size={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>

            {/* Quick Map / Campus Overview */}
            <div className="w-full rounded-2xl border border-[#1f2937] bg-[#020617] p-3">
              <h3 className="text-sm font-semibold text-gray-100 mb-2">
                แผนที่ / พื้นที่วิทยาลัย
              </h3>
              <div className="h-40 rounded-xl overflow-hidden border border-[#111827]">
                <CampusMap />
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
              <a
                href="/announcements"
                className="text-[11px] text-gray-400 hover:text-violet-300 flex items-center gap-1"
              >
                ดูทั้งหมด <ChevronRight size={12} />
              </a>
            </div>

            {posts.map((p) => {
              const state = feedState[p.id]
              const postComments = comments[p.id] || []
              const sortedComments = [...postComments].sort(
                (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0),
              )
              const expanded = expandedCommentsPostId === p.id
              const visibleComments = expanded
                ? sortedComments
                : sortedComments.slice(0, 3)

              return (
                <article
                  key={p.id}
                  id={`post-${p.id}`}
                  className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 flex flex-col gap-3"
                >
                  {/* header */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/50 text-[10px] text-violet-200 mb-1">
                        {p.category}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-100">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-gray-500">{p.time}</p>
                    </div>
                  </div>

                  {/* body */}
                  <div className="flex flex-col md:flex-row gap-3">
                    {p.image && (
                      <div className="w-full md:w-40 shrink-0">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-28 object-cover rounded-xl border border-[#111827]"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {p.excerpt}
                    </p>
                  </div>

                  {/* reactions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleLike(p.id)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-transparent hover:border-violet-500/60 hover:bg-violet-600/10"
                      >
                        <Heart
                          size={14}
                          className={
                            state?.liked ? 'text-pink-400 fill-pink-400' : ''
                          }
                        />
                        <span>{state?.likes ?? p.reactions}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-transparent hover:border-gray-600 hover:bg-gray-800/50"
                        onClick={() => handleToggleComments(p.id)}
                      >
                        <MessageCircle size={14} />
                        <span>
                          {postComments.length || p.comments} ความคิดเห็น
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => sharePost(p)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-gray-700 hover:border-violet-500 hover:bg-violet-600/10"
                    >
                      <Share2 size={13} />
                      แชร์
                    </button>
                  </div>

                  {/* ===== COMMENTS PANEL ===== */}
                  {openCommentsPostId === p.id && (
                    <div className="mt-2 rounded-2xl border border-[#1f2937] bg-[#020617] px-3 py-3 space-y-3">
                      {/* header ของ comment */}
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-gray-400">
                          ความคิดเห็น •{' '}
                          <span className="text-gray-200">
                            {postComments.length} รายการ
                          </span>
                        </div>
                        {postComments.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleToggleExpandComments(p.id)}
                            className="flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200"
                          >
                            {expanded
                              ? 'ย่อความคิดเห็น'
                              : 'ดูความคิดเห็นทั้งหมด'}
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* comment list */}
                      {postComments.length === 0 ? (
                        <p className="text-[11px] text-gray-500">
                          ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความเห็นได้เลย
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {visibleComments.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 flex gap-2"
                            >
                              <div className="w-7 h-7 rounded-full bg-violet-600/40 flex items-center justify-center text-[11px] font-semibold shrink-0">
                                {c.author.charAt(0)}
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-[11px] text-gray-100">
                                      {c.author}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      {c.role} · {c.time}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[9px] ${
                                      c.pinned
                                        ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                                        : 'border-transparent text-gray-500 hover:border-amber-400/60 hover:bg-amber-400/10'
                                    }`}
                                    onClick={() =>
                                      handlePinComment(p.id, c.id)
                                    }
                                  >
                                    <Pin
                                      size={11}
                                      className={
                                        c.pinned ? 'fill-amber-300' : ''
                                      }
                                    />
                                    {c.pinned ? 'Pinned' : 'Pin'}
                                  </button>
                                </div>
                                <div className="text-[11px] text-gray-200">
                                  {c.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* input comment */}
                      <div className="pt-2 border-t border-[#1f2937] space-y-2">
                        <div className="text-[11px] text-gray-400">
                          เขียนความคิดเห็นของคุณ
                        </div>
                        <textarea
                          rows={2}
                          className="w-full bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="เขียนความคิดเห็นของคุณ... ใช้ @mention เพื่อกล่าวถึงเพื่อน / อาจารย์"
                          value={commentDrafts[p.id] || ''}
                          onChange={(e) =>
                            handleDraftChange(p.id, e.target.value)
                          }
                        />
                        {/* quick mention chips */}
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="text-gray-500 mr-1">
                            @Mention:
                          </span>
                          {mockUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              className="px-2 py-0.5 rounded-full border border-[#374151] text-gray-300 hover:bg-slate-800"
                              onClick={() =>
                                handleQuickMention(p.id, u.name)
                              }
                            >
                              @{u.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-[11px] text-white"
                            onClick={() => handleAddComment(p.id)}
                          >
                            ส่งความคิดเห็น
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
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

            {/* Courses */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-100">
                  หลักสูตรเด่น
                </h3>
                <span className="text-[11px] text-gray-500">
                  ตัวอย่าง · ปรับจาก API ได้
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-300">
                {courses.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-[#111827] bg-[#020617] px-3 py-1.5 hover:border-violet-500/60 hover:bg-violet-600/5 transition"
                  >
                    <span>{c.name}</span>
                    <ChevronRight size={12} className="text-gray-500" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Campus Map (สำหรับจอเล็ก) */}
            <div className="md:hidden rounded-2xl border border-[#1f2937] bg-[#020617] p-3">
              <h3 className="text-sm font-semibold text-gray-100 mb-2">
                แผนที่ / พื้นที่วิทยาลัย
              </h3>
              <div className="h-40 rounded-xl overflow-hidden border border-[#111827]">
                <CampusMap />
              </div>
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
                  <div>
                    <div className="text-[11px] text-gray-400 mb-1">
                      เลือกผู้ใช้ที่ต้องการแชร์ให้
                    </div>
                    <div className="relative mb-2">
                      <Search
                        size={14}
                        className="absolute left-2 top-2 text-gray-500"
                      />
                      <input
                        className="w-full bg-[#020617] border border-[#374151] rounded-md pl-7 pr-2 py-1.5 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="ค้นหาชื่อผู้ใช้ (mock)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {mockUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-600/40 flex items-center justify-center text-[11px] font-semibold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-gray-100 text-[11px]">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {u.role}
                            </div>
                          </div>
                        </div>
                        <button
                          className="text-[11px] px-2 py-1 rounded-md border border-violet-500 text-violet-200 hover:bg-violet-600/20"
                          onClick={() => handleShareToUser(u)}
                        >
                          แชร์
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shareModal.tab === 'group' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-gray-400 mb-1">
                    เลือกกลุ่มที่ต้องการแชร์ให้
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {mockGroups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 mb-1"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600/30 flex items-center justify-center">
                            <Users size={13} />
                          </div>
                          <div>
                            <div className="text-gray-100 text-[11px]">
                              {g.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              สมาชิกประมาณ {g.members} คน
                            </div>
                          </div>
                        </div>
                        <button
                          className="text-[11px] px-2 py-1 rounded-md border border-emerald-500 text-emerald-200 hover:bg-emerald-600/20"
                          onClick={() => handleShareToGroup(g)}
                        >
                          แชร์ให้กลุ่ม
                        </button>
                      </div>
                    ))}
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
                        alert('(mock) แชร์ไปยัง Line / Messenger')
                      }
                    >
                      Line / Messenger
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border border-[#374151] text-gray-200 hover:bg-slate-800 text-[11px]"
                      onClick={() =>
                        alert('(mock) แชร์ไปยัง Facebook / IG')
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
    </div>
  )
}
