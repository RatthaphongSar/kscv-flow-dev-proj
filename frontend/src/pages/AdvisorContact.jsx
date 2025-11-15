// frontend/src/pages/AdvisorContact.jsx
import { useState } from "react"
import PageShell from "../components/PageShell"
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  MessageCircle,
  Info,
  Clock,
  MapPin,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

const advisor = {
  name: "Aj. Ratchanee",
  email: "ratchanee@kvc.ac.th",
  phone: "081-234-5678",
  room: "อาคาร 3 ชั้น 2 ห้องอาจารย์ที่ปรึกษา",
  officeHour: "Mon–Wed 13:00–15:00",
  department: "Business Department",
}

const mockFaq = [
  {
    id: "f1",
    q: "อยากปรึกษาเรื่องการลงทะเบียนเรียน/เพิ่ม-ถอนวิชา ต้องทำอย่างไร?",
    a: "ขั้นแรกสามารถส่งข้อความผ่านระบบแชท หรืออีเมลแจ้งรายละเอียดเบื้องต้นให้อาจารย์ จากนั้นนัดเวลาปรึกษาในช่วง Office Hour เพื่อตรวจสอบแผนการเรียนร่วมกัน และจึงดำเนินการในระบบทะเบียนของวิทยาลัย",
  },
  {
    id: "f2",
    q: "หากมีปัญหาด้านเกรด หรือเสี่ยงไม่ผ่านรายวิชา ควรทำอย่างไร?",
    a: "แนะนำให้ติดต่ออาจารย์โดยเร็วที่สุดเพื่อนัดพูดคุย อาจารย์จะช่วยวิเคราะห์สาเหตุ แนะนำการปรับแผนการอ่านหนังสือ เสริมแบบฝึกหัด หรือปรับตารางเรียน/กิจกรรมให้เหมาะสมขึ้น",
  },
]

