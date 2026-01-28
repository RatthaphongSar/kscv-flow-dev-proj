import { useAuth } from "../context/AuthContext"
import { userApi } from "../api/userApi"
import {
  User, Mail, Phone, BookOpen, Lock, LogOut, Camera,
  Share2, Copy, QrCode, FileDown, Activity, MapPin, Briefcase, Calendar
} from "lucide-react"
import { useState, useEffect } from "react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [advisor, setAdvisor] = useState(null)

  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [preview, setPreview] = useState(user?.avatar || null)
  const [showShare, setShowShare] = useState(false)

  const profileURL = `${window.location.origin}/profile/${user?.username || "guest"}`

  const [form, setForm] = useState({
    username: user?.username || "",
    fullname: user?.fullname || "Guest User",
    email: user?.email || "guest@example.com",
    phone: user?.phone || "",
    major: user?.major || "N/A",
    year: user?.year || "N/A",
    studentId: user?.studentId || "N/A",
    address: user?.address || "",
    role: user?.role || "Student",
  })

  // Load advisor information
  useEffect(() => {
    const loadAdvisor = async () => {
      if (user?.role === 'student') {
        try {
          const response = await userApi.getProfile();
          if (response.advisor) {
            setAdvisor(response.advisor);
          }
        } catch (err) {
          console.error("Error loading advisor:", err);
        }
      }
    }
    loadAdvisor()
  }, [user?.role])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    try {
      await userApi.updateProfile({
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
      });
      console.log("Profile saved successfully");
      setEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    setPreview(user?.avatar || null)
  }

  const copyProfileURL = () => {
    navigator.clipboard.writeText(profileURL)
    alert("คัดลอกลิงก์โปรไฟล์แล้ว!")
  }

  const copyContactInfo = () => {
    const info = `${form.fullname}\n${form.email}\n${form.phone}`
    navigator.clipboard.writeText(info)
    alert("คัดลอกข้อมูลติดต่อแล้ว!")
  }

  return (
    <div className="h-[calc(100vh-112px)] w-full text-gray-100 px-4 py-6 bg-[#020617] bg-[radial-gradient(1100px_circle_at_15%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(14,165,233,0.08),transparent_50%)]">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-xs text-gray-400">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 p-6 backdrop-blur-xl shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-8">

          <div className="flex flex-col items-center md:w-1/3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500/30 via-sky-400/20 to-transparent blur-lg" />
              <div className="relative rounded-full p-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                <img
                  src={preview || "/default-avatar.png"}
                  className="w-32 h-32 rounded-full object-cover border border-white/10"
                />
              </div>

              {editing && (
                <label className="absolute bottom-1 right-1 bg-[#111827] border border-white/10 p-2 rounded-full cursor-pointer hover:border-violet-400/50 hover:bg-[#0b1220] transition">
                  <Camera size={16} />
                  <input type="file" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <p className="mt-4 text-gray-100 font-semibold">{form.fullname}</p>
            <p className="text-gray-400 text-sm">@{form.username}</p>

            <button
              onClick={() => setShowShare(true)}
              className="mt-4 flex items-center gap-2 text-xs px-3.5 py-2 rounded-full border border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-white/10 transition"
            >
              <Share2 size={14} /> Share Profile
            </button>

          </div>

          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ProfileField icon={User} label="Full Name">
                {editing ? <InputField name="fullname" value={form.fullname} onChange={handleChange} /> : form.fullname}
              </ProfileField>

              <ProfileField icon={Mail} label="Email">
                {editing ? <InputField name="email" value={form.email} onChange={handleChange} /> : form.email}
              </ProfileField>

              <ProfileField icon={Phone} label="Phone">
                {editing ? <InputField name="phone" value={form.phone} onChange={handleChange} /> : (form.phone || "—")}
              </ProfileField>

              <ProfileField icon={Calendar} label="Year">
                {editing ? <InputField name="year" value={form.year} onChange={handleChange} /> : form.year}
              </ProfileField>

              <ProfileField icon={BookOpen} label="Major">
                {editing ? <InputField name="major" value={form.major} onChange={handleChange} /> : form.major}
              </ProfileField>

              <ProfileField icon={User} label="Student ID">
                {form.studentId}
              </ProfileField>

              <ProfileField icon={MapPin} label="Address">
                {editing ? <InputField name="address" value={form.address} onChange={handleChange} /> : (form.address || "—")}
              </ProfileField>

              <ProfileField icon={Briefcase} label="Role">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  form.role === 'student'
                    ? 'bg-blue-500/20 text-blue-300'
                    : form.role === 'teacher'
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {form.role === 'student' ? 'นักเรียน' : form.role === 'teacher' ? 'อาจารย์' : 'ผู้ดูแลระบบ'}
                </span>
              </ProfileField>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-4">
              {!editing ? (
                <button className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_12px_30px_-20px_rgba(99,102,241,0.8)] transition" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 transition" onClick={saveProfile}>
                    Save
                  </button>
                  <button className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition" onClick={cancelEdit}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ADVISOR INFORMATION (for students) */}
        {user?.role === 'student' && (
          <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 p-6 backdrop-blur-xl shadow-[0_24px_70px_-60px_rgba(0,0,0,0.8)]">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <Briefcase size={16} className="text-violet-300" />
              ครูที่ปรึกษา (Advisor)
            </h2>
            
            {advisor ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField icon={User} label="ชื่อครูที่ปรึกษา">
                  {advisor.fullname || advisor.name || "—"}
                </ProfileField>
                <ProfileField icon={Mail} label="Email">
                  {advisor.email || "—"}
                </ProfileField>
                <ProfileField icon={Phone} label="Phone">
                  {advisor.phone || "—"}
                </ProfileField>
                <ProfileField icon={MapPin} label="สำนัก/ที่ทำงาน">
                  {advisor.office || "—"}
                </ProfileField>
              </div>
            ) : (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลครูที่ปรึกษาในระบบ</p>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 p-6 space-y-4 backdrop-blur-xl shadow-[0_24px_70px_-60px_rgba(0,0,0,0.8)]">
          <h2 className="text-sm font-semibold text-gray-100">Security Settings</h2>

          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-violet-400/40 hover:bg-white/10 transition">
            <span className="flex items-center gap-3 text-sm text-gray-200"><Lock size={18} /> Change Password</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400/60 transition"
          >
            <span className="flex items-center gap-3 text-sm"><LogOut size={18} /> Logout</span>
          </button>
        </div>

        {/* SHARE PROFILE MODAL */}
        {showShare && (
          <ShareModal
            profileURL={profileURL}
            copyProfileURL={copyProfileURL}
            copyContactInfo={copyContactInfo}
            close={() => setShowShare(false)}
          />
        )}

      </div>
    </div>
  )
}

/* --------------------- COMPONENTS --------------------- */

function ShareModal({ profileURL, copyProfileURL, copyContactInfo, close }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl bg-[#0b1220]/90 border border-white/10 p-6 w-full max-w-sm space-y-4 backdrop-blur-xl shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)]">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-100">Share Your Profile</h3>
          <p className="text-[11px] text-gray-400">ส่งลิงก์โปรไฟล์ให้เพื่อนหรืออาจารย์ดูข้อมูลของคุณ</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-xs break-all text-gray-300">
          {profileURL}
        </div>

        <button onClick={copyProfileURL} className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs hover:from-violet-500 hover:to-indigo-500 transition">
          <Copy size={14} /> Copy Profile Link
        </button>

        <button onClick={copyContactInfo} className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-full border border-white/10 bg-white/5 text-xs hover:bg-white/10 hover:border-white/30 transition">
          <User size={14} /> Copy Contact Info
        </button>

        <button onClick={close} className="w-full px-3 py-2 text-xs rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 transition">
          Close
        </button>
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0b1220]/80 px-3 py-2">
      <span className="text-[11px] text-gray-400 flex items-center gap-1">
        <Icon size={13} /> {label}
      </span>
      <span className="text-sm text-gray-100">{children}</span>
    </div>
  )
}

function InputField({ name, value, onChange }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 w-full text-sm text-gray-100 focus:ring-1 focus:ring-violet-500 outline-none"
    />
  )
}
