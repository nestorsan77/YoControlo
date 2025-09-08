import { useEffect, useState, useMemo } from 'react'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { obtenerPagosLocal } from '../services/indexedDbService'
import type { Pago } from '../types/Pago'
import { auth } from '../services/firebase'
import { useSettings } from '../contexts/SettingsContext'
import { eliminarPagoOnline } from '../services/firestoreService'
import { eliminarPagoLocal } from '../services/indexedDbService'
import { marcarPagoParaEliminarLocal } from '../services/indexedDbService'
import { NumberHelper } from '../helpers/NumberHelper'

const colores = {
  gasto: '#f87171',
  ingreso: '#34d399',
  saldo: '#bfdbfe',
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [filtroPrincipal, setFiltroPrincipal] = useState<'Todos' | 'Gasto' | 'Ingreso'>('Todos')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todos')

  const eliminarPago = async (pago: Pago) => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    if (navigator.onLine) {
      // Si hay conexión, eliminar online y local
      try {
        await eliminarPagoOnline(pago.id!)
        await eliminarPagoLocal(pago.id!)
      } catch (err) {
        console.error('No se pudo eliminar online, se marcará pendiente', err)
        await marcarPagoParaEliminarLocal(pago.id!)
      }
    } else {
      // Offline: marcar para eliminar
      await marcarPagoParaEliminarLocal(pago.id!)
    }

    // Actualizar estado visual
    setPagos(prev => prev.filter(p => p.id !== pago.id))
  }

  const { settings } = useSettings()
  const isDark = settings.darkMode

  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [fechaFin, setFechaFin] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
  })

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const cargarPagos = async () => {
      console.log('🔄 Cargando pagos desde IndexedDB...')
      
      // 🔹 Obtener solo pagos locales
      let pagosLocales = await obtenerPagosLocal(uid)
      
      // 🔹 Filtrar pagos marcados para eliminar del UI
      pagosLocales = pagosLocales.filter(p => !p.pendienteDeEliminar)

      // 🔹 Orden descendente por fecha
      pagosLocales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

      setPagos(pagosLocales)
      console.log(`✅ Pagos cargados: ${pagosLocales.length}`)
    }

    cargarPagos()

    // 🔹 Recargar pagos cuando la ventana obtenga el foco
    // para capturar cambios hechos por otros procesos
    const handleFocus = () => {
      console.log('🔄 Ventana enfocada, recargando pagos...')
      cargarPagos()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Pestaña visible, recargando pagos...')
        cargarPagos()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (filtroPrincipal === 'Todos') setFiltroPrincipal('Gasto')
      else if (filtroPrincipal === 'Gasto') setFiltroPrincipal('Ingreso')
    },
    onSwipedRight: () => {
      if (filtroPrincipal === 'Ingreso') setFiltroPrincipal('Gasto')
      else if (filtroPrincipal === 'Gasto') setFiltroPrincipal('Todos')
    },
    trackTouch: true,
    trackMouse: true,
  })

  const categorias = useMemo(() => {
    const filteredPagos = pagos.filter(p =>
      filtroPrincipal === 'Todos' ? true : p.tipo === filtroPrincipal.toLowerCase()
    )
    const unique = Array.from(new Set(filteredPagos.map(p => p.categoria).filter(Boolean)))
    return ['Todos', ...unique]
  }, [pagos, filtroPrincipal])

  const pagosFiltrados = useMemo(() => {
    return pagos
      .filter(p => {
        const tipoMatch = filtroPrincipal === 'Todos' ? true : p.tipo === filtroPrincipal.toLowerCase()
        const catMatch = categoriaFiltro === 'Todos' ? true : p.categoria === categoriaFiltro
        const fecha = new Date(p.fecha)
        const fechaMatch = fecha >= fechaInicio && fecha <= fechaFin
        return tipoMatch && catMatch && fechaMatch
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [pagos, filtroPrincipal, categoriaFiltro, fechaInicio, fechaFin])

  const totalGasto = useMemo(
    () => pagosFiltrados.filter(p => p.tipo === 'gasto').reduce((a, p) => a + p.cantidad, 0),
    [pagosFiltrados]
  )
  const totalIngreso = useMemo(
    () => pagosFiltrados.filter(p => p.tipo === 'ingreso').reduce((a, p) => a + p.cantidad, 0),
    [pagosFiltrados]
  )
  const saldo = totalIngreso - totalGasto

  return (
    <div
      {...swipeHandlers}
      className={`pb-24 min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Tus Pagos</h1>

        {/* Selector de fechas */}
        <div className="flex gap-2 mb-4 items-center">
          <input
            type="date"
            value={fechaInicio.toISOString().split('T')[0]}
            onChange={e => setFechaInicio(new Date(e.target.value))}
            className={`p-2 border rounded w-full transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <span>→</span>
          <input
            type="date"
            value={fechaFin.toISOString().split('T')[0]}
            onChange={e => setFechaFin(new Date(e.target.value + 'T23:59:59'))}
            className={`p-2 border rounded w-full transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Filtros principales */}
        <div className="flex gap-2 overflow-x-auto mb-2">
          {(['Todos', 'Gasto', 'Ingreso'] as const).map((f: 'Todos' | 'Gasto' | 'Ingreso') => {
            const isSelected = filtroPrincipal === f
            const bgClass = isSelected
              ? f === 'Gasto'
                ? colores.gasto
                : f === 'Ingreso'
                ? colores.ingreso
                : colores.saldo
              : isDark
              ? 'bg-gray-800 text-gray-300 border-gray-700'
              : 'bg-white text-gray-700 border-gray-300'

            return (
              <motion.button
                key={f}
                onClick={() => setFiltroPrincipal(f)}
                className={`px-4 py-2 rounded-full border transition-colors text-white ${bgClass}`}
                whileTap={{ scale: 0.95 }}
              >
                {f}
              </motion.button>
            )
          })}
        </div>

        {/* Subfiltros */}
        <div className="flex gap-2 overflow-x-auto mb-4">
          {categorias.map(cat => {
            const isSelected = categoriaFiltro === cat
            const bgClass = isSelected
              ? colores.saldo
              : isDark
              ? 'bg-gray-800 text-gray-300 border-gray-700'
              : 'bg-white text-gray-700 border-gray-300'

            return (
              <motion.button
                key={cat}
                onClick={() => setCategoriaFiltro(cat ?? '')}
                className={`px-3 py-1 rounded-full border transition-colors ${bgClass}`}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            )
          })}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              isDark ? 'bg-red-800 text-red-300' : 'bg-red-100 text-red-600'
            }`}
          >
           <div className="text-lg font-bold">{NumberHelper.formatTwoDecimals(totalGasto)} €</div>
            <div className="text-sm">Gasto total</div>
          </motion.div>
          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              isDark ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-600'
            }`}
          >
            <div className="text-lg font-bold">{NumberHelper.formatTwoDecimals(totalIngreso)} €</div>
            <div className="text-sm">Ingreso total</div>
          </motion.div>
          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              saldo >= 0 ? (isDark ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-600') : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-900')
            }`}
          >
            <div className="text-lg font-bold">{NumberHelper.formatTwoDecimals(saldo)} €</div>
            <div className="text-sm">Saldo</div>
          </motion.div>
        </div>

        {/* Lista de pagos */}
        <div className={`p-4 rounded-lg shadow-md transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="font-semibold mb-2">Movimientos</h2>
          <ul className="space-y-2">
            <AnimatePresence>
              {pagosFiltrados.map(pago => (
                <motion.li
                  key={pago.id}
                  className={`flex items-center gap-3 border p-2 rounded-lg transition-colors ${
                    pago.tipo === 'gasto'
                      ? isDark
                        ? 'border-red-700 bg-red-900'
                        : 'border-red-400 bg-red-50'
                      : isDark
                        ? 'border-green-700 bg-green-900'
                        : 'border-green-400 bg-green-50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {pago.icono ? (
                    <img src={pago.icono} alt={pago.nombre} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-600'
                    }`}>?</div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{pago.nombre}</div>
                    <div className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {pago.cantidad} € · {new Date(pago.fecha).toLocaleString()}
                    </div>
                    {pago.categoria && (
                      <div className={`text-xs transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {pago.categoria}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarPago(pago)}
                    className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                    X
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  )
}