// frontend/src/pages/Settings.jsx
import { useState } from "react"
import PageShell from "../components/PageShell"
import { api } from "../utils/api"
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Globe2,
  Shield,
  Download,
  Clock,
  Info,
} from "lucide-react"

export default function Settings() {
  const [language, setLanguage] = useState("th")
  const [theme, setTheme] = useState("dark")
  const [notifyAnnouncement, setNotifyAnnouncement] = useState(true)
  const [notifyAssignment, setNotifyAssignment] = useState(true)
  const [notifyActivity, setNotifyActivity] = useState(false)
  const [autoReminder, setAutoReminder] = useState(true)
  const [studyFocusMode, setStudyFocusMode] = useState(false)
  const [shareActivity, setShareActivity] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await api('/settings/preferences', {
        method: 'PATCH',
        body: {
          language,
          theme,
          notifications: {
            announcement: notifyAnnouncement,
            assignment: notifyAssignment,
            activity: notifyActivity,
            reminder: autoReminder
          },
          studyFocusMode,
          shareActivity
        }
      })
      alert('Settings saved successfully!')
      console.log('Settings response:', response)
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell
      title="Settings"
      subtitle="ตั้งค่าระบบพื้นฐานของ KVC Portal ให้เหมาะกับสไตล์การเรียนของคุณ"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-4 text-xs">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SettingsIcon size={16} className="text-violet-400" />
            <span>System & Preferences</span>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-[11px] text-white"
          >
            บันทึกการตั้งค่า
          </button>
        </div>

        {/* ========== GENERAL ========== */}
        <SectionCard
          icon={<Globe2 size={14} className="text-sky-400" />}
          title="ทั่วไป (General)"
          description="กำหนดภาษาและธีมหลักของ Portal"
        >
          <div className="space-y-2">
            <SettingRow label="ภาษา (Language)">
              <select
                className="bg-[#020617] border border-[#1f2937] rounded-lg px-2 py-1 text-xs text-gray-100"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="th">Thai (TH)</option>
                <option value="en">English (EN)</option>
              </select>
            </SettingRow>

            <SettingRow label="Theme">
              <div className="flex items-center gap-2">
                <select
                  className="bg-[#020617] border border-[#1f2937] rounded-lg px-2 py-1 text-xs text-gray-100"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="dark">Dark · KVC theme</option>
                  <option value="light">Light (experimental)</option>
                </select>
                <Moon size={13} className="text-emerald-300" />
              </div>
            </SettingRow>

            </div>
        </SectionCard>

        {/* ========== NOTIFICATION ========== */}
        <SectionCard
          icon={<Bell size={14} className="text-amber-300" />}
          title="การแจ้งเตือน (Notifications)"
          description="เลือกรับแจ้งเตือนเฉพาะสิ่งที่สำคัญกับคุณ"
        >
          <div className="space-y-2">
            <SettingRow label="ประกาศจากวิทยาลัย">
              <ToggleSwitch
                checked={notifyAnnouncement}
                onChange={setNotifyAnnouncement}
              />
            </SettingRow>

            <SettingRow label="งานที่มอบหมาย / กำหนดส่ง">
              <ToggleSwitch
                checked={notifyAssignment}
                onChange={setNotifyAssignment}
              />
            </SettingRow>

            <SettingRow label="กิจกรรมชมรม & กิจกรรมพิเศษ">
              <ToggleSwitch
                checked={notifyActivity}
                onChange={setNotifyActivity}
              />
            </SettingRow>

            <div className="pt-1 text-[10px] text-gray-500 flex items-start gap-1">
              <Info size={10} className="mt-0.5" />
              <span>
                เมื่อเชื่อมต่อ Backend จริง สามารถเลือกได้ว่าจะให้แจ้งเตือนผ่าน
                Email / LineOA / Mobile App
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ========== STUDY / REMINDER ========== */}
        <SectionCard
          icon={<Clock size={14} className="text-emerald-400" />}
          title="การเรียน & เตือนความจำ"
          description="ช่วยให้คุณไม่พลาดคลาสเรียนและเดดไลน์งาน"
        >
          <div className="space-y-2">
            <SettingRow label="เตือนงานก่อนเดดไลน์">
              <ToggleSwitch
                checked={autoReminder}
                onChange={setAutoReminder}
              />
            </SettingRow>

            <SettingRow label="Focus Mode ช่วงสอบ">
              <ToggleSwitch
                checked={studyFocusMode}
                onChange={setStudyFocusMode}
              />
            </SettingRow>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2">
                <div className="text-[11px] text-gray-400 mb-1">
                  ตัวอย่าง: เตือนงาน
                </div>
                <p className="text-[11px] text-gray-300">
                  ระบบจะเตือนผ่าน Portal ก่อนเดดไลน์ส่งงาน 2 วัน และ 6 ชั่วโมง
                </p>
              </div>
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2">
                <div className="text-[11px] text-gray-400 mb-1">
                  Focus Mode
                </div>
                <p className="text-[11px] text-gray-300">
                  เมื่อเปิดใช้งาน ระบบจะซ่อน Notification ที่ไม่เกี่ยวกับการเรียน
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ========== PRIVACY ========== */}
        <SectionCard
          icon={<Shield size={14} className="text-sky-400" />}
          title="ความเป็นส่วนตัว & ข้อมูลผู้ใช้"
          description="ควบคุมการแชร์ข้อมูลกิจกรรมการเรียนของคุณ"
        >
          <div className="space-y-2">
            <SettingRow label="แชร์กิจกรรมให้ที่ปรึกษาเห็น">
              <ToggleSwitch
                checked={shareActivity}
                onChange={setShareActivity}
              />
            </SettingRow>

            <div className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 mt-1">
              <p className="text-[11px] text-gray-300">
                ถ้าเปิดแชร์ อาจารย์ที่ปรึกษาจะเห็นข้อมูล:
              </p>
              <ul className="mt-1 text-[11px] text-gray-400 list-disc pl-4 space-y-0.5">
                <li>การเข้าเรียน (Attendance รวม)</li>
                <li>สถานะการส่งงานแบบรวม (ไม่เจาะรายงาน)</li>
                <li>จำนวนกิจกรรมชมรมที่เข้าร่วม</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* ========== DATA / EXPORT ========== */}
        <SectionCard
          icon={<Download size={14} className="text-violet-400" />}
          title="ข้อมูลของฉัน (Data & Export)"
          description="ดาวน์โหลดหรือสำรองข้อมูลการเรียน"
        >
          <div className="space-y-2">
            <SettingRow label="Export ข้อมูลผลการเรียน (PDF)">
              <button
                className="px-3 py-1.5 rounded-lg border border-[#374151] hover:bg-slate-800 text-[11px]"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export/transcript/pdf', {
                      method: 'GET',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                    if (!response.ok) throw new Error('Export failed')
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'transcript.pdf'
                    a.click()
                    console.log('PDF exported successfully')
                  } catch (err) {
                    console.error('Error exporting PDF:', err)
                    alert('Failed to export PDF. Please try again.')
                  }
                }}
              >
                ดาวน์โหลด PDF
              </button>
            </SettingRow>

            <SettingRow label="Export ข้อมูลกิจกรรม (CSV)">
              <button
                className="px-3 py-1.5 rounded-lg border border-[#374151] hover:bg-slate-800 text-[11px]"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export/activities/csv', {
                      method: 'GET',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                    if (!response.ok) throw new Error('Export failed')
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'activities.csv'
                    a.click()
                    console.log('Activities CSV exported successfully')
                  } catch (err) {
                    console.error('Error exporting CSV:', err)
                    alert('Failed to export CSV. Please try again.')
                  }
                }}
              >
                ดาวน์โหลด CSV
              </button>
            </SettingRow>

            <div className="pt-1 text-[10px] text-gray-500 flex items-start gap-1">
              <Info size={10} className="mt-0.5" />
              <span>
                เมื่อเชื่อมต่อ Backend จริง สามารถตั้งเวลา Export อัตโนมัติทุกสิ้นเทอม
                และส่งเข้าอีเมลของคุณได้
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Footer note */}
        <div className="border-t border-[#1f2937] pt-3 text-[10px] text-gray-500 flex items-center gap-1">
          <Info size={10} />
          <span>
            การตั้งค่าของคุณจะถูกบันทึกไปยังเซิร์ฟเวอร์
          </span>
        </div>
      </div>
    </PageShell>
  )
}

/* ---------- Reusable Section Card ---------- */
function SectionCard({ icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-100">
            {icon}
            <span>{title}</span>
          </div>
          {description && (
            <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="pt-1 space-y-2">{children}</div>
    </div>
  )
}

/* ---------- Setting Row ---------- */
function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-300">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

/* ---------- Toggle Switch ---------- */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full flex items-center px-0.5 transition 
        ${checked ? "bg-violet-600" : "bg-slate-700"}`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform 
          ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  )
}
