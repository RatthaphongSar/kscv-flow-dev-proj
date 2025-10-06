import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const [username, setU] = useState('')
  const [password, setP] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [caps, setCaps] = useState(false)
  const [remember, setRemember] = useState(false) // เผื่อไว้ต่อยอด
  const nav = useNavigate()
  const loc = useLocation()
  const { login } = useAuth()
  const userRef = useRef(null)
  const pwRef = useRef(null)

  // autofocus
  useEffect(() => {
    userRef.current?.focus()
  }, [])

  // อ่าน redirect จาก query (?next=/chat)
  const next = new URLSearchParams(loc.search).get('next') || '/chat'

  function validate() {
    if (!username.trim()) return 'กรุณากรอกชื่อผู้ใช้'
    if (!password) return 'กรุณากรอกรหัสผ่าน'
    if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    const v = validate()
    if (v) { setErr(v); return }
    setLoading(true)
    try {
      await login(username.trim(), password)
      // (option) ถ้า remember == true สามารถสั่ง backend ออก refresh token อายุยาวขึ้นได้
      nav(next, { replace: true })
    } catch (ex) {
      // ดึงข้อความจาก backend ถ้ามี
      const msg = ex?.data?.error || ex?.message || 'เข้าสู่ระบบไม่สำเร็จ'
      setErr(msg)
      // โฟกัสช่องรหัสผ่านเพื่อความเร็วในการแก้
      pwRef.current?.focus()
      pwRef.current?.select?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-sm mx-auto p-4 bg-white rounded-xl border mt-8">
      <h1 className="text-xl font-semibold mb-3">เข้าสู่ระบบ</h1>
      <p className="text-slate-500 text-sm mb-4">เข้าสู่ระบบพอร์ทัล KVC (รองรับเฉพาะบัญชีที่สร้างจากระบบภายใน)</p>

      {err && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        {/* Username */}
        <label className="block text-sm">
          <span className="text-slate-700">ชื่อผู้ใช้</span>
          <input
            ref={userRef}
            className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="เช่น student-123"
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
            disableautocomplete="true"
            inputMode="text"
            aria-invalid={!!err && !username ? 'true' : 'false'}
          />
        </label>

        {/* Password */}
        <label className="block text-sm">
          <span className="text-slate-700">รหัสผ่าน</span>
          <div className="mt-1 relative">
            <input
              ref={pwRef}
              type={showPw ? 'text' : 'password'}
              className="w-full border rounded px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setP(e.target.value)}
              onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock'))}
              autoComplete="current-password"
              aria-invalid={!!err && !password ? 'true' : 'false'}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {caps && <div className="mt-1 text-xs text-amber-600">⚠ Caps Lock เปิดอยู่</div>}
        </label>

        {/* Remember me (เตรียมไว้ต่อยอด) */}
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          จดจำการเข้าสู่ระบบในอุปกรณ์นี้
        </label>

        <button
          className="w-full bg-primary text-white rounded py-2 flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={loading}
        >
          <LogIn size={18} />
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      {/* ลิงก์เพิ่มเติม (ยังไม่เปิดใช้งาน) */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span className="opacity-60">ยังไม่มีระบบสมัครผ่านเว็บ</span>
        <span className="opacity-60">ลืมรหัสผ่าน (ติดต่อผู้ดูแล)</span>
      </div>
    </section>
  )
}
