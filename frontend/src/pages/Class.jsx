// frontend/src/pages/Class.jsx
import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Users,
  X,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// รายวิชาตัวอย่าง
const mockClasses = [
  {
    id: "c1",
    code: "ENG-101",
    name: "English for Communication",
    teacher: "Aj. Supaporn",
    section: "Sec 1",
    day: "Mon / Wed",
    time: "09:00 - 10:30",
    room: "KVC-302",
    credits: 3,
  },
  {
    id: "c2",
    code: "CS-201",
    name: "Web Application Development",
    teacher: "Aj. Kritsada",
    section: "Sec 2",
    day: "Tue / Thu",
    time: "13:00 - 15:00",
    room: "Lab-105",
    credits: 3,
  },
  {
    id: "c3",
    code: "MA-110",
    name: "Business Mathematics",
    teacher: "Aj. Ratchanee",
    section: "Sec 1",
    day: "Fri",
    time: "10:00 - 12:00",
    room: "KVC-210",
    credits: 2,
  },
];

// งานที่ได้รับมอบหมาย (mock)
const mockAssignmentsByClass = {
  c1: [
    {
      id: "a1",
      title: "Essay: My Future Plan",
      description:
        "เขียนเรียงความภาษาอังกฤษ หัวข้อ “My Future Career Plan” ความยาวประมาณ 1 – 2 หน้า A4 ให้เน้นโครงสร้าง Introduction / Body / Conclusion",
      type: "งานเขียน",
      givenAt: "2025-03-15",
      dueDate: "2025-03-22",
      status: "not_submitted",
      submittedAt: null,
      files: [],
    },
    {
      id: "a2",
      title: "Vocabulary Quiz Preparation",
      description:
        "เตรียมคำศัพท์จาก Unit 3 – 4 พร้อมแปลความหมาย และแต่งประโยคตัวอย่าง อย่างน้อย 10 คำ",
      type: "แบบฝึกหัด",
      givenAt: "2025-03-20",
      dueDate: "2025-03-25",
      status: "not_submitted",
      submittedAt: null,
      files: [],
    },
  ],
  c2: [
    {
      id: "a3",
      title: "Mini Project: Simple Todo API",
      description:
        "พัฒนา REST API (Node.js / Express) สำหรับระบบ Todo List มี endpoint สำหรับสร้าง / แก้ไข / ลบ / ดึงรายการ และแนบไฟล์ Postman Collection หรือ Swagger",
      type: "โครงงานย่อย",
      givenAt: "2025-03-18",
      dueDate: "2025-03-28",
      status: "not_submitted",
      submittedAt: null,
      files: [],
    },
  ],
  c3: [
    {
      id: "a4",
      title: "Worksheet: Business Math #1",
      description:
        "ทำใบงานเรื่อง ดอกเบี้ยอย่างง่าย และมูลค่าเงินในอนาคต ส่งเป็นไฟล์ Excel หรือ PDF",
      type: "ใบงาน",
      givenAt: "2025-03-10",
      dueDate: "2025-03-17",
      status: "not_submitted",
      submittedAt: null,
      files: [],
    },
  ],
};

