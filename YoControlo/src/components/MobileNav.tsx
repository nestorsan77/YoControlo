import { Link, useLocation } from "react-router-dom"
import { AiOutlineHome } from "react-icons/ai"
import { BsCashStack } from "react-icons/bs"
import { IoMdAddCircleOutline } from "react-icons/io"

const navItems = [
  { path: "/", label: "Inicio", icon: <AiOutlineHome size={24} /> },
  { path: "/pagos", label: "Pagos", icon: <BsCashStack size={24} /> },
  { path: "/nuevo-pago", label: "Añadir", icon: <IoMdAddCircleOutline size={28} /> },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
