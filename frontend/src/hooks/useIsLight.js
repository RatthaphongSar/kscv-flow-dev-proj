// Shared hook for detecting light/dark theme
import { useTheme } from '../components/ThemeProvider'

export function useIsLight() {
  const { theme } = useTheme()
  const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  return theme === 'light' || (theme === 'system' && prefersLight)
}
