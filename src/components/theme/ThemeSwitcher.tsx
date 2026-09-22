import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

const themeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(mode: ThemeMode) {
  const resolvedTheme = mode === 'system' ? getSystemTheme() : mode
  document.documentElement.dataset.theme = resolvedTheme
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeOption = themeOptions.find((option) => option.value === mode) ?? themeOptions[2]
  const ActiveIcon = activeOption.icon

  useEffect(() => {
    const storedMode = window.localStorage.getItem('mise-theme') as ThemeMode | null
    const initialMode = storedMode && themeOptions.some((option) => option.value === storedMode) ? storedMode : 'system'
    setMode(initialMode)
    applyTheme(initialMode)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleSystemChange = () => {
      if (mode === 'system') applyTheme('system')
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [mode])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function selectTheme(nextMode: ThemeMode) {
    setMode(nextMode)
    window.localStorage.setItem('mise-theme', nextMode)
    applyTheme(nextMode)
    setIsOpen(false)
  }

  return (
    <div className="theme-switcher" ref={menuRef}>
      <button
        className="theme-trigger"
        type="button"
        aria-label={`Theme: ${activeOption.label}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ActiveIcon size={14} />
      </button>
      {isOpen && (
        <div className="theme-menu" role="menu" aria-label="Choose theme">
          {themeOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                className={`theme-option ${mode === option.value ? 'is-active' : ''}`}
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={mode === option.value}
                onClick={() => selectTheme(option.value)}
              >
                <span className="theme-option-icon"><Icon size={15} /></span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
