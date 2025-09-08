// src/components/LogoutButton.tsx
import { signOut } from "firebase/auth"
import { auth } from "../../services/firebase"
import { useSettings } from "../../contexts/SettingsContext"
import { BsBoxArrowRight } from "react-icons/bs"

export default function LogoutButton() {
  const { settings } = useSettings()
  const isDark = settings.darkMode

  const handleLogout = async () => {
    const confirmLogout = confirm("¿Seguro que quieres cerrar sesión? Esto eliminará todos los datos locales.")
    if (!confirmLogout) return

    try {
      // 1️⃣ Cerrar sesión en Firebase
      await signOut(auth)

      // 2️⃣ Limpiar localStorage y sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      // 3️⃣ Limpiar IndexedDB
      const databases = await indexedDB.databases()
      for (const dbInfo of databases) {
        if (dbInfo.name) indexedDB.deleteDatabase(dbInfo.name)
      }

      // 4️⃣ Recargar la app
      window.location.href = "/"
    } catch (err) {
      console.error("Error cerrando sesión:", err)
      alert("Error al cerrar sesión. Intenta de nuevo.")
    }
  }

  return (
    <div className={`p-4 rounded-lg transition-colors duration-200 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    } shadow-sm mt-6`}>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
      >
        <BsBoxArrowRight size={20} /> Cerrar sesión
      </button>
    </div>
  )
}
