// src/pages/GastosFijos.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { useSettings } from '../contexts/SettingsContext'
import { 
  obtenerGastosFijos, 
  guardarGastoFijo, 
  eliminarGastoFijo,
  verificarYGenerarPagosPendientes 
} from '../services/gastosFijosService'
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
  const [verificandoPagos, setVerificandoPagos] = useState(false)

  const { settings } = useSettings()
  const isDark = settings.darkMode

  useEffect(() => {
    cargarGastosYVerificarPagos()
    
    // Verificar pagos cada hora
    const intervalo = setInterval(() => {
      verificarPagosPendientes()
    }, 3600000) // 1 hora = 3600000ms

    return () => clearInterval(intervalo)
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

  const cargarGastosYVerificarPagos = async () => {
    await cargarGastos()
    await verificarPagosPendientes()
  }

  const verificarPagosPendientes = async () => {
    setVerificandoPagos(true)
    try {
      // Aquí deberías pasar el uid del usuario actual
      const uid = 'usuario-actual' // Esto debería venir del contexto de autenticación
      await verificarYGenerarPagosPendientes(uid)
      await cargarGastos() // Recargar para actualizar las fechas
    } catch (error) {
      console.error('Error al verificar pagos pendientes:', error)
    } finally {
      setVerificandoPagos(false)
    }
  }

  const agregarGasto = async () => {
    if (!nombre || cantidad <= 0) return

    const nuevo: GastoFijoConProgramacion = {
      id: uuidv4(),
      nombre,
      cantidad,
      categoria,
      periodicidad,
      icono: iconoSeleccionado?.src ?? undefined,
      fechaInicio: fechaProgramada, // Usar la fecha programada como fecha de inicio
      ultimoPago: undefined,
      fechaProgramada,
    }

    await guardarGastoFijo(nuevo)
    
    // Limpiar formulario
    setNombre('')
    setCantidad(0)
    setCategoria('')
    setPeriodicidad('Mensual')
    setIconoSeleccionado(null)
    setFechaProgramada(new Date().toISOString().slice(0,16))
    
    // Verificar inmediatamente si este nuevo gasto genera pagos
    await verificarPagosPendientes()
    await cargarGastos()
  }

  const eliminar = async (id: string) => {
    await eliminarGastoFijo(id)
    cargarGastos()
  }

  const calcularProximaFecha = (gasto: GastoFijoConProgramacion) => {
    const ahora = new Date()
    const fechaBase = gasto.ultimoPago ? new Date(gasto.ultimoPago) : new Date(gasto.fechaProgramada)
    
    const proximaFecha = new Date(fechaBase)
    
    // Calcular la próxima fecha según periodicidad
    if (gasto.periodicidad === 'Mensual') {
      while (proximaFecha <= ahora) {
        proximaFecha.setMonth(proximaFecha.getMonth() + 1)
      }
    } else if (gasto.periodicidad === 'Anual') {
      while (proximaFecha <= ahora) {
        proximaFecha.setFullYear(proximaFecha.getFullYear() + 1)
      }
    }
    
    return proximaFecha
  }

  const obtenerEstadoGasto = (gasto: GastoFijoConProgramacion) => {
    const ahora = new Date()
    const fechaBase = gasto.ultimoPago ? new Date(gasto.ultimoPago) : new Date(gasto.fechaProgramada)
    
    const fechaEsperada = new Date(fechaBase)
    let pagosPendientes = 0
    
    // Contar cuántos pagos deberían haberse hecho
    if (gasto.periodicidad === 'Mensual') {
      while (fechaEsperada <= ahora) {
        pagosPendientes++
        fechaEsperada.setMonth(fechaEsperada.getMonth() + 1)
      }
    } else if (gasto.periodicidad === 'Anual') {
      while (fechaEsperada <= ahora) {
        pagosPendientes++
        fechaEsperada.setFullYear(fechaEsperada.getFullYear() + 1)
      }
    }
    
    // Si hay último pago, restar 1 porque ese ya se hizo
    if (gasto.ultimoPago) {
      pagosPendientes = Math.max(0, pagosPendientes - 1)
    }
    
    return {
      pagosPendientes,
      estaAtrasado: pagosPendientes > 0
    }
  }

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`pb-24 min-h-screen p-4 transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600">Gastos Fijos</h1>
        
        <button
          onClick={verificarPagosPendientes}
          disabled={verificandoPagos}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            verificandoPagos
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {verificandoPagos ? 'Verificando...' : 'Verificar Pagos'}
        </button>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={e => setCantidad(Number(e.target.value))}
          className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <select
          value={periodicidad}
          onChange={e => setPeriodicidad(e.target.value as 'Mensual' | 'Anual')}
          className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="Mensual">Mensual</option>
          <option value="Anual">Anual</option>
        </select>
        <input
          type="datetime-local"
          value={fechaProgramada}
          onChange={e => setFechaProgramada(e.target.value)}
          className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
          }`}
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
            <img src={iconObj.src} alt="" width="50px" />
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
          {gastos.map((gasto: GastoFijoConProgramacion) => {
            const estado = obtenerEstadoGasto(gasto)
            const proximaFecha = calcularProximaFecha(gasto)
            
            return (
              <motion.li
                key={gasto.id}
                className={`flex justify-between items-center p-3 border rounded transition-colors ${
                  estado.estaAtrasado
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                    : isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-3">
                  {gasto.icono && (
                    <div className="text-2xl">
                      <img
                        src={GastosFijosIcons.find(i => i.name === gasto.icono)?.src || gasto.icono}
                        alt=""
                        width="45px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{gasto.nombre}</div>
                    <div className="text-sm">{gasto.cantidad} € · {gasto.periodicidad}</div>
                    {gasto.categoria && (
                      <div className="text-xs text-blue-600">{gasto.categoria}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      Próximo: {formatearFecha(proximaFecha)}
                    </div>
                    {gasto.ultimoPago && (
                      <div className="text-xs text-green-600">
                        Último pago: {formatearFecha(new Date(gasto.ultimoPago))}
                      </div>
                    )}
                    {estado.estaAtrasado && (
                      <div className="text-xs text-red-600 font-medium">
                        ⚠️ {estado.pagosPendientes} pago(s) pendiente(s)
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => eliminar(gasto.id)}
                  className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100 transition-colors"
                >
                  X
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      
      {gastos.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No tienes gastos fijos configurados.</p>
          <p className="text-sm">Agrega tu primer gasto fijo usando el formulario de arriba.</p>
        </div>
      )}
    </div>
  )
}