import { createContext, type ReactNode, useEffect, useState } from "react"
import { STORAGE_KEY, type SettingsState, defaultSettings } from "./SettingsUtils"

interface SettingsContextProps {
  settings: SettingsState;
  setSettings: (newSettings: SettingsState) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);



export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const initialSettings = saved ? JSON.parse(saved) : defaultSettings

    // ✅ Aplica dark mode inmediatamente al montar
    if (initialSettings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    return initialSettings
  })

  // Guardar cambios en localStorage y actualizar dark mode en tiempo real
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

    if (settings.darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [settings])

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
