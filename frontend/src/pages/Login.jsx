import { useEffect, useRef, useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff, LogIn, ShieldCheck, AlertCircle } from "lucide-react"

export default function Login() {
  const [username, setU] = useState("")
  const [password, setP] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [caps, setCaps] = useState(false)
  const [remember, setRemember] = useState(false) // เผื่อไว้ต่อยอด remember me จริง
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
  const next = new URLSearchParams(loc.search).get("next") || "/chat"

  function validate() {
    if (!username.trim()) return "กรุณากรอกชื่อผู้ใช้"
    if (!password) return "กรุณากรอกรหัสผ่าน"
    if (password.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
    return ""
  }

  // simple password strength meter
  const pwStrength = useMemo(() => {
    if (!password) return { label: "", level: 0, color: "" }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2)
      return { label: "Weak", level: 1, color: "bg-red-500", text: "text-red-400" }
    if (score <= 3)
      return { label: "Medium", level: 2, color: "bg-amber-500", text: "text-amber-300" }
    return { label: "Strong", level: 3, color: "bg-emerald-500", text: "text-emerald-300" }
  }, [password])

  async function onSubmit(e) {
    e.preventDefault()
    setErr("")
    const v = validate()
    if (v) {
      setErr(v)
      return
    }
    setLoading(true)
    try {
      await login(username.trim(), password)
      // (option) ถ้า remember == true สามารถสั่ง backend ออก refresh token อายุยาวขึ้นได้
      nav(next, { replace: true })
    } catch (ex) {
      const msg = ex?.data?.error || ex?.message || "เข้าสู่ระบบไม่สำเร็จ"
      setErr(msg)
      pwRef.current?.focus()
      pwRef.current?.select?.()
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (type) => {
    if (type === "student") {
      setU("student-demo")
      setP("Student123!")
    } else if (type === "teacher") {
      setU("teacher-demo")
      setP("Teacher123!")
    }
  }

  return (
    <div className="h-[calc(100vh-112px)] w-full bg-[#020617] flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#020617] p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="mb-1">
          <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white">
              <LogIn size={18} />
            </span>
            เข้าสู่ระบบ
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            เข้าสู่ระบบพอร์ทัล{" "}
            <span className="text-violet-400 font-semibold">KVC</span>
            &nbsp;รองรับเฉพาะบัญชีที่สร้างจากระบบภายใน
          </p>

          {/* แสดงหน้าที่จะ redirect ไปหลัง login */}
          <p className="mt-1 text-[11px] text-gray-500">
            หลังเข้าสู่ระบบจะพาไปที่{" "}
            <span className="text-violet-300 font-medium">{next}</span>
          </p>
        </div>

        {/* Error Box */}
        {err && (
          <div className="mb-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <label className="block text-xs">
            <span className="text-gray-300">ชื่อผู้ใช้</span>
            <input
              ref={userRef}
              className="mt-1 w-full rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="เช่น student-123"
              value={username}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
              disableautocomplete="true"
              inputMode="text"
              aria-invalid={!!err && !username ? "true" : "false"}
            />
          </label>

          {/* Password */}
          <label className="block text-xs">
            <span className="text-gray-300">รหัสผ่าน</span>
            <div className="mt-1 relative">
              <input
                ref={pwRef}
                type={showPw ? "text" : "password"}
                className="w-full rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 pr-10 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setP(e.target.value)}
                onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock"))}
                autoComplete="current-password"
                aria-invalid={!!err && !password ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Caps lock warning */}
            {caps && (
              <div className="mt-1 text-[11px] text-amber-400">
                ⚠ Caps Lock เปิดอยู่
              </div>
            )}
          </label>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              className="accent-violet-600 bg-[#020617] border-[#1f2937]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            จดจำการเข้าสู่ระบบในอุปกรณ์นี้
          </label>

          {/* Quick demo accounts (mock) */}
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>ทดลองเติมข้อมูลผู้ใช้ (mock)</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="px-2 py-1 rounded-md border border-[#374151] hover:bg-slate-800 text-gray-200"
                onClick={() => quickFill("student")}
              >
                Demo Student
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded-md border border-[#374151] hover:bg-slate-800 text-gray-200"
                onClick={() => quickFill("teacher")}
              >
                Demo Teacher
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 text-white py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Security tips / links */}
        <div className="mt-2 space-y-2 text-[11px] text-gray-500">
          <div className="flex items-start gap-2 rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2">
            <ShieldCheck size={14} className="text-emerald-400 mt-0.5" />
            <div>
              <div className="text-gray-300 mb-0.5">คำแนะนำด้านความปลอดภัย</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>หลีกเลี่ยงการใช้รหัสผ่านซ้ำกับระบบอื่น</li>
                <li>ห้ามบอกชื่อผู้ใช้และรหัสผ่านให้ผู้อื่นทราบ</li>
                <li>หากใช้เครื่องสาธารณะ ไม่ควรติ๊ก "จดจำการเข้าสู่ระบบ"</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="opacity-70">
              ยังไม่มีระบบสมัครผ่านเว็บ (สมัครผ่านงานทะเบียน)
            </span>
            <span className="opacity-70">
              ลืมรหัสผ่าน (ติดต่อผู้ดูแล)
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
