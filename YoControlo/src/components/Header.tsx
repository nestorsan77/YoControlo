// src/components/Header.tsx
import { Link } from "react-router-dom"
import { BsGear } from "react-icons/bs"
import { useSettings } from "../contexts/SettingsContext"

export default function Header() {
  const { settings } = useSettings()

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
      settings.darkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Mi App</h1>
        <Link 
          to="/settings"
          className={`p-2 rounded-lg transition-colors duration-200 ${
            settings.darkMode 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <BsGear size={20} />
        </Link>
      </div>
    </header>
  )
}