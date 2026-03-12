// frontend/src/pages/Organization.jsx
import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { Users, ChevronRight, Search, Loader } from "lucide-react"
import { apiClient } from "../utils/api"

export default function Organization() {
  const [search, setSearch] = useState("")
  const [chain, setChain] = useState([])
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const fallbackChain = [
    {
      level: "ที่ปรึกษา",
      role: "ครูที่ปรึกษา",
      name: "อ.ณัฐวุฒิ จันทร์ศรี",
      unit: "สาขาเทคโนโลยีสารสนเทศ",
    },
    {
      level: "หัวหน้าแผนก",
      role: "หัวหน้าแผนก IT",
      name: "อ.สุภาวดี อินทร์ชัย",
      unit: "แผนกเทคโนโลยีสารสนเทศ",
    },
    {
      level: "หัวหน้างาน",
      role: "หัวหน้างานวิชาการ",
      name: "อ.กุลวดี สารสุข",
      unit: "ฝ่ายวิชาการ",
    },
    {
      level: "ผู้บริหาร",
      role: "รองผู้อำนวยการฝ่ายวิชาการ",
      name: "อ.พิชญา วรากร",
      unit: "ทีมบริหาร",
    },
  ]
  const fallbackLeaders = [
    {
      id: "director-1",
      name: "ผอ.กิตติพงษ์ วัฒนชัย",
      role: "ผู้อำนวยการวิทยาลัย",
      type: "director",
      highlight: true,
      photo: "/images/org/director.png",
    },
    {
      id: "deputy-1",
      name: "อ.ปรียานุช ศรีอ่อน",
      role: "รองผู้อำนวยการฝ่ายวิชาการ",
      type: "deputy",
      highlight: false,
      photo: "/images/org/dep1.png",
    },
    {
      id: "deputy-2",
      name: "อ.กมลวรรณ คำภา",
      role: "รองผู้อำนวยการฝ่ายบริหารทรัพยากร",
      type: "deputy",
      highlight: false,
      photo: "/images/org/dep2.png",
    },
    {
      id: "deputy-3",
      name: "อ.ธนภัทร สุวรรณ",
      role: "รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียน",
      type: "deputy",
      highlight: false,
      photo: "/images/org/dep3.png",
    },
    {
      id: "deputy-4",
      name: "อ.จารุวรรณ สุขสันต์",
      role: "รองผู้อำนวยการฝ่ายแผนงานและความร่วมมือ",
      type: "deputy",
      highlight: false,
      photo: "/images/org/dep4.png",
    },
  ]

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      setError("")

      // Call backend API to get organization data
      const response = await apiClient.get("/organization")

      // API returns object with chain and leaders directly
      if (response && typeof response === 'object') {
        const nextChain = Array.isArray(response.chain) && response.chain.length > 0
          ? response.chain
          : fallbackChain
        const nextLeaders = Array.isArray(response.leaders) && response.leaders.length > 0
          ? response.leaders
          : fallbackLeaders
        setChain(nextChain)
        setLeaders(nextLeaders)
      } else {
        throw new Error("Invalid organization data received")
      }
    } catch (err) {
      console.error("Error fetching organization:", err)
      setError("")
      setChain(fallbackChain)
      setLeaders(fallbackLeaders)
    } finally {
      setLoading(false)
    }
  }

  const [roleFilter, setRoleFilter] = useState("all") // all | director | deputy
  const searchLower = search.trim().toLowerCase()

  const filteredLeaders = leaders
    .filter((l) => !l.highlight)
    .filter((l) => (roleFilter === "all" ? true : l.type === roleFilter))
    .filter((l) => {
      if (!searchLower) return true
      return (
        l.name.toLowerCase().includes(searchLower) ||
        l.role.toLowerCase().includes(searchLower)
      )
    })

  return (
    <PageShell
      title="Organization"
      subtitle="โครงสร้างการดูแลในสายการเรียนของคุณ และผู้บริหารที่เกี่ยวข้อง"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 rounded-2xl border border-[#1f2937] bg-[#020617] p-5">
          <Loader size={20} className="animate-spin text-violet-400" />
          <span className="text-gray-400">โหลดโครงสร้างองค์กร...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300 rounded-2xl">
          {error}
        </div>
      ) : (
      <div className="space-y-6">
        {/* ===== SECTION 1: สายการดูแลของคุณ ===== */}
        <section className="rounded-2xl border border-[#1f2937] bg-[#020617] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-100">
                สายการดูแลของคุณ (Student Support Chain)
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                ลำดับบุคลากรที่คุณสามารถติดต่อเมื่อมีปัญหาการเรียน / การใช้ชีวิตในวิทยาลัย
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-6 sm:grid-cols-[1.2fr,1fr] md:grid-cols-[1.2fr,1fr]">
            {/* Timeline ทางซ้าย */}
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-[#1f2937]" />
              <div className="space-y-4">
                {chain.map((item, idx) => (
                  <div key={idx} className="relative pl-7">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-violet-500 border border-[#020617]" />
                    <div className="flex items-center gap-2 text-[11px] text-violet-300 mb-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/40">
                        {item.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-100 font-medium">
                      {item.role} • {item.name}
                    </div>
                    <div className="text-[11px] text-gray-400">{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* กล่องสรุปทางขวา */}
            <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-4 text-[11px] text-gray-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-100 mb-1">
                <Users size={14} className="text-violet-400" />
                ช่องทางติดต่อหลัก (ตัวอย่าง)
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  ปัญหาการบ้าน / เนื้อหาในรายวิชา → ติดต่ออาจารย์ผู้สอน หรือที่ปรึกษา
                </li>
                <li>
                  ปัญหาทุนการศึกษา / ทะเบียน → ติดต่อฝ่ายงานทะเบียน – ทุน
                </li>
                <li>
                  ปัญหาสุขภาพจิต / การปรับตัว → ติดต่อครูที่ปรึกษา หรือศูนย์ให้คำปรึกษา
                </li>
              </ul>
              <div className="mt-2 p-2 rounded-lg border border-violet-500/30 bg-violet-600/5 text-[11px]">
                <div className="font-semibold text-violet-200 mb-0.5">
                  แนะนำลำดับการติดต่อเมื่อมีปัญหา
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-300">
                  <li>เริ่มจากครูที่ปรึกษา / อาจารย์ประจำวิชา</li>
                  <li>หากยังแก้ปัญหาไม่ได้ ติดต่อหัวหน้างาน/หัวหน้าแผนก</li>
                  <li>กรณีมีผลกระทบมาก เช่น พักการเรียน ให้ติดต่อฝ่ายบริหารที่เกี่ยวข้อง</li>
                </ol>
              </div>
              <p className="text-[10px] text-gray-500 pt-1">
                * เมื่อเชื่อมต่อกับ API จริง สามารถดึงข้อมูลสายการดูแลของนักศึกษาแต่ละคนจากระบบกลางมาแสดงอัตโนมัติได้
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: ผู้บริหารวิทยาลัย / โปรแกรม ===== */}
        <section className="rounded-2xl border border-[#1f2937] bg-[#020617] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-100">
                ผู้บริหารวิทยาลัย / ทีมบริหารที่เกี่ยวข้องกับสายการเรียนของคุณ
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                แสดงโครงสร้างผู้บริหารในรูปแบบการ์ด สามารถปรับเป็นข้อมูลจริงจากฐานข้อมูลได้
              </p>
            </div>
          </div>

          {/* Director การ์ดใหญ่ด้านบน */}
          <div className="flex justify-center mb-6">
            {leaders
              .filter((l) => l.highlight)
              .map((leader) => (
                <div
                  key={leader.id}
                  className="w-full max-w-xs rounded-2xl border border-[#1f2937] bg-gradient-to-b from-violet-500/40 via-violet-600/30 to-[#020617] p-4 flex flex-col items-center"
                >
                  <div className="w-40 h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-violet-300 to-violet-600 mb-3">
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-100 text-center">
                    {leader.name}
                  </div>
                  <div className="text-[11px] text-gray-200 text-center mt-1">
                    {leader.role}
                  </div>
                  <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-[10px] text-amber-200">
                    ผู้อำนวยการวิทยาลัย
                  </span>
                </div>
              ))}
          </div>

          {/* แถว filter + search สำหรับรองผู้อำนวยการ */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 text-[11px]">
            <div className="inline-flex items-center gap-1 bg-[#020617] border border-[#1f2937] rounded-full p-1">
              <FilterChip
                active={roleFilter === "all"}
                onClick={() => setRoleFilter("all")}
              >
                ทั้งหมด
              </FilterChip>
              <FilterChip
                active={roleFilter === "director"}
                onClick={() => setRoleFilter("director")}
              >
                ผอ. / Director
              </FilterChip>
              <FilterChip
                active={roleFilter === "deputy"}
                onClick={() => setRoleFilter("deputy")}
              >
                รองผู้อำนวยการ
              </FilterChip>
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                className="w-full bg-[#020617] border border-[#1f2937] rounded-full pl-7 pr-3 py-1.5 text-[11px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="ค้นหาชื่อ / ตำแหน่งผู้บริหาร..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* รองผู้อำนวยการ / ทีมบริหาร แถวล่าง */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredLeaders.length === 0 ? (
              <div className="text-[11px] text-gray-500 col-span-full py-4 text-center border border-dashed border-[#1f2937] rounded-xl">
                ไม่พบผู้บริหารที่ตรงกับเงื่อนไขการค้นหา
              </div>
            ) : (
              filteredLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="rounded-2xl border border-[#1f2937] bg-[#020617] overflow-hidden flex flex-col items-center pb-3"
                >
                  <div className="w-full h-52 bg-gradient-to-b from-violet-300 to-violet-600">
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 pt-2 text-center">
                    <div className="text-sm font-semibold text-gray-100 leading-snug">
                      {leader.name}
                    </div>
                    <div className="text-[10px] text-gray-300 mt-1 leading-snug">
                      {leader.role}
                    </div>
                    <span className="inline-flex mt-2 px-2 py-0.5 rounded-full border border-[#374151] text-[10px] text-gray-400">
                      {leader.type === "deputy"
                        ? "รองผู้อำนวยการ"
                        : "ผู้อำนวยการ"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-[#374151] text-gray-300 hover:bg-slate-900">
              ดูโครงสร้างทั้งหมดจากเว็บไซต์หลัก
              <ChevronRight size={12} />
            </button>
          </div>
        </section>
      </div>
      )}
    </PageShell>
  )
}

// ปุ่ม filter เล็ก ๆ
function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] transition ${
        active
          ? "bg-violet-600 text-white"
          : "bg-transparent text-gray-300 hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  )
}
