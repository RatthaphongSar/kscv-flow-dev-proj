// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import {
  Menu, Search, LogIn,
  Home, MessageSquare, GraduationCap, Calendar, User, X
} from 'lucide-react'
import AssistantWidget from './components/AssistantWidget'
import { useAuth } from './context/AuthContext'

// ===== NavItem (ใช้ได้ทั้ง Sidebar และ Primary Nav) =====
function NavItem({ to, icon: Icon, label, badge, onClick }) {
  const loc = useLocation()
  const active = loc.pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition
        ${active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-blue-50'}`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>

      {badge ? (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()   // ดึงสถานะ user จาก AuthContext

  // ปิด Sidebar ด้วย ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // userId/roomName ใช้สำหรับ Assistant
  const userId = user?.id || 'guest'
  const roomName = user ? `room-${user.username}` : 'guest-room'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center gap-3 p-3">
          <button
            className="p-2 rounded-lg hover:bg-blue-50"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <Link to="/" className="text-primary font-bold">KVC</Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-2.5 text-slate-400" size={18} />
              <input
                aria-label="Search"
                className="border pl-8 pr-3 py-2 rounded-lg focus:outline-primary"
                placeholder="Search..."
              />
            </div>

            {/* ✅ ถ้ายังไม่ login → แสดงปุ่ม Login | ถ้า login แล้ว → แสดงชื่อ user */}
            {user ? (
              <Link
                to="/profile"
                className="px-3 py-2 rounded-lg border hover:bg-blue-50 flex items-center gap-2"
              >
                <User size={18} /> 
                <span className="hidden sm:block">{user.username}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg border hover:bg-blue-50 flex items-center gap-2"
              >
                <LogIn size={18} /> 
                <span className="hidden sm:block">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r shadow-lg z-50 transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-primary">Navigation</span>
          <button
            className="p-2 rounded-lg hover:bg-blue-50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2 text-sm overflow-y-auto h-full">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" onClick={() => setOpen(false)} />
          <NavItem to="/announcements" icon={MessageSquare} label="Announcements" onClick={() => setOpen(false)} />
          <NavItem to="/assignment" icon={MessageSquare} label="Assignment" onClick={() => setOpen(false)} />
          <NavItem to="/grades" icon={GraduationCap} label="Grades & Transcript" onClick={() => setOpen(false)} />
          <NavItem to="/exam" icon={Calendar} label="Exam" onClick={() => setOpen(false)} />
          <NavItem to="/schedule" icon={Calendar} label="Schedule" onClick={() => setOpen(false)} />
          <NavItem to="/resources" icon={MessageSquare} label="Resources / Materials" onClick={() => setOpen(false)} />
          <NavItem to="/advisor" icon={User} label="Advisor Contact" onClick={() => setOpen(false)} />
          <NavItem to="/register" icon={MessageSquare} label="Register Services" onClick={() => setOpen(false)} />
          <NavItem to="/clubs" icon={MessageSquare} label="Clubs & Activities" onClick={() => setOpen(false)} />
          <NavItem to="/settings" icon={MessageSquare} label="Settings" onClick={() => setOpen(false)} />
          <NavItem to="/organization" icon={MessageSquare} label="Organization" onClick={() => setOpen(false)} />
        </nav>
      </aside>

      {/* Primary Nav */}
      <div className="bg-surface border-b">
        <div className="max-w-6xl mx-auto flex justify-around md:justify-start md:gap-2 px-3 py-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/chat" icon={MessageSquare} label="Chat" badge={3} />
          <NavItem to="/class" icon={GraduationCap} label="Class" />
          <NavItem to="/meeting" icon={Calendar} label="Meeting" />
          <NavItem to="/checkline" icon={Calendar} label="Checkline" />
          <NavItem to="/profile" icon={User} label="Profile" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto p-3">
        <AppRoutes />
      </main>

      {/* Assistant Widget */}
      <AssistantWidget userId={userId} roomName={roomName} />
    </div>
  )
}
