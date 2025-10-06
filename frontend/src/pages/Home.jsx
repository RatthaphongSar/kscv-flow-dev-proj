import { Search, ChevronRight } from "lucide-react"
import Slider from "react-slick"
import CampusMap from "../components/CampusMap"

export default function Home() {
  const slides = [
    { id: 1, img: "/images/news1.jpg", title: "โครงการปฐมนิเทศนักศึกษาใหม่", desc: "ต้อนรับนักศึกษาใหม่ ประจำปีการศึกษา 2568" },
    { id: 2, img: "/images/news2.jpg", title: "การแข่งขันทักษะวิชาชีพ", desc: "นักศึกษาคว้ารางวัลระดับประเทศ" },
    { id: 3, img: "/images/news3.jpg", title: "กิจกรรมเปิดโลกวิชาการ", desc: "แนะนำหลักสูตรและอาชีพในอนาคต" }
  ]

const courses = [
  { id: 1,  name: "เทคโนโลยีสารสนเทศ", desc: "พัฒนาเว็บ/แอป, เครือข่าย, ความปลอดภัย" },
  { id: 2,  name: "ดิจิทัลมีเดีย",       desc: "กราฟิกโมชั่น, UI/UX, ตัดต่อวิดีโอ" },
  { id: 3,  name: "วิศวกรรมซอฟต์แวร์",  desc: "เขียนโปรแกรม, DevOps, ทดสอบซอฟต์แวร์" },
  { id: 4,  name: "ช่างอิเล็กทรอนิกส์",  desc: "วงจร, ไมโครคอนโทรลเลอร์, IoT" },
  { id: 5,  name: "ช่างไฟฟ้ากำลัง",      desc: "ระบบไฟฟ้า, ติดตั้ง/ซ่อมบำรุง, ความปลอดภัย" },
  { id: 6,  name: "ช่างยนต์",            desc: "ซ่อมบำรุงเครื่องยนต์, ระบบไฟรถยนต์" },
  { id: 7,  name: "ช่างก่อสร้าง",        desc: "โครงสร้าง, สำรวจ, เขียนแบบ" },
  { id: 8,  name: "โลจิสติกส์",          desc: "ซัพพลายเชน, คลังสินค้า, ขนส่ง" },
  { id: 9,  name: "ธุรกิจค้าปลีก",       desc: "บริหารร้านค้า, POS, สต็อก" },
  { id:10,  name: "การตลาด",              desc: "ดิจิทัลมาร์เก็ตติ้ง, แบรนด์, กลยุทธ์" },
  { id:11,  name: "การบัญชี",             desc: "บัญชีการเงิน, ภาษี, ระบบบัญชี" },
  { id:12,  name: "การโรงแรมและท่องเที่ยว", desc: "บริการ, ที่พัก, มารยาทสากล" },
  { id:13,  name: "คหกรรม",               desc: "อาหารและโภชนาการ, การจัดเลี้ยง" },
  { id:14,  name: "ภาษาต่างประเทศ",      desc: "อังกฤษเพื่ออาชีพ, ภาษาจีนเบื้องต้น" },
  { id:15,  name: "ระบบเครือข่าย (ปวส.)", desc: "Routing/Switching, Cloud พื้นฐาน" },
]
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1
  }

  return (
    <section className="space-y-8">
      {/* ===== HERO (Dark, Neo-Blue) ===== */}
      <div className="relative overflow-hidden rounded-2xl border shadow-lg bg-[#0A1428] text-white">
        {/* นีออนลายคลื่นด้วย SVG */}
        <svg
          className="absolute -right-24 -top-24 w-[520px] h-[520px] opacity-40"
          viewBox="0 0 600 600" fill="none"
        >
          {[0,1,2,3,4].map((i)=>(
            <path key={i}
              d="M300,100 C430,110 520,200 520,300 C520,400 430,490 300,500 C170,490 80,400 80,300 C80,200 170,110 300,100 Z"
              transform={`scale(${1 + i*0.08}) translate(${-(i*24)}, ${-(i*24)})`}
              stroke="#4F8BFF" strokeOpacity={0.6 - i*0.1} strokeWidth="1.5" />
          ))}
        </svg>
        <svg
          className="absolute -left-28 bottom-[-80px] w-[520px] h-[520px] opacity-40"
          viewBox="0 0 600 600" fill="none"
        >
          {[0,1,2,3,4].map((i)=>(
            <path key={i}
              d="M300,120 C410,130 500,200 500,300 C500,400 410,470 300,480 C190,470 100,400 100,300 C100,200 190,130 300,120 Z"
              transform={`scale(${1 + i*0.08}) translate(${-(i*24)}, ${-(i*24)})`}
              stroke="#7CC4FF" strokeOpacity={0.55 - i*0.1} strokeWidth="1.5" />
          ))}
        </svg>

        <div className="relative z-10 px-6 py-12 md:px-10 lg:px-14 lg:py-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            {/* Copy */}
            <div>
              <p className="uppercase tracking-widest text-blue-200 text-xs mb-2">Kalasin Vocational College</p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Welcome<span className="text-blue-300">.</span>
              </h1>
              <p className="mt-3 text-blue-100">
                ยินดีต้อนรับสู่วิทยาลัยอาชีวศึกษากาฬสินธุ์ แหล่งเรียนรู้เพื่อทักษะวิชาชีพ
                และโอกาสในเส้นทางสายอาชีพอย่างมืออาชีพ
              </p>

              {/* Search bar style เดียวกับตัวอย่าง */}
              <form className="mt-6" onSubmit={(e)=>e.preventDefault()}>
                <div className="relative max-w-xl">
                  <Search className="absolute left-3 top-2.5" size={18} />
                  <input
                    className="w-full bg-transparent border rounded-full pl-10 pr-28 py-2.5 focus:outline-offset-2"
                    placeholder="ค้นหาหลักสูตร / ข่าวสาร / กิจกรรม"
                  />
                  <button className="absolute right-1 top-1 bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full hover:bg-white/20">
                    ค้นหา
                  </button>
                </div>
              </form>

              {/* CTA */}
              <div className="flex gap-3 mt-6">
                <a href="/register" className="bg-primary text-white px-4 py-2 rounded-full border border-white/10 hover:bg-[#0b56c0]">
                  สมัครบริการนักศึกษา
                </a>
                <a href="/announcements" className="px-4 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 flex items-center gap-1">
                  ดูข่าวสาร <ChevronRight size={16}/>
                </a>
              </div>
            </div>

            {/* แผงข้อความแนะนำฝั่งขวา */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-blue-100">Landing Panel</h3>
              <p className="mt-2 text-blue-200 text-sm">
                ระบบ Portal สำหรับนักศึกษาและอาจารย์: ตารางเรียน, การลา, งานที่มอบหมาย, แชทชุมชนตามสาขา/ชั้นปี,
                ผลการเรียน และประกาศข่าวสาร—all in one.
              </p>
              <ul className="mt-4 text-blue-100/90 text-sm list-disc pl-5 space-y-1">
                <li>ชุมชนอัตโนมัติตามปี/สาขา</li>
                <li>ยื่นลา: ป่วย 30 วัน (เกิน 2 วันแนบใบรับแพทย์), กิจ 7 วัน, บวช 60 วัน</li>
                <li>Assignment & Grades ครบวงจร</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NEWS SLIDER (สมมาตร ซ้ายรูป–ขวาข้อความ) ===== */}
      <div className="bg-white rounded-xl shadow-sm border p-4 relative overflow-hidden">
        <h2 className="text-xl font-semibold text-primary mb-4">ข่าวสารและกิจกรรม</h2>
        <Slider {...settings}>
          {slides.map((s) => (
            <div key={s.id}
              className="flex flex-col md:flex-row items-stretch gap-4 bg-surface rounded-lg overflow-hidden border"
            >
              {/* Image */}
              <div className="w-full md:w-1/2">
                <img src={s.img} alt={s.title} className="w-full h-64 md:h-72 object-cover" />
              </div>
              {/* Text */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-slate-600 text-sm mb-3">{s.desc}</p>
                <a href="/announcements" className="inline-flex items-center gap-1 text-primary hover:underline">
                  อ่านเพิ่มเติม <ChevronRight size={16}/>
                </a>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* ===== COURSES ===== */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
  <h2 className="text-xl font-semibold text-primary mb-4">หลักสูตรที่เปิดสอน</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {courses.map((c) => (
      <div key={c.id} className="p-4 border rounded-xl shadow-sm hover:shadow-md transition bg-surface">
        <h3 className="text-base font-bold text-primary mb-1">{c.name}</h3>
        <p className="text-sm text-slate-600">{c.desc}</p>
      </div>
    ))}
  </div>
</div>

{/* ===== CAMPUS MAP ===== */}
<div className="bg-white rounded-xl shadow-sm border p-4">
  <h2 className="text-xl font-semibold text-primary mb-4">แผนผังวิทยาลัย</h2>

  <CampusMap
    imageSrc="/images/campus.jpg"
    buildings={[
      // หมายเหตุ: ใช้พิกัด 0..1000 (ปรับแกนให้เข้ารูปคุณเองได้ตามจริง)
      // วงเส้นรอบนอก (ตัวอย่าง)
      { id: "outer", name: "รั้วรอบวิทยาลัย",
        points: [[40,70],[930,120],[960,880],[70,930],[40,70]] },

      // สนาม/โถงกลาง (ตัวอย่าง)
      { id: "court", name: "ลานกิจกรรม/สนาม",
        points: [[380,470],[710,470],[710,730],[380,730],[380,470]] },

      // อาคารยาวซ้าย (ตัวอย่าง)
      { id: "left-long", name: "อาคารเรียน (ฝั่งซ้าย)",
        points: [[60,130],[320,130],[320,870],[120,900],[60,130]] },

      // อาคารบน (ตัวอย่าง)
      { id: "top-block", name: "โรงอาหาร/อาคารปฏิบัติการ",
        points: [[350,220],[780,240],[780,300],[350,290],[350,220]] },

      // อาคารแนวยาวกลาง (ตัวอย่าง)
      { id: "mid-long", name: "อาคารเรียนกลาง",
        points: [[420,360],[770,360],[770,410],[420,410],[420,360]] },

      // อาคารล่าง (ตัวอย่าง)
      { id: "bottom-block", name: "อาคารฝ่ายบริหาร",
        points: [[120,820],[900,820],[900,900],[120,900],[120,820]] },
    ]}
  />

  <p className="text-xs text-slate-500 mt-2">
    *ตำแหน่งและสัดส่วนเป็นตัวอย่างเพื่อสาธิตการแสดงผล—สามารถปรับพิกัดให้ตรงกับสถานที่จริงได้โดยแก้ค่าในอาร์เรย์ <code>buildings</code>
  </p>
</div>
    </section>
  )
}


