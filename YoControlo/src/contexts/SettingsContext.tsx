// src/contexts/SettingsContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const STORAGE_KEY = "appSettings"

export interface SettingsState {
  darkMode: boolean
  sonido: boolean
  volumen: number
  vibracion: boolean
  notificaciones: boolean
}

interface SettingsContextType {
  settings: SettingsState
  setSettings: (settings: SettingsState) => void
  toggleDarkMode: () => void
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
    return {
      darkMode: false,
      sonido: true,
      volumen: 50,
      vibracion: true,
      notificaciones: true,
    }
  })

  // Aplicar dark mode a todo el html
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  // Guardar en localStorage cuando cambien los settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))
  }

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const value = {
    settings,
    setSettings,
    toggleDarkMode,
    updateSetting
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}