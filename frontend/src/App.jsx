// frontend/src/App.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import {
  Menu,
  Search,
  LogIn,
  Home,
  MessageSquare,
  GraduationCap,
  Calendar,
  User,
  Sun,
  Moon,
  Globe2,
  X,
} from 'lucide-react'

// import AssistantWidget from './components/AssistantWidget' // TODO: Re-enable when needed
import { useAuth } from './context/AuthContext'
import Preloader from './components/Preloader.jsx'
import { useTheme } from './components/ThemeProvider'
import { useI18n } from './context/I18nContext'

// ❌ ลบ: import App from './App'  (import ตัวเอง → error)
// import App from './App'

const LANG_OPTIONS = [
  { value: 'th', label: 'Thai (TH)', short: 'TH' },
  { value: 'en', label: 'English (EN)', short: 'EN' },
  { value: 'zh', label: '中文 (CN)', short: '中文' },
]

const SEARCH_ITEMS = [
  { key: 'home', path: '/', keywords: { th: ['หน้าแรก'], en: ['home'], zh: ['主页'] } },
  { key: 'dashboard', path: '/dashboard', keywords: { th: ['ภาพรวม', 'สรุป'], en: ['dashboard'], zh: ['仪表盘'] } },
  { key: 'chat', path: '/chat', keywords: { th: ['แชท', 'สนทนา'], en: ['chat'], zh: ['聊天'] } },
  { key: 'class', path: '/class', keywords: { th: ['ห้องเรียน', 'คลาส'], en: ['class'], zh: ['班级'] } },
  { key: 'meeting', path: '/meeting', keywords: { th: ['ประชุม'], en: ['meeting'], zh: ['会议'] } },
  { key: 'checkline', path: '/checkline', keywords: { th: ['เช็คชื่อ', 'เช็คอิน'], en: ['checkline', 'attendance'], zh: ['考勤'] } },
  { key: 'profile', path: '/profile', keywords: { th: ['โปรไฟล์', 'บัญชี'], en: ['profile', 'account'], zh: ['个人资料'] } },
  { key: 'announcements', path: '/announcements', keywords: { th: ['ประกาศ', 'ข่าวสาร'], en: ['announcements'], zh: ['公告'] } },
  { key: 'assignment', path: '/assignment', keywords: { th: ['งาน', 'การบ้าน'], en: ['assignment', 'homework'], zh: ['作业'] } },
  { key: 'grades', path: '/grades', keywords: { th: ['เกรด', 'ผลการเรียน'], en: ['grades', 'transcript'], zh: ['成绩', '成绩单'] } },
  { key: 'exam', path: '/exam', keywords: { th: ['สอบ', 'ตารางสอบ'], en: ['exam'], zh: ['考试'] } },
  { key: 'schedule', path: '/schedule', keywords: { th: ['ตารางเรียน'], en: ['schedule'], zh: ['课程表'] } },
  { key: 'resources', path: '/resources', keywords: { th: ['เอกสาร', 'ไฟล์'], en: ['resources', 'materials'], zh: ['资料'] } },
  { key: 'advisor', path: '/advisor', keywords: { th: ['อาจารย์ที่ปรึกษา'], en: ['advisor'], zh: ['导师'] } },
  { key: 'register', path: '/register', keywords: { th: ['บริการนักศึกษา', 'ลงทะเบียน'], en: ['register', 'services'], zh: ['学生服务'] } },
  { key: 'clubs', path: '/clubs', keywords: { th: ['ชมรม', 'กิจกรรม'], en: ['clubs', 'activities'], zh: ['社团'] } },
  { key: 'settings', path: '/settings', keywords: { th: ['ตั้งค่า'], en: ['settings'], zh: ['设置'] } },
  { key: 'organization', path: '/organization', keywords: { th: ['โครงสร้าง', 'ผู้บริหาร'], en: ['organization'], zh: ['组织'] } },
]

