// frontend/src/components/PageShell.jsx
export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="h-[calc(100vh-112px)] w-full bg-[#020617] text-gray-100 px-4 py-4">
      {/* จำกัดความกว้างกลางจอ + จัดเป็นคอลัมน์ */}
      <div className="h-full max-w-6xl mx-auto flex flex-col gap-4">
        {/* Header ของแต่ละหน้า */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          {right && (
            <div className="text-[11px] text-gray-500 text-right">
              {right}
            </div>
          )}
        </div>

        {/* Content zone → ให้เป็นตัว scroll, พื้นหลังเข้มเหมือนหน้าอื่น */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
