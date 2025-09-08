// src/pages/NuevoPago.tsx
import { useState } from "react"
import { useSwipeable } from "react-swipeable"
import { motion, AnimatePresence } from "framer-motion"
import { agregarPago } from "../services/firestoreService"
import { guardarPagoLocal } from "../services/indexedDbService"
import { auth } from "../services/firebase"
import type { Pago } from "../types/Pago"
import { useSettings } from "../contexts/SettingsContext"
import CantidadInput from "../components/inputs/CantidadInput";


const categoriasGastos = [
  { nombre: "Genérico", icono: "/icons/coin.png" },
  { nombre: "Netflix", icono: "/icons/netflix.png", sugerido: 15 },
  { nombre: "Amazon", icono: "/icons/amazon.png" },
  { nombre: "Viaje", icono: "/icons/airplane.png" },
  { nombre: "Hipoteca", icono: "/icons/house.png", sugerido: 600 },
  { nombre: "Spotify", icono: "/icons/spotify.png", sugerido: 10 },
]

const categoriasIngresos = [
  { nombre: "Genérico", icono: "/icons/coin.png" },
  { nombre: "Sueldo", icono: "/icons/sueldo.png", sugerido: 1200 },
  { nombre: "Bizum", icono: "/icons/bizum.png" },
  { nombre: "Transferencia", icono: "/icons/transferencia.png" },
]

export default function NuevoPago() {
  // Estado inicial genérico válido
  const [nombre, setNombre] = useState("Genérico")
  const [cantidad, setCantidad] = useState<number>(0)
  const [icono, setIcono] = useState<string>("/icons/coin.png")
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto")
  const { settings } = useSettings()

  const categorias = tipo === "gasto" ? categoriasGastos : categoriasIngresos

  const handleCategoriaClick = (cat: typeof categorias[0]) => {
    setNombre(cat.nombre)
    setIcono(cat.icono)
    if (cat.sugerido) setCantidad(cat.sugerido)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const uid = auth.currentUser?.uid
    if (!uid) return alert("Usuario no autenticado")

    const nuevoPago: Pago = {
      id: crypto.randomUUID(),
      uid,
      nombre,
      cantidad,
      fecha: new Date().toISOString(),
      pendienteDeSincronizar: !navigator.onLine,
      icono,
      tipo,
      pendienteDeEliminar: false,
    }

    try {
      if (navigator.onLine) {
        const { ...pagoSinId } = nuevoPago
        const idReal = await agregarPago(pagoSinId)
        await guardarPagoLocal({
          ...nuevoPago,
          id: idReal,
          pendienteDeSincronizar: false,
        })
        alert(`Guardado con ID: ${idReal}`)
      } else {
        await guardarPagoLocal(nuevoPago)
        alert("Guardado offline (se sincronizará luego).")
      }

      // Reset al genérico
      setNombre("Genérico")
      setCantidad(0)
      setIcono("/icons/coin.png")
    } catch (err) {
      console.error("Error al guardar:", err)
      alert("Error al guardar el pago.")
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setTipo("ingreso"),
    onSwipedRight: () => setTipo("gasto"),
    preventScrollOnSwipe: true,
    trackTouch: true,
  })

  return (
    <div
      {...swipeHandlers}
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-200 ${
        settings.darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <motion.form
        onSubmit={handleSubmit}
        className={`p-4 space-y-4 w-full max-w-md rounded-2xl shadow-lg transition-colors duration-200 ${
          settings.darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Indicador animado */}
        <div className="flex justify-center gap-4">
          <motion.div
            layout
            className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${
              tipo === "gasto"
                ? "bg-red-500 text-white"
                : settings.darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-900"
            }`}
            onClick={() => setTipo("gasto")}
          >
            Gasto
          </motion.div>
          <motion.div
            layout
            className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${
              tipo === "ingreso"
                ? "bg-green-500 text-white"
                : settings.darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-900"
            }`}
            onClick={() => setTipo("ingreso")}
          >
            Ingreso
          </motion.div>
        </div>
        <p
          className={`text-center text-sm ${
            settings.darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Desliza ↔ o pulsa para cambiar
        </p>

        {/* Categorías rápidas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipo}
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, x: tipo === "gasto" ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tipo === "gasto" ? 40 : -40 }}
            transition={{ duration: 0.3 }}
          >
            {categorias.map((cat) => (
              <motion.button
                key={cat.nombre}
                type="button"
                onClick={() => handleCategoriaClick(cat)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-2 border rounded-lg transition-colors duration-200 ${
                  nombre === cat.nombre
                    ? "border-blue-500"
                    : settings.darkMode
                    ? "border-gray-600 hover:bg-gray-700"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <img
                  src={cat.icono}
                  alt={cat.nombre}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm">{cat.nombre}</span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Inputs */}
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`w-full p-2 border rounded transition-colors duration-200 ${
            settings.darkMode
              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
              : "border-gray-300 bg-white text-gray-900"
          }`}
          required
        />
        <CantidadInput
          cantidad={cantidad ? cantidad + " €" : ""} // si no hay cantidad, dejamos vacío
          setCantidad={(valor) => {
            const raw = valor.replace(/[^\d]/g, "")
            setCantidad(raw ? Number(raw) : 0) // <-- aquí ponemos 0 en vez de undefined
          }}
          isDark={settings.darkMode}
          placeholder="Cantidad"
        />
        {/* Preview */}
        {icono && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src={icono} alt="icono" className="w-6 h-6" />
            <span>{nombre}</span>
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
        >
          Guardar {tipo}
        </motion.button>
      </motion.form>
    </div>
  )
}
