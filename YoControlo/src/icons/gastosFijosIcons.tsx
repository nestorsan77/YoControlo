import { type ReactNode } from "react"
import { FaHome, FaBolt, FaWater, FaCar, FaUniversity, FaPiggyBank, FaMobileAlt, FaShieldAlt } from "react-icons/fa"
import { GiPayMoney, GiUpCard } from "react-icons/gi"
import { IoMdBus } from "react-icons/io"

export type GastoFijoIcon = {
  name: string
  icon: ReactNode
}

export const gastosFijosIcons: GastoFijoIcon[] = [
  { name: "Hipoteca", icon: <FaHome size={24} /> },
  { name: "Luz", icon: <FaBolt size={24} /> },
  { name: "Agua", icon: <FaWater size={24} /> },
  { name: "Seguro Coche", icon: <FaCar size={24} /> },
  { name: "Seguro Hogar", icon: <FaShieldAlt size={24} /> },
  { name: "Inversión", icon: <FaUniversity size={24} /> },
  { name: "Ahorro", icon: <FaPiggyBank size={24} /> },
  { name: "Teléfono/Móvil", icon: <FaMobileAlt size={24} /> },
  { name: "Transporte", icon: <IoMdBus size={24} /> },
  { name: "Pago Tarjeta", icon: <GiUpCard size={24} /> },
  { name: "Otros", icon: <GiPayMoney size={24} /> },
]
