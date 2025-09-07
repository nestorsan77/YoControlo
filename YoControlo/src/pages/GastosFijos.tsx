// src/pages/GastosFijos.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { useSettings } from '../contexts/SettingsContext'
import { obtenerGastosFijos, guardarGastoFijo, eliminarGastoFijo } from '../services/gastosFijosService'
import { GastosFijosIcons, type GastoFijoIcon } from '../icons/GastosFijosIcons'
import type { GastoFijo } from '../types/GastoFijo'

// Definimos un tipo que extiende GastoFijo con fechaProgramada obligatoria
export type GastoFijoConProgramacion = GastoFijo & {
  fechaProgramada: string
}

export default function GastosFijos() {
  const [gastos, setGastos] = useState<GastoFijoConProgramacion[]>([])
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState(0)
  const [categoria, setCategoria] = useState('')
  const [periodicidad, setPeriodicidad] = useState<'Mensual' | 'Anual'>('Mensual')
  const [iconoSeleccionado, setIconoSeleccionado] = useState<GastoFijoIcon | null>(null)
  const [fechaProgramada, setFechaProgramada] = useState<string>(new Date().toISOString().slice(0,16))

  const { settings } = useSettings()
  const isDark = settings.darkMode

  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = async () => {
    const data = await obtenerGastosFijos()

    type GastoFijoDesdeBackend = GastoFijo & { fechaProgramada?: string }

    const gastosConFecha: GastoFijoConProgramacion[] = (data as GastoFijoDesdeBackend[]).map(g => ({
      ...g,
      fechaProgramada: g.fechaProgramada || g.fechaInicio
    }))

    setGastos(gastosConFecha)
  }

  const agregarGasto = async () => {
    if (!nombre || cantidad <= 0) return

    const nuevo: GastoFijoConProgramacion = {
      id: uuidv4(),
      nombre,
      cantidad,
      categoria,
      periodicidad,
      icono: iconoSeleccionado?.name ?? undefined,
      fechaInicio: new Date().toISOString(),
      ultimoPago: undefined,
      fechaProgramada,
    }

    await guardarGastoFijo(nuevo)
    setNombre('')
    setCantidad(0)
    setCategoria('')
    setPeriodicidad('Mensual')
    setIconoSeleccionado(null)
    setFechaProgramada(new Date().toISOString().slice(0,16))
    cargarGastos()
  }

  const eliminar = async (id: string) => {
    await eliminarGastoFijo(id)
    cargarGastos()
  }

  const calcularProximaFecha = (gasto: GastoFijoConProgramacion) => {
    const base = gasto.ultimoPago ? new Date(gasto.ultimoPago) : new Date(gasto.fechaProgramada)
    const proxima = new Date(base)
    if (gasto.periodicidad === 'Mensual') proxima.setMonth(proxima.getMonth() + 1)
    if (gasto.periodicidad === 'Anual') proxima.setFullYear(proxima.getFullYear() + 1)
    return proxima
  }

  return (
    <div className={`pb-24 min-h-screen p-4 transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Gastos Fijos</h1>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className={`p-2 border rounded transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(Number(e.target.value))}
          className={`p-2 border rounded transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className={`p-2 border rounded transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        />
        <select
          value={periodicidad}
          onChange={e => setPeriodicidad(e.target.value as 'Mensual' | 'Anual')}
          className={`p-2 border rounded transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="Mensual">Mensual</option>
          <option value="Anual">Anual</option>
        </select>
        <input
          type="datetime-local"
          value={fechaProgramada}
          onChange={e => setFechaProgramada(e.target.value)}
          className={`p-2 border rounded transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>

      {/* Selector de iconos */}
      <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory mb-2">
        {GastosFijosIcons.map((iconObj: GastoFijoIcon) => (
          <button
            key={iconObj.name}
            onClick={() => setIconoSeleccionado(iconObj)}
            className={`flex-shrink-0 p-2 border rounded transition-colors snap-start ${
              iconoSeleccionado?.name === iconObj.name
                ? 'border-blue-600 bg-blue-100'
                : isDark
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-300 bg-white'
            }`}
          >
            {iconObj.icon}
          </button>
        ))}
      </div>

      <button
        onClick={agregarGasto}
        className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Agregar gasto
      </button>

      {/* Lista de gastos */}
      <ul className="space-y-2">
        <AnimatePresence>
          {gastos.map((gasto: GastoFijoConProgramacion) => (
            <motion.li
              key={gasto.id}
              className={`flex justify-between items-center p-2 border rounded transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2">
                {gasto.icono && (
                  <div className="text-2xl">
                    {GastosFijosIcons.find(i => i.name === gasto.icono)?.icon}
                  </div>
                )}
                <div>
                  <div className="font-semibold">{gasto.nombre}</div>
                  <div className="text-sm">{gasto.cantidad} € · {gasto.periodicidad}</div>
                  {gasto.categoria && <div className="text-xs text-blue-600">{gasto.categoria}</div>}
                  <div className="text-xs text-gray-500">
                    Próximo: {calcularProximaFecha(gasto).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => eliminar(gasto.id)}
                className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100 transition-colors"
              >
                X
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