export default function AdvisorContact() {
  const [request, setRequest] = useState({
    topic: "",
    preferredDate: "",
    preferredTime: "",
    channel: "in-person",
  })
  const [selectedFaq, setSelectedFaq] = useState(null)

  const handleChange = (field, value) => {
    setRequest((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitRequest = () => {
    if (!request.topic.trim()) {
      alert("กรุณาระบุหัวข้อที่ต้องการปรึกษาก่อนส่งคำขอ")
      return
    }
    alert(
      [
        "(mock) ส่งคำขอปรึกษาอาจารย์ที่ปรึกษาเรียบร้อยแล้ว",
        "",
        `หัวข้อ: ${request.topic || "-"}`,
        `วันนัดหมายที่ต้องการ: ${request.preferredDate || "-"}`,
        `เวลาที่ต้องการ: ${request.preferredTime || "-"}`,
        `ช่องทาง: ${
          request.channel === "in-person"
            ? "พบที่ห้องอาจารย์"
            : request.channel === "chat"
            ? "แชทใน Portal"
            : "วิดีโอคอล"
        }`,
      ].join("\n")
    )
    setRequest({
      topic: "",
      preferredDate: "",
      preferredTime: "",
      channel: "in-person",
    })
  }

  const handleQuickFill = (template) => {
    setRequest((prev) => ({
      ...prev,
      topic: prev.topic
        ? prev.topic
        : template,
    }))
  }

  const handleOpenChatMock = () => {
    alert("(mock) เปิดห้องแชทคุยกับอาจารย์ที่ปรึกษาใน Portal")
  }

  const handleSendEmailMock = () => {
    alert("(mock) เตรียมหน้าต่างส่งอีเมลหาอาจารย์ที่ปรึกษา")
  }

  const toggleFaq = (id) => {
    setSelectedFaq((prev) => (prev === id ? null : id))
  }

  return (
    <PageShell
      title="Advisor Contact"
      subtitle="ข้อมูลการติดต่ออาจารย์ที่ปรึกษา และระบบขอคิวปรึกษาเบื้องต้น"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-5 text-xs space-y-4">

        {/* ===== Advisor Profile + Quick Actions ===== */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1.3fr] gap-4">
          {/* Profile */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-100">
                  {advisor.name}
                </div>
                <div className="text-[11px] text-gray-400">
                  Advisor · {advisor.department}
                </div>
                <div className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock size={11} className="text-emerald-300" />
                  Office Hour:{" "}
                  <span className="text-gray-200">{advisor.officeHour}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-gray-300 mt-2">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span>{advisor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span>{advisor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                <MapPin size={13} className="text-sky-400" />
                <span>ห้องทำงาน: {advisor.room}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-[#1f2937] flex flex-wrap gap-2">
              <button
                onClick={handleOpenChatMock}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] flex items-center gap-1"
              >
                <MessageCircle size={13} />
                เปิดแชทคุยกับอาจารย์ (mock)
              </button>
              <button
                onClick={handleSendEmailMock}
                className="px-3 py-1.5 rounded-lg border border-[#374151] hover:bg-slate-800 text-[11px] flex items-center gap-1 text-gray-200"
              >
                <Mail size={13} />
                เขียนอีเมลหาอาจารย์ (mock)
              </button>
            </div>
          </div>

          {/* Contact Guidelines / Tips */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-100">
              <Info size={14} className="text-sky-400" />
              แนวทางการติดต่ออาจารย์ที่ปรึกษา
            </div>
            <p className="text-[11px] text-gray-400">
              การเตรียมข้อมูลก่อนติดต่อช่วยให้อาจารย์เข้าใจสถานการณ์ของคุณได้เร็วขึ้น
              และช่วยวางแผนแก้ปัญหาได้ตรงจุด
            </p>
            <ul className="text-[11px] text-gray-300 space-y-1 list-disc pl-4">
              <li>ระบุหัวข้อที่ต้องการปรึกษา เช่น เกรด, การลงทะเบียน, ปัญหาส่วนตัว</li>
              <li>แจ้งรหัสนักศึกษา และสาขาที่เรียนให้ชัดเจน</li>
              <li>ถ้ามีเอกสารประกอบ เช่น ใบเกรด, ตารางเรียน สามารถแนบไปด้วยได้</li>
              <li>หากเป็นเรื่องเร่งด่วน ให้ใช้เบอร์โทรศัพท์หรือพบที่ห้องอาจารย์</li>
            </ul>
          </div>
        </div>

        {/* ===== Appointment Request / Booking (mock) ===== */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-emerald-400" />
              <div>
                <div className="text-sm font-semibold text-gray-100">
                  ขอคิวปรึกษาอาจารย์ที่ปรึกษา (ตัวอย่าง)
                </div>
                <div className="text-[11px] text-gray-400">
                  แบบฟอร์มนี้เป็น mock เพื่อเตรียมต่อกับระบบจองคิว/ปฏิทินในอนาคต
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr,1.3fr] gap-4 text-[11px]">
            {/* Form */}
            <div className="space-y-2">
              <label className="flex flex-col gap-1">
                <span className="text-gray-300">
                  หัวข้อที่ต้องการปรึกษา <span className="text-red-400">*</span>
                </span>
                <textarea
                  rows={3}
                  className="bg-[#020617] border border-[#374151] rounded-lg px-3 py-2 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="เช่น ขอปรึกษาเรื่องการลงทะเบียนเรียน, วางแผนเส้นทางการเรียนต่อ, ปัญหาด้านเวลาเรียน/งานพิเศษ ฯลฯ"
                  value={request.topic}
                  onChange={(e) => handleChange("topic", e.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-gray-300">วันที่ต้องการนัดพบ (โดยประมาณ)</span>
                  <input
                    type="date"
                    className="bg-[#020617] border border-[#374151] rounded-lg px-3 py-1.5 text-[11px] text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={request.preferredDate}
                    onChange={(e) =>
                      handleChange("preferredDate", e.target.value)
                    }
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-300">เวลาที่สะดวก (โดยประมาณ)</span>
                  <input
                    type="time"
                    className="bg-[#020617] border border-[#374151] rounded-lg px-3 py-1.5 text-[11px] text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={request.preferredTime}
                    onChange={(e) =>
                      handleChange("preferredTime", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-300">ช่องทางที่ต้องการ</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "in-person", label: "พบที่ห้องอาจารย์" },
                    { id: "chat", label: "แชทใน Portal" },
                    { id: "video", label: "วิดีโอคอล" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChange("channel", opt.id)}
                      className={`px-3 py-1.5 rounded-full border text-[11px] ${
                        request.channel === opt.id
                          ? "border-violet-500 bg-violet-600/20 text-violet-100"
                          : "border-[#374151] text-gray-300 hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] flex items-center gap-1"
                >
                  ส่งคำขอปรึกษา (mock)
                </button>
              </div>
            </div>

            {/* Quick Templates / Emergency */}
            <div className="space-y-3">
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2">
                <div className="text-gray-300 mb-1">
                  Template หัวข้อยอดนิยม
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "ปรึกษาเรื่องลงทะเบียนเรียน/เพิ่ม-ถอนวิชา",
                    "ปรึกษาเรื่องเกรดและแผนการเรียน",
                    "ปรึกษาเรื่องเวลาเรียนกับงานพิเศษ",
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleQuickFill(t)}
                      className="px-2 py-1 rounded-full border border-[#374151] text-[10px] text-gray-300 hover:bg-slate-800 text-left"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-red-500/40 bg-red-900/10 px-3 py-2 flex gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5" />
                <div>
                  <div className="text-[11px] text-red-300 font-semibold">
                    กรณีฉุกเฉิน / เครียดมากผิดปกติ
                  </div>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    หากคุณรู้สึกเครียดมาก ซึมเศร้า หรือมีปัญหาส่วนตัวรุนแรง
                    ควรรีบติดต่ออาจารย์ที่ปรึกษาโดยตรง หรือแจ้งอาจารย์ประจำวิชา/งานแนะแนวของวิทยาลัยทันที
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FAQ / คำถามที่พบบ่อย ===== */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-100 mb-1">
            <Info size={14} className="text-violet-400" />
            คำถามที่พบบ่อยเกี่ยวกับการปรึกษาอาจารย์ที่ปรึกษา
          </div>
          <div className="space-y-1">
            {mockFaq.map((item) => {
              const open = selectedFaq === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full text-left rounded-xl border border-[#1f2937] bg-[#020617] px-3 py-2 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-100">
                      {item.q}
                    </span>
                    <ChevronRight
                      size={12}
                      className={`text-gray-500 transition-transform ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {open && (
                    <p className="mt-1 text-[11px] text-gray-400">
                      {item.a}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
