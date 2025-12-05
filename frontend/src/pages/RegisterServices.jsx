// frontend/src/pages/RegisterServices.jsx
import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import {
  FileText,
  ArrowRight,
  Clock,
  Info,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader,
} from "lucide-react"
import { api } from "../utils/api"

// ฟอร์มเริ่มต้นสำหรับคำร้องการลา
const initialLeaveForm = {
  type: "sick", // sick | personal | ordination
  startDate: "",
  endDate: "",
  fullDay: true,
  reason: "",
}

function StatusBadge({ status }) {
  if (status === "online") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
        ให้บริการออนไลน์
      </span>
    )
  }
  if (status === "mixed") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-600/20 text-sky-300 border border-sky-500/40">
        ออนไลน์ + ยื่นเอกสารจริง
      </span>
    )
  }
  if (status === "onsite") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/40">
        ติดต่อที่งานทะเบียน
      </span>
    )
  }
  // closed
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40">
      ปิดให้บริการชั่วคราว
    </span>
  )
}

function LeaveStatusBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
        <CheckCircle2 size={12} />
        อนุมัติแล้ว
      </span>
    )
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40">
        <XCircle size={12} />
        ไม่อนุมัติ
      </span>
    )
  }
  // pending
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/40">
      <AlertTriangle size={12} />
      กำลังพิจารณา
    </span>
  )
}

function formatLeaveType(type) {
  if (type === "sick") return "ลาป่วย"
  if (type === "personal") return "ลากิจ"
  if (type === "ordination") return "ลาบวช"
  return type
}

