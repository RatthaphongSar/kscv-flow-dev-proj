// src/components/CampusMap.jsx
import { useState } from "react"

/**
 * props:
 * - imageSrc: path ของรูปพื้นหลัง (เช่น "/images/campus.jpg")
 * - buildings: [{ id, name, points: [[x,y], ...] }], ค่าพิกัดเป็นสเกล 0..1000
 *   เพื่อให้ responsive โดยไม่ต้องแก้ตามขนาดจริง
 */
export default function CampusMap({ imageSrc, buildings = [] }) {
  const [hover, setHover] = useState(null)

  return (
    <div className="relative w-full overflow-hidden rounded-xl border shadow-sm bg-black">
      {/* รูปพื้นหลัง */}
      <img
        src={imageSrc}
        alt="แผนผังวิทยาลัย"
        className="w-full h-[420px] object-cover opacity-90"
      />

      {/* SVG overlay เส้นสีเหลือง */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {buildings.map((b) => (
          <polyline
            key={b.id}
            points={b.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="#FFD400"
            strokeWidth="10"
            vectorEffect="non-scaling-stroke"
            opacity="0.95"
          />
        ))}
      </svg>

      {/* hit-area สำหรับ hover/tooltip (ซ้อนทับ svg เพราะ svg ตั้ง pointer-events:none) */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {buildings.map((b) => (
            <polygon
              key={b.id}
              points={b.points.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="transparent"
              stroke="transparent"
              onMouseEnter={() => setHover(b)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            />
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {hover && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg border shadow text-sm">
          <div className="font-semibold text-primary">{hover.name}</div>
          <div className="text-slate-600">คลิกเพื่อดูรายละเอียด (เชื่อมหน้า Organization/Resources ได้)</div>
        </div>
      )}
    </div>
  )
}
