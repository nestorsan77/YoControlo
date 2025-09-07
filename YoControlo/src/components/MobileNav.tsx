import { Link, useLocation } from "react-router-dom"
import { AiOutlineHome } from "react-icons/ai"
import { BsCashStack } from "react-icons/bs"
import { IoMdAddCircleOutline } from "react-icons/io"
import { FaRegCalendarAlt } from "react-icons/fa" // Icono para gastos fijos
import { motion } from "framer-motion"
import { useSettings } from "../contexts/SettingsContext"

const navItems = [
  { path: "/", label: "Inicio", icon: <AiOutlineHome size={24} /> },
  { path: "/pagos", label: "Pagos", icon: <BsCashStack size={24} /> },
  { path: "/nuevo-pago", label: "Añadir", icon: <IoMdAddCircleOutline size={28} /> },
  { path: "/gastos-fijos", label: "Gastos", icon: <FaRegCalendarAlt size={24} /> }, // Nuevo item
]

export default function MobileNav() {
  const location = useLocation()
  const { settings } = useSettings()

  return (
   <nav
  className={`fixed bottom-0 left-0 right-0 border-t shadow-md z-50 transition-colors duration-200
    ${settings.darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
    pb-4 pb-[env(safe-area-inset-bottom)] pb-[constant(safe-area-inset-bottom)]`}
>
  <div className="flex justify-around items-center py-2">
    {navItems.map((item) => {
      const isActive = location.pathname === item.path
      return (
        <Link key={item.path} to={item.path}>
          <motion.div
            className={`flex flex-col items-center text-xs transition-colors duration-200
              ${isActive
                ? settings.darkMode
                  ? "text-blue-400"
                  : "text-blue-600"
                : settings.darkMode
                ? "text-gray-400"
                : "text-gray-500"
              }`}
            whileTap={{ scale: 0.9 }}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </motion.div>
        </Link>
      )
    })}
  </div>
</nav>
  )
}
