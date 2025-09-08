// src/pages/Settings.tsx
import { useSettings } from "../contexts/SettingsContext"
import { BsMoon, BsSun, BsVolumeUp, BsBell, BsPhone } from "react-icons/bs"
import LogoutButton from "../components/buttons/LogoutButton"

export default function Settings() {
  const { settings, updateSetting, toggleDarkMode } = useSettings()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Configuración</h1>
        
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.darkMode ? <BsMoon size={20} /> : <BsSun size={20} />}
                <div>
                  <h3 className="font-semibold">Modo Oscuro</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cambiar tema de la aplicación
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Sonido */}
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BsVolumeUp size={20} />
                <div>
                  <h3 className="font-semibold">Sonido</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Activar sonidos de la app
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.sonido}
                  onChange={(e) => updateSetting('sonido', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Volumen */}
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <BsVolumeUp size={20} />
                <div>
                  <h3 className="font-semibold">Volumen</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ajustar volumen: {settings.volumen}%
                  </p>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volumen}
                onChange={(e) => updateSetting('volumen', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                disabled={!settings.sonido}
              />
            </div>
          </div>

          {/* Vibración */}
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BsPhone size={20} />
                <div>
                  <h3 className="font-semibold">Vibración</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Activar vibración
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.vibracion}
                  onChange={(e) => updateSetting('vibracion', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Notificaciones */}
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BsBell size={20} />
                <div>
                  <h3 className="font-semibold">Notificaciones</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recibir notificaciones
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificaciones}
                  onChange={(e) => updateSetting('notificaciones', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}