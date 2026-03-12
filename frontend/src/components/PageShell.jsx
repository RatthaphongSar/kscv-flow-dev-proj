// frontend/src/components/PageShell.jsx
import { useTheme } from './ThemeProvider'
import { useI18n } from '../context/I18nContext'

export default function PageShell({ title, subtitle, right, children }) {
  const { theme } = useTheme()
  const { translateText } = useI18n()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  const isLight = theme === 'light' || (theme === 'system' && prefersLight)

  const translatedTitle = translateText(title)
  const translatedSubtitle = translateText(subtitle)

  return (
    <div className={`w-full h-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 flex flex-col overflow-hidden ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#020617] text-gray-100'}`}>
      {/* จำกัดความกว้างกลางจอ + จัดเป็นคอลัมน์ */}
      <div className="w-full max-w-[1200px] 2xl:max-w-[1400px] mx-auto flex flex-col gap-4 sm:gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Header ของแต่ละหน้า */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className={`text-lg sm:text-xl lg:text-2xl font-semibold ${isLight ? 'text-slate-900' : 'text-gray-100'}`}>{translatedTitle}</h1>
            {translatedSubtitle && (
              <p className={`text-[11px] sm:text-xs lg:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{translatedSubtitle}</p>
            )}
          </div>

          {right && (
            <div className={`text-[11px] sm:text-xs sm:text-right ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              {right}
            </div>
          )}
        </div>

        {/* Content zone → ให้เป็นตัว scroll, พื้นหลังเข้มเหมือนหน้าอื่น */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}
