// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  X,
} from 'lucide-react'

// import AssistantWidget from './components/AssistantWidget' // TODO: Re-enable when needed
import { useAuth } from './context/AuthContext'
import Preloader from './components/Preloader.jsx'

// ❌ ลบ: import App from './App'  (import ตัวเอง → error)
// import App from './App'

// ------------------------------------------------
// COMPONENT NAV ITEM
// ------------------------------------------------
function NavItem({ to, icon: Icon, label, badge, onClick }) {
  const loc = useLocation()
  const active = loc.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      data-testid="nav-item"
      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] tracking-tight transition
        ${active ? 'border-violet-400/60 bg-white/10 text-gray-100 shadow-[0_8px_30px_-16px_rgba(139,92,246,0.6)]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:border-white/10'}`}
    >
      <span className={`w-7 h-7 rounded-full flex items-center justify-center transition ${active ? 'bg-violet-500/20 text-violet-200' : 'bg-white/5 text-gray-300'}`}>
        <Icon size={16} />
      </span>
      <span className="text-sm">{label}</span>

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

  const { user } = useAuth()
  const location = useLocation()
  const isChatPage = location.pathname === '/chat'

  // Preloader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Preloader />

  const userId = user?.id || 'guest'
  const roomName = user ? `room-${user.username}` : 'guest-room'
  const avatarLetter = (user?.username || 'U').charAt(0).toUpperCase()
  const avatarUrl = user?.avatarUrl || user?.photoURL || null

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-gray-100 overflow-hidden">

      {/* ============ TOPBAR ============ */}
      <header className="shrink-0 bg-[#020617] border-b border-white/10">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1400px] flex items-center gap-3 px-3 py-3">
            <button
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
              onClick={() => setOpen(true)}
              data-testid="sidebar-toggle"
            >
              <Menu className="text-gray-200" />
            </button>

            <Link to="/" className="flex items-center gap-2 text-violet-300 font-semibold tracking-wide">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <img src="/kvc-logo.png" alt="KVC logo" className="w-full h-full object-contain scale-150" />
              </div>
              <span className="hidden sm:inline text-sm text-gray-200">Kalasin Vocational College</span>
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  className="bg-white/5 border border-white/10 text-sm text-gray-100 pl-9 pr-3 py-2 rounded-full focus:outline-none focus:border-violet-400/50 transition"
                  placeholder="Search..."
                />
              </div>

              {user ? (
                <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-400/40 transition shadow-[0_16px_40px_-30px_rgba(15,23,42,0.9)]">
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-violet-500/40 via-sky-400/30 to-transparent blur-sm" />
                    <div className="relative w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center overflow-hidden border border-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-100">{user.fullname || user.username}</span>
                    <span className="text-[11px] text-gray-400">@{user.username}</span>
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="px-3 py-2 rounded-full border border-white/10 hover:bg-white/10 flex items-center gap-2 text-sm transition">
                  <LogIn size={18} />
                  <span className="hidden sm:block">Login</span>
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
        className={`fixed inset-y-0 left-0 w-72 bg-[#0b1220]/90 border-r border-white/10 backdrop-blur-xl shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)] z-50 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</span>
          <button className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" onClick={() => setOpen(false)}>
            <X className="text-gray-200" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2 text-sm overflow-y-auto flex-1 min-h-0">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" />
          <NavItem to="/announcements" icon={MessageSquare} label="Announcements" />
          <NavItem to="/assignment" icon={MessageSquare} label="Assignment" />
          <NavItem to="/grades" icon={GraduationCap} label="Grades & Transcript" />
          <NavItem to="/exam" icon={Calendar} label="Exam" />
          <NavItem to="/schedule" icon={Calendar} label="Schedule" />
          <NavItem to="/resources" icon={MessageSquare} label="Resources / Materials" />
          <NavItem to="/advisor" icon={User} label="Advisor Contact" />
          <NavItem to="/register" icon={MessageSquare} label="Register Services" />
          <NavItem to="/clubs" icon={MessageSquare} label="Clubs & Activities" />
          <NavItem to="/settings" icon={MessageSquare} label="Settings" />
          <NavItem to="/organization" icon={MessageSquare} label="Organization" />
        </nav>
      </aside>

      {/* ============ PRIMARY NAV ============ */}
      <div className="w-full bg-[#020617] border-b border-white/10 shrink-0">
        <div className="w-full flex justify-center overflow-x-auto">
          <div className="w-full max-w-[1400px] px-3 py-3" data-testid="main-nav">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 rounded-2xl border border-white/10 bg-[#0b1220]/70 backdrop-blur-xl px-3 py-2 shadow-[0_24px_70px_-60px_rgba(0,0,0,0.8)]">
              <NavItem to="/" icon={Home} label="Home" />
              <NavItem to="/chat" icon={MessageSquare} label="Chat" />
              <NavItem to="/class" icon={GraduationCap} label="Class" />
              <NavItem to="/meeting" icon={Calendar} label="Meeting" />
              <NavItem to="/checkline" icon={Calendar} label="Checkline" />
              <NavItem to="/profile" icon={User} label="Profile" />
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex flex-1 min-h-0 w-full justify-center overflow-y-auto">
        <div className="w-full max-w-[1400px] flex flex-1 min-h-0 overflow-auto bg-[#020617]">
          <AppRoutes />
        </div>
      </main>

      {/* TODO: Re-enable KVC Assistant widget when ready */}
      {/* <AssistantWidget userId={userId} roomName={roomName} /> */}
    </div>
  )
}