// ------------------------------------------------
// COMPONENT NAV ITEM
// ------------------------------------------------
function NavItem({ to, icon: Icon, label, badge, onClick }) {
  const loc = useLocation()
  const active = loc.pathname === to
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <Link
      to={to}
      onClick={onClick}
      data-testid="nav-item"
      className={`relative flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-[12px] sm:text-[13px] tracking-tight transition
        ${active
          ? isLight
            ? 'border-violet-400/60 bg-violet-50 text-slate-900 shadow-[0_8px_30px_-16px_rgba(139,92,246,0.35)]'
            : 'border-violet-400/60 bg-white/10 text-gray-100 shadow-[0_8px_30px_-16px_rgba(139,92,246,0.6)]'
          : isLight
            ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:border-white/10'}`}
    >
      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition ${active
        ? isLight
          ? 'bg-violet-100 text-violet-700'
          : 'bg-violet-500/20 text-violet-200'
        : isLight
          ? 'bg-slate-100 text-slate-600'
          : 'bg-white/5 text-gray-300'}`}>
        <Icon size={16} />
      </span>
      <span className="text-xs sm:text-sm">{label}</span>

      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}

// ------------------------------------------------
// COMPONENT APP (ตัวจริงที่ต้อง export)
// ------------------------------------------------
export default function App() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()
  const isChatPage = location.pathname === '/chat'
  const isLight = theme === 'light'

  // Preloader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const userId = user?.id || 'guest'
  const roomName = user ? `room-${user.username}` : 'guest-room'
  const avatarLetter = (user?.username || 'U').charAt(0).toUpperCase()
  const avatarUrl = user?.avatarUrl || user?.photoURL || null
  const searchItems = useMemo(
    () =>
      SEARCH_ITEMS.map((item) => ({
        label: t(`nav.${item.key}`),
        path: item.path,
        keywords: item.keywords?.[language] || item.keywords?.en || [],
      })),
    [language],
  )
  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return searchItems.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true
      return item.keywords.some((k) => k.toLowerCase().includes(q))
    }).slice(0, 8)
  }, [searchItems, searchQuery])

  const handleSearchNavigate = (item) => {
    if (!item) return
    navigate(item.path)
    setSearchQuery('')
    setSearchOpen(false)
  }
  const themeValue = theme === 'system' ? 'dark' : theme
  const handleToggleTheme = () => {
    setTheme(themeValue === 'dark' ? 'light' : 'dark')
  }
  const handleCycleLanguage = () => {
    const currentIndex = LANG_OPTIONS.findIndex((opt) => opt.value === language)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % LANG_OPTIONS.length
    setLanguage(LANG_OPTIONS[nextIndex].value)
  }

  if (loading) return <Preloader />

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#020617] text-gray-100'}`}>

      {/* ============ TOPBAR ============ */}
      <header className={`shrink-0 border-b ${isLight ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/10'}`}>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1400px] flex flex-wrap items-center gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <button
              className={`p-2 rounded-xl border transition ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
              onClick={() => setOpen(true)}
              data-testid="sidebar-toggle"
            >
              <Menu className={isLight ? 'text-slate-800' : 'text-gray-200'} />
            </button>

            <Link to="/" className={`flex items-center gap-2 font-semibold tracking-wide ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
              <div className={`w-9 h-9 rounded-xl overflow-hidden border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/5'}`}>
                <img src="/kvc-logo.png" alt="KVC logo" className="w-full h-full object-contain scale-150" />
              </div>
              <span className={`hidden sm:inline text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Kalasin Vocational College</span>
            </Link>

            <div className="ml-auto flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <div className="relative w-full sm:w-auto order-3 sm:order-none">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  className={`w-full sm:w-[220px] md:w-[260px] lg:w-[320px] text-xs sm:text-sm pl-9 pr-3 py-2 rounded-full focus:outline-none focus:border-violet-400/50 transition ${isLight ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400' : 'bg-white/5 border-white/10 text-gray-100 placeholder-slate-400'}`}
                  placeholder={t('common.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setActiveIndex(0)
                    setSearchOpen(true)
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (!filteredSearchItems.length) return
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setActiveIndex((prev) => Math.min(prev + 1, filteredSearchItems.length - 1))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setActiveIndex((prev) => Math.max(prev - 1, 0))
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      const item = filteredSearchItems[activeIndex] || filteredSearchItems[0]
                      handleSearchNavigate(item)
                    }
                  }}
                />
                {searchOpen && filteredSearchItems.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-50 shadow-[0_24px_70px_-60px_rgba(0,0,0,0.4)] ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0b1220]'}`}>
                    {filteredSearchItems.map((item, index) => (
                      <button
                        key={item.path}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSearchNavigate(item)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${index === activeIndex ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white') : isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-gray-300 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{item.path}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 order-2 sm:order-none">
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/5'}`}>
                    <Globe2 size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                    <select
                      className={`text-xs bg-transparent focus:outline-none ${isLight ? 'text-slate-700' : 'text-gray-200'}`}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {LANG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/5'}`}>
                    {themeValue === 'dark' ? (
                      <Moon size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                    ) : (
                      <Sun size={14} className={isLight ? 'text-slate-600' : 'text-slate-300'} />
                    )}
                    <select
                      className={`text-xs bg-transparent focus:outline-none ${isLight ? 'text-slate-700' : 'text-gray-200'}`}
                      value={themeValue}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="dark">{t('common.dark')}</option>
                      <option value="light">{t('common.light')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex sm:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCycleLanguage}
                    className={`px-2.5 py-1.5 rounded-full text-xs border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/5 text-gray-200'}`}
                  >
                    {LANG_OPTIONS.find((opt) => opt.value === language)?.short || 'TH'}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleTheme}
                    className={`p-2 rounded-full border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/5 text-gray-200'}`}
                  >
                    {themeValue === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  </button>
                </div>
              </div>

              {user ? (
                <Link to="/profile" className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] ${isLight ? 'border-slate-200 bg-white hover:bg-slate-100 hover:border-violet-300' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-400/40'}`}>
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-violet-500/40 via-sky-400/30 to-transparent blur-sm" />
                    <div className={`relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border ${isLight ? 'bg-white text-slate-700 border-slate-200' : 'bg-[#111827] text-white border-white/10'}`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>{user.fullname || user.username}</span>
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>@{user.username}</span>
                  </div>
                </Link>
              ) : (
                <Link to="/login" className={`px-3 py-2 rounded-full border flex items-center gap-2 text-sm transition ${isLight ? 'border-slate-200 hover:bg-slate-100' : 'border-white/10 hover:bg-white/10'}`}>
                  <LogIn size={18} />
                  <span className="hidden sm:block">{t('common.login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============ SIDEBAR ============ */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 backdrop-blur-xl shadow-[0_30px_80px_-60px_rgba(0,0,0,0.5)] z-50 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isLight ? 'bg-white/90 border-r border-slate-200' : 'bg-[#0b1220]/90 border-r border-white/10'}`}
        data-testid="sidebar"
      >
        <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <span className={`text-xs uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('nav.title')}</span>
          <button className={`p-2 rounded-xl border transition ${isLight ? 'border-slate-200 bg-slate-100 hover:bg-slate-200' : 'border-white/10 bg-white/5 hover:bg-white/10'}`} onClick={() => setOpen(false)}>
            <X className={isLight ? 'text-slate-700' : 'text-gray-200'} />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2 text-sm overflow-y-auto flex-1 min-h-0">
          <div className={`md:hidden pb-3 mb-3 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <div className={`text-[10px] tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>เมนูหลัก</div>
            <div className="mt-2 flex flex-col gap-2">
              <NavItem to="/" icon={Home} label={t('nav.home')} />
              <NavItem to="/chat" icon={MessageSquare} label={t('nav.chat')} />
              <NavItem to="/class" icon={GraduationCap} label={t('nav.class')} />
              <NavItem to="/meeting" icon={Calendar} label={t('nav.meeting')} />
              <NavItem to="/checkline" icon={Calendar} label={t('nav.checkline')} />
              <NavItem to="/profile" icon={User} label={t('nav.profile')} />
            </div>
          </div>
          <NavItem to="/dashboard" icon={Home} label={t('nav.dashboard')} />
          <NavItem to="/announcements" icon={MessageSquare} label={t('nav.announcements')} />
          <NavItem to="/assignment" icon={MessageSquare} label={t('nav.assignment')} />
          <NavItem to="/grades" icon={GraduationCap} label={t('nav.grades')} />
          <NavItem to="/exam" icon={Calendar} label={t('nav.exam')} />
          <NavItem to="/schedule" icon={Calendar} label={t('nav.schedule')} />
          <NavItem to="/resources" icon={MessageSquare} label={t('nav.resources')} />
          <NavItem to="/advisor" icon={User} label={t('nav.advisor')} />
          <NavItem to="/register" icon={MessageSquare} label={t('nav.register')} />
          <NavItem to="/clubs" icon={MessageSquare} label={t('nav.clubs')} />
          <NavItem to="/settings" icon={MessageSquare} label={t('nav.settings')} />
          <NavItem to="/organization" icon={MessageSquare} label={t('nav.organization')} />
        </nav>
      </aside>

      {/* ============ PRIMARY NAV ============ */}
      <div className={`hidden md:block w-full border-b shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/10'}`}>
        <div className="w-full flex justify-center overflow-x-auto">
          <div className="w-full max-w-[1400px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3" data-testid="main-nav">
            <div className={`flex flex-wrap justify-center md:justify-start gap-2 sm:gap-2.5 md:gap-3 rounded-2xl md:rounded-none border md:border-0 backdrop-blur-xl md:backdrop-blur-0 px-3 py-2 md:px-0 md:py-0 shadow-[0_24px_70px_-60px_rgba(0,0,0,0.35)] md:shadow-none ${isLight ? 'border-slate-200 bg-white md:bg-transparent' : 'border-white/10 bg-[#0b1220]/70 md:bg-transparent'}`}>
              <NavItem to="/" icon={Home} label={t('nav.home')} />
              <NavItem to="/chat" icon={MessageSquare} label={t('nav.chat')} />
              <NavItem to="/class" icon={GraduationCap} label={t('nav.class')} />
              <NavItem to="/meeting" icon={Calendar} label={t('nav.meeting')} />
              <NavItem to="/checkline" icon={Calendar} label={t('nav.checkline')} />
              <NavItem to="/profile" icon={User} label={t('nav.profile')} />
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex flex-1 min-h-0 w-full justify-center overflow-y-auto">
        <div className={`w-full max-w-[1400px] flex flex-1 min-h-0 overflow-auto ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
          <AppRoutes />
        </div>
      </main>

      {/* TODO: Re-enable KVC Assistant widget when ready */}
      {/* <AssistantWidget userId={userId} roomName={roomName} /> */}
    </div>
  )
}