export default function RegisterServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError("")

      // Call backend API to get services data
      const response = await api("/services", { method: "GET" })

      if (response && Array.isArray(response)) {
        setServices(response || [])
      } else if (response?.data && Array.isArray(response.data)) {
        setServices(response.data || [])
      } else {
        throw new Error("No services data received")
      }
    } catch (err) {
      console.error("Error fetching services:", err)
      setError("ไม่สามารถโหลดข้อมูลบริการได้")
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const [leaveForm, setLeaveForm] = useState(initialLeaveForm)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 101,
      type: "sick",
      startDate: "2025-04-01",
      endDate: "2025-04-01",
      fullDay: true,
      reason: "มีไข้สูงและไปพบแพทย์",
      status: "approved", // pending | approved | rejected
      createdAt: "2025-03-31 20:15",
    },
    {
      id: 102,
      type: "personal",
      startDate: "2025-04-03",
      endDate: "2025-04-04",
      fullDay: true,
      reason: "เดินทางกลับภูมิลำเนาเพื่อจัดการเอกสารราชการ",
      status: "pending",
      createdAt: "2025-04-01 09:32",
    },
  ])

  const handleOpenLeaveModal = (presetType) => {
    setLeaveForm({
      ...initialLeaveForm,
      type: presetType || "sick",
    })
    setIsLeaveModalOpen(true)
  }

  const handleLeaveChange = (e) => {
    const { name, value, type, checked } = e.target
    setLeaveForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmitLeave = (e) => {
    e.preventDefault()
    if (!leaveForm.startDate) {
      alert("กรุณาเลือกวันที่เริ่มลา")
      return
    }
    const endDate = leaveForm.endDate || leaveForm.startDate

    const newReq = {
      id: Date.now(),
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate,
      fullDay: leaveForm.fullDay,
      reason: leaveForm.reason || "-",
      status: "pending",
      createdAt: new Date().toLocaleString("th-TH", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    }

    setLeaveRequests((prev) => [newReq, ...prev])
    setIsLeaveModalOpen(false)
    setLeaveForm(initialLeaveForm)
  }

  return (
    <>
      <PageShell
        title="Register Services"
        subtitle="บริการงานทะเบียน – แบบฟอร์มออนไลน์และระบบคำร้องการลา"
      >
        <div className="grid gap-4 lg:grid-cols-[1.8fr,1.1fr]">
          {/* ===== MAIN: SERVICES + LEAVE ===== */}
          <div className="space-y-4">
            {/* กล่อง: รายการบริการงานทะเบียน */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-100">
                    รายการบริการงานทะเบียน
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    เลือกบริการที่ต้องการ ระบบจะพาไปยังหน้ากรอกแบบฟอร์ม (จำลอง) หรือแสดงขั้นตอนการดำเนินการ
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2">
                  <Loader size={20} className="animate-spin text-emerald-400" />
                  <span className="text-gray-400">โหลดบริการ...</span>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
                  {error}
                </div>
              ) : (
              <div className="space-y-2 text-xs">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2.5 hover:bg-slate-900 transition flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <FileText size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-100">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {s.category}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                      <div className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        ระยะเวลาดำเนินการโดยประมาณ:{" "}
                        <span className="text-gray-200 font-medium">
                          {s.eta}
                        </span>
                      </div>
                      {s.needLogin && (
                        <span className="text-violet-300">
                          * ต้องเข้าสู่ระบบด้วยบัญชีนักศึกษา
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white"
                      >
                        กรอกแบบฟอร์มคำร้อง
                        <ArrowRight size={12} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg border border-[#374151] text-gray-300 hover:bg-slate-800"
                      >
                        ดูตัวอย่างเอกสาร / ขั้นตอน
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}

              <p className="text-[11px] text-gray-500 mt-2">
                * ข้อมูลอัดฉากจากระบบ Backend
              </p>
            </div>

            {/* กล่อง: ระบบคำร้องการลา */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-100">
                    ระบบคำร้องการลา (ลาป่วย / ลากิจ / ลาบวช)
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    แบบฟอร์มคำร้องการลา – ส่งออนไลน์, รออาจารย์และงานทะเบียนอนุมัติผ่านระบบ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenLeaveModal("sick")}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white"
                >
                  สร้างคำร้องลาใหม่
                </button>
              </div>

              {/* ปุ่มลาประเภทต่าง ๆ แบบเร็ว */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleOpenLeaveModal("sick")}
                  className="px-3 py-1.5 rounded-full border border-[#374151] hover:bg-slate-800"
                >
                  ลาป่วย
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLeaveModal("personal")}
                  className="px-3 py-1.5 rounded-full border border-[#374151] hover:bg-slate-800"
                >
                  ลากิจ
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLeaveModal("ordination")}
                  className="px-3 py-1.5 rounded-full border border-[#374151] hover:bg-slate-800"
                >
                  ลาบวช
                </button>
              </div>

              {/* รายการคำร้องที่เคยส่ง */}
              <div className="mt-2 space-y-2 text-xs">
                {leaveRequests.length === 0 ? (
                  <p className="text-[11px] text-gray-500">
                    ยังไม่มีคำร้องการลาในระบบ
                  </p>
                ) : (
                  leaveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 hover:bg-slate-900 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-100">
                              คำร้อง{formatLeaveType(req.type)}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              วันที่ลา: {req.startDate}
                              {req.endDate !== req.startDate &&
                                ` - ${req.endDate}`}
                              {req.fullDay && " · ทั้งวัน"}
                            </div>
                          </div>
                        </div>
                        <LeaveStatusBadge status={req.status} />
                      </div>
                      <div className="text-[11px] text-gray-300 mt-1">
                        เหตุผล: {req.reason}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <User size={11} className="text-gray-500" />
                        ส่งคำร้องเมื่อ {req.createdAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ===== SIDE PANE: How-to / Docs ===== */}
          <div className="space-y-3">
            {/* How-to card */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-[11px] text-gray-300 space-y-2">
              <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Info size={14} className="text-sky-400" />
                วิธีใช้งานระบบบริการงานทะเบียน & คำร้องการลา
              </h3>
              <ol className="list-decimal pl-4 space-y-1">
                <li>เลือกประเภทบริการ หรือประเภทการลาที่ต้องการ</li>
                <li>กรอกแบบฟอร์มออนไลน์ แนบไฟล์เอกสารที่จำเป็น</li>
                <li>ยืนยันคำร้อง ระบบจะสร้างรายการคำร้องให้ติดตามสถานะ</li>
                <li>รออาจารย์ที่ปรึกษา / หัวหน้างาน และงานทะเบียน “อนุมัติ” หรือ “ไม่อนุมัติ”</li>
              </ol>
              <p className="text-[11px] text-gray-500 mt-1">
                * เมื่อเชื่อมต่อ Backend จริง สามารถใช้สิทธิ์ของอาจารย์และเจ้าหน้าที่ในการเปลี่ยนสถานะคำร้อง,
                แนบความเห็น, และส่งแจ้งเตือนกลับไปยังนักศึกษาได้
              </p>
            </div>

            {/* Common docs card */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-[11px] text-gray-300 space-y-2">
              <h3 className="text-sm font-semibold text-gray-100">
                เอกสารที่มักใช้ร่วมกับคำร้อง
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>สำเนาบัตรประชาชน / บัตรนักศึกษา</li>
                <li>สำเนาทะเบียนบ้าน (กรณีเปลี่ยนชื่อ–สกุล / ที่อยู่)</li>
                <li>ใบรับรองแพทย์ (กรณีลาป่วยหลายวัน)</li>
                <li>หนังสือรับรองจากวัด หรือเอกสารเกี่ยวกับการบวช (กรณีลาบวช)</li>
                <li>หลักฐานการชำระเงินค่าธรรมเนียม (ถ้ามี)</li>
              </ul>
              <p className="text-[11px] text-gray-500 mt-1">
                สามารถเพิ่มลิงก์ดาวน์โหลดไฟล์ PDF แบบฟอร์มเปล่า หรือคู่มือการกรอกคำร้องจากเว็บไซต์ทางการของวิทยาลัยได้ภายหลัง
              </p>
            </div>
          </div>
        </div>
      </PageShell>

      {/* ===== LEAVE REQUEST MODAL ===== */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg mx-4 rounded-2xl border border-[#1f2937] bg-[#020617] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
                <FileText size={16} className="text-violet-400" />
                <span>ฟอร์มคำร้องการลา</span>
              </div>
              <button
                className="text-xs text-gray-400 hover:text-gray-200"
                onClick={() => setIsLeaveModalOpen(false)}
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-4 text-xs text-gray-200 space-y-3">
              {/* ประเภทการลา */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400">ประเภทการลา</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "sick" }))}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] ${
                      leaveForm.type === "sick"
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-[#374151] text-gray-200 hover:bg-slate-800"
                    }`}
                  >
                    ลาป่วย
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "personal" }))}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] ${
                      leaveForm.type === "personal"
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-[#374151] text-gray-200 hover:bg-slate-800"
                    }`}
                  >
                    ลากิจ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveForm((prev) => ({ ...prev, type: "ordination" }))}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] ${
                      leaveForm.type === "ordination"
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-[#374151] text-gray-200 hover:bg-slate-800"
                    }`}
                  >
                    ลาบวช
                  </button>
                </div>
              </div>

              {/* ช่วงวันที่ลา */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">วันที่เริ่มลา *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={leaveForm.startDate}
                    onChange={handleLeaveChange}
                    className="w-full bg-[#020617] border border-[#374151] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">
                    ถึงวันที่ (ถ้าลาวันเดียวกันให้เว้นไว้)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={leaveForm.endDate}
                    onChange={handleLeaveChange}
                    className="w-full bg-[#020617] border border-[#374151] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* ทั้งวัน / ตัวเลือกเพิ่มเติม (ตอนนี้ mock แค่ทั้งวัน) */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400">ช่วงเวลา</label>
                <label className="inline-flex items-center gap-2 text-[11px] text-gray-300">
                  <input
                    type="checkbox"
                    name="fullDay"
                    checked={leaveForm.fullDay}
                    onChange={handleLeaveChange}
                    className="w-3 h-3 rounded border border-[#4b5563] bg-[#020617]"
                  />
                  ลาทั้งวัน (เต็มวันเรียน)
                </label>
                <p className="text-[10px] text-gray-500">
                  * หากต้องการรองรับ “ลาบางคาบ / ช่วงเวลา” ภายหลัง สามารถเพิ่มช่องกรอกเวลาเริ่ม–สิ้นสุดได้
                </p>
              </div>

              {/* เหตุผลการลา */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400">เหตุผลในการลา</label>
                <textarea
                  name="reason"
                  value={leaveForm.reason}
                  onChange={handleLeaveChange}
                  rows={3}
                  placeholder="ระบุสาเหตุการลา เช่น ป่วย / ธุระสำคัญ / เตรียมบวช ฯลฯ"
                  className="w-full bg-[#020617] border border-[#374151] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* แนบไฟล์ (mock ui) */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400">
                  แนบไฟล์ประกอบ (ตัวอย่าง UI – ยังไม่เชื่อม upload จริง)
                </label>
                <div className="border border-dashed border-[#374151] rounded-lg px-3 py-3 text-[11px] text-gray-400">
                  คลิกหรือลากไฟล์มาวางที่นี่ เช่น ใบรับรองแพทย์, หนังสือรับรองจากวัด ฯลฯ
                </div>
              </div>

              {/* ปุ่มส่งคำร้อง */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#374151] text-[11px] text-gray-300 hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-[11px] font-medium text-white"
                >
                  ส่งคำร้องการลา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
