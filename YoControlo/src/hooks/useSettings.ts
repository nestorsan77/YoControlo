// src/hooks/useSettings.ts
import { useState, useEffect } from "react"

const STORAGE_KEY = "appSettings"

export interface SettingsState {
  darkMode: boolean
  sonido: boolean
  volumen: number
  vibracion: boolean
  notificaciones: boolean
}

export function useSettings() {
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
    if (settings.darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [settings.darkMode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  return { settings, setSettings }
}