// format date
function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClassPage() {
  const [selectedId, setSelectedId] = useState(mockClasses[0].id);
  const [activeTab, setActiveTab] = useState("overview");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [assignmentData, setAssignmentData] = useState(() => {
    const clone = {};
    for (const [cid, arr] of Object.entries(mockAssignmentsByClass)) {
      clone[cid] = arr.map((a) => ({ ...a }));
    }
    return clone;
  });

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const selectedClass =
    mockClasses.find((c) => c.id === selectedId) || mockClasses[0];

  const currentAssignments = assignmentData[selectedClass.id] || [];

  const selectedAssignment =
    currentAssignments.find((a) => a.id === selectedAssignmentId) ||
    currentAssignments[0] ||
    null;

  useEffect(() => {
    const list = assignmentData[selectedId] || [];
    setSelectedAssignmentId(list[0]?.id ?? null);
  }, [selectedId, assignmentData]);

  useEffect(() => {
    if (activeTab !== "assignment") return;
    if (!selectedAssignmentId && currentAssignments.length > 0) {
      setSelectedAssignmentId(currentAssignments[0].id);
    }
  }, [activeTab, currentAssignments, selectedAssignmentId]);

  // submit file mock
  const handleUploadFiles = (classId, assignmentId, fileList) => {
    const filesArray = Array.from(fileList || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    if (filesArray.length === 0) return;

    setAssignmentData((prev) => {
      const next = { ...prev };
      const list = (next[classId] || []).map((a) => {
        if (a.id !== assignmentId) return a;

        const now = new Date();
        const due = new Date(a.dueDate + "T23:59:59");
        const isLate = now > due;

        return {
          ...a,
          status: isLate ? "late" : "submitted",
          submittedAt: now.toISOString(),
          files: filesArray,
        };
      });
      next[classId] = list;
      return next;
    });
  };

  const renderStatusBadge = (assignment) => {
    if (!assignment) return null;
    if (assignment.status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[11px]">
          <CheckCircle2 size={12} />
          ส่งแล้ว
        </span>
      );
    }
    if (assignment.status === "late") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-[11px]">
          <AlertCircle size={12} />
          ส่งแล้ว (เกินกำหนด)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-200 border border-slate-600 text-[11px]">
        ยังไม่ส่ง
      </span>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#020617] flex">

      {/* Sidebar */}
      <aside className="w-72 h-full border-r border-[#1f2937] bg-[#020617] flex flex-col">
        <div className="px-4 py-3 border-b border-[#1f2937]">
          <h1 className="text-sm font-semibold text-gray-100">รายวิชา</h1>
          <p className="text-[11px] text-gray-400">
            วิชาที่ลงทะเบียนในภาคการศึกษานี้
          </p>
        </div>

        <div className="px-3 py-3">
          <input
            className="w-full bg-[#020617] border border-[#374151] rounded-md px-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="ค้นหารายวิชา..."
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {mockClasses.map((cls) => {
            const active = cls.id === selectedId;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedId(cls.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs mb-1 transition
                  ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-transparent text-gray-200 hover:bg-slate-800"
                  }`}
              >
                <div className="font-semibold text-[13px]">{cls.code}</div>
                <div className="text-[11px] truncate">{cls.name}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {cls.day} · {cls.time}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 h-full flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#020617]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-100">
                {selectedClass.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                {selectedClass.code} • {selectedClass.section}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              อาจารย์ผู้สอน: {selectedClass.teacher} • {selectedClass.day} •{" "}
              {selectedClass.time} • ห้อง {selectedClass.room}
            </p>
          </div>

          <button
            className="hidden md:flex px-3 py-1.5 rounded-md border border-[#374151] hover:bg-slate-800 text-[11px]"
            onClick={() => setIsScheduleOpen(true)}
          >
            ดูตารางเรียนวิชานี้
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-[#1f2937] bg-[#020617]">
          <div className="flex gap-4 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 border-b-2 ${
                activeTab === "overview"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              ภาพรวม
            </button>

            <button
              onClick={() => setActiveTab("assignment")}
              className={`pb-2 border-b-2 flex items-center gap-1 ${
                activeTab === "assignment"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <FileText size={14} />
              งานที่ได้รับมอบหมาย
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`pb-2 border-b-2 flex items-center gap-1 ${
                activeTab === "attendance"
                  ? "border-violet-500 text-gray-100"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Users size={14} />
              การเข้าเรียน
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          <div className="grid gap-4 md:grid-cols-2">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">ข้อมูลรายวิชา</h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>รหัสวิชา: {selectedClass.code}</li>
                    <li>ชื่อวิชา: {selectedClass.name}</li>
                    <li>อาจารย์ผู้สอน: {selectedClass.teacher}</li>
                    <li>หน่วยกิต: {selectedClass.credits}</li>
                    <li>
                      วัน–เวลาเรียน: {selectedClass.day} · {selectedClass.time}
                    </li>
                    <li>ห้องเรียน: {selectedClass.room}</li>
                  </ul>
                </div>

                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">
                    สรุปความคืบหน้า (ตัวอย่าง)
                  </h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>งานที่ส่งแล้ว: 3 / 5 ชิ้น</li>
                    <li>สถานะการเข้าเรียน: 90%</li>
                    <li>คะแนนเก็บปัจจุบัน: 28 / 40</li>
                  </ul>
                  <p className="text-[11px] text-gray-500 mt-3">
                    * ข้อมูลจริงจะเชื่อมต่อจาก API หลังบ้าน
                  </p>
                </div>
              </>
            )}

            {/* ASSIGNMENT */}
            {activeTab === "assignment" && (
              <>
                {/* Assignment List */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3">
                    รายการงานที่ได้รับมอบหมาย
                  </h3>

                  {currentAssignments.length === 0 ? (
                    <p className="text-[11px] text-gray-400">
                      ยังไม่มีงานที่ถูกมอบหมายในวิชานี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentAssignments.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedAssignmentId(a.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                            selectedAssignment && selectedAssignment.id === a.id
                              ? "border-violet-500 bg-violet-600/20"
                              : "border-[#1f2937] bg-[#020617] hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[13px]">
                              {a.title}
                            </span>
                            {renderStatusBadge(a)}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span>
                              ประเภท: <span className="text-gray-300">{a.type}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              กำหนดส่ง: {formatDate(a.dueDate)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-gray-500">
                    * UI ตัวอย่าง – เชื่อมหลังบ้านเมื่อพร้อม
                  </p>
                </div>

                {/* Assignment Detail */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3">
                    รายละเอียดงาน & การส่งไฟล์
                  </h3>

                  {!selectedAssignment ? (
                    <p className="text-[11px] text-gray-400">
                      เลือกงานจากด้านซ้ายเพื่อดูรายละเอียดและส่งไฟล์
                    </p>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3">

                      <div>
                        <p className="text-[11px] text-gray-400 mb-1">ชื่องาน</p>
                        <p className="text-sm font-semibold text-gray-100">
                          {selectedAssignment.title}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">
                            วันที่มอบหมาย
                          </p>
                          <p>{formatDate(selectedAssignment.givenAt)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">
                            กำหนดส่ง
                          </p>
                          <p>{formatDate(selectedAssignment.dueDate)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">
                          คำสั่งจากอาจารย์
                        </p>
                        <p className="text-[12px] leading-relaxed text-gray-200">
                          {selectedAssignment.description}
                        </p>
                      </div>

                      <div className="border-t border-[#1f2937] pt-3 mt-1">
                        <p className="text-[11px] text-gray-400 mb-1">
                          สถานะการส่งงาน
                        </p>
                        {renderStatusBadge(selectedAssignment)}
                        {selectedAssignment.submittedAt && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            ส่งล่าสุดเมื่อ{" "}
                            {new Date(
                              selectedAssignment.submittedAt
                            ).toLocaleString("th-TH")}
                          </p>
                        )}
                      </div>

                      {/* Upload */}
                      <div className="border-t border-[#1f2937] pt-3 mt-1">
                        <p className="text-[11px] text-gray-400 mb-1">
                          แนบไฟล์ส่งงาน
                        </p>

                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#374151] hover:border-violet-500 hover:bg-violet-600/10 cursor-pointer text-[11px] text-gray-200">
                          <Upload size={14} />
                          <span>เลือกไฟล์จากเครื่องของคุณ</span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                            onChange={(e) =>
                              handleUploadFiles(
                                selectedClass.id,
                                selectedAssignment.id,
                                e.target.files
                              )
                            }
                          />
                        </label>

                        <p className="mt-1 text-[10px] text-gray-500">
                          * ตัวอย่างการส่งงานจริง – รอเชื่อม API
                        </p>
                      </div>

                      {/* Uploaded Files */}
                      {selectedAssignment.files &&
                        selectedAssignment.files.length > 0 && (
                          <div className="border-t border-[#1f2937] pt-3 mt-1">
                            <p className="text-[11px] text-gray-400 mb-1">
                              ไฟล์ที่แนบแล้ว
                            </p>
                            <ul className="text-[11px] text-gray-200 space-y-1">
                              {selectedAssignment.files.map((f, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center justify-between rounded-md bg-slate-900/70 px-2 py-1"
                                >
                                  <span className="truncate">{f.name}</span>
                                  <span className="text-[10px] text-gray-500 ml-2">
                                    {(f.size / 1024).toFixed(1)} KB
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Attendance */}
            {activeTab === "attendance" && (
              <>
                <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs text-gray-300">
                  <h3 className="text-sm font-semibold mb-3">การเข้าเรียน</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>จำนวนครั้งเรียนทั้งหมด (mock)</li>
                    <li>จำนวนครั้งที่เข้าชั้นเรียน / ขาด / มาสาย</li>
                    <li>เปอร์เซ็นต์การเข้าเรียนรวม</li>
                  </ul>
                  <p className="text-[11px] text-gray-500 mt-3">
                    * รอเชื่อมระบบ Checkline จริง
                  </p>
                </div>

                <div className="hidden md:block"></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Popup ตารางเรียน (แบบ FULL UPGRADE) */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
              <span className="text-sm text-gray-100 flex items-center gap-2">
                <Calendar size={16} className="text-violet-400" /> 
                ตารางเรียน • {selectedClass.name}
              </span>
              <button className="p-1 rounded-md hover:bg-slate-800" onClick={() => setIsScheduleOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 text-xs text-gray-300 space-y-5">

              {/* COURSE SUMMARY */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1f2937] p-3 bg-[#020617]">
                  <h4 className="text-[11px] text-gray-400">รายวิชา</h4>
                  <p className="text-sm font-semibold text-gray-100">{selectedClass.name}</p>
                  <p className="text-[11px] text-gray-400">{selectedClass.code} • {selectedClass.section}</p>
                </div>

                <div className="rounded-xl border border-[#1f2937] p-3 bg-[#020617]">
                  <h4 className="text-[11px] text-gray-400">อาจารย์ผู้สอน</h4>
                  <p className="text-sm font-semibold text-gray-100">{selectedClass.teacher}</p>
                  <p className="text-[11px] text-gray-400">ห้อง {selectedClass.room}</p>
                </div>
              </div>

              {/* WEEKLY TIMETABLE */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">ตารางเรียนรายสัปดาห์</h4>

                <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span>
                  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => {
                    const isClassDay = selectedClass.day.includes(d.slice(0,3));
                    return (
                      <div
                        key={d}
                        className={`h-10 rounded-md border text-[10px] flex items-center justify-center
                          ${
                            isClassDay
                              ? "border-violet-500 bg-violet-600/20 text-violet-200"
                              : "border-[#1f2937] bg-slate-900/40"
                          }
                        `}
                      >
                        {isClassDay ? selectedClass.time : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UPCOMING */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">คาบเรียนถัดไป</h4>
                <p>{selectedClass.day} • {selectedClass.time}</p>
                <p className="text-[11px] text-gray-400">ห้อง {selectedClass.room}</p>
              </div>

              {/* EXAMS */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">กำหนดการสอบ (ตัวอย่าง)</h4>
                <ul className="text-[11px] space-y-1">
                  <li>Midterm: 15 เม.ย. 2025 • 10:00 – 11:30</li>
                  <li>Final: 20 มิ.ย. 2025 • 09:00 – 11:00</li>
                </ul>
              </div>

              {/* ATTENDANCE STATS */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-3">สรุปการเข้าเรียน</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40">
                    <p className="text-xl font-bold text-emerald-300">12</p>
                    <p className="text-[10px]">เข้าเรียน</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-600/20 border border-yellow-500/40">
                    <p className="text-xl font-bold text-yellow-300">2</p>
                    <p className="text-[10px]">สาย</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/40">
                    <p className="text-xl font-bold text-red-300">1</p>
                    <p className="text-[10px]">ขาดเรียน</p>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4">
                <h4 className="text-sm font-semibold mb-2">โน้ตการเรียนรายวิชา</h4>
                <textarea
                  className="w-full bg-[#0f172a] border border-[#1f2937] rounded-lg p-2 text-xs h-20 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="บันทึกโน้ต หรือสิ่งที่ต้องเตรียมตัว..."
                ></textarea>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => alert('(mock) ดาวน์โหลด PDF')}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-violet-600 hover:bg-violet-500"
                >
                  ดาวน์โหลด PDF
                </button>

                <button
                  onClick={() => alert('(mock) เพิ่มลง Google Calendar')}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-[#374151] hover:bg-slate-800"
                >
                  เพิ่มลง Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
