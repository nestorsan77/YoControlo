import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { obtenerPagos } from '../services/firestoreService'
import { obtenerPagosLocal } from '../services/indexedDbService'
import { auth } from '../services/firebase'
import type { Pago } from '../types/Pago'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useSettings } from '../contexts/SettingsContext'
import { NumberHelper } from '../helpers/NumberHelper'

const colores = {
  gasto: '#f87171',    // rojo
  ingreso: '#34d399',  // verde
  saldo: '#bfdbfe',    // azul claro para saldo positivo
}

export default function Home() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const { settings } = useSettings()
  const isDark = settings.darkMode

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const cargarPagos = async () => {
      const pagosLocales = await obtenerPagosLocal(uid)
      setPagos(pagosLocales)

      if (navigator.onLine) {
        const pagosOnline = await obtenerPagos(uid)
        setPagos(pagosOnline)
      }
    }

    cargarPagos()
  }, [])

  const totalGasto = useMemo(
    () => pagos.filter(p => p.tipo === 'gasto').reduce((a, p) => a + p.cantidad, 0),
    [pagos]
  )
  const totalIngreso = useMemo(
    () => pagos.filter(p => p.tipo === 'ingreso').reduce((a, p) => a + p.cantidad, 0),
    [pagos]
  )
  const saldo = totalIngreso - totalGasto

  const dataPie = [
    { name: 'Gasto', value: totalGasto, tipo: 'gasto' },
    { name: 'Ingreso', value: totalIngreso, tipo: 'ingreso' },
  ]

  // Movimientos ordenados por fecha descendente (más reciente primero)
  const pagosRecientes = useMemo(
    () => [...pagos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [pagos]
  )

  return (
    <div className={`pb-24 min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Dashboard</h1>
        <p className={`mb-6 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Bienvenido a tu app de gestión de dinero.
        </p>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              isDark ? 'bg-red-800 text-red-300' : 'bg-red-100 text-red-600'
            }`}
            layout
          >
            <div className="text-lg font-bold">{NumberHelper.formatTwoDecimals(totalGasto) } €</div>
            <div className="text-sm">Gasto total</div>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              isDark ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-600'
            }`}
            layout
          >
            <div className="text-lg font-bold">{ NumberHelper.formatTwoDecimals(totalIngreso)} €</div>
            <div className="text-sm">Ingreso total</div>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg text-center transition-colors ${
              saldo >= 0
                ? isDark
                  ? 'bg-blue-800 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
                : isDark
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-900'
            }`}
            layout
          >
            <div className="text-lg font-bold">{NumberHelper.formatTwoDecimals(saldo)} €</div>
            <div className="text-sm">Saldo</div>
          </motion.div>
        </div>

        {/* Gráfica circular */}
        <div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="font-semibold mb-2">Distribución Gastos vs Ingresos</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${NumberHelper.formatTwoDecimals(value ?? 0)} €`}
                >
                  {dataPie.map((entry, index) => (
                    <Cell
                      key={`cell-${NumberHelper.formatTwoDecimals(index)}`}
                      fill={colores[entry.tipo as 'gasto' | 'ingreso']}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${NumberHelper.formatTwoDecimals(value)} €`}
                  contentStyle={{
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    border: isDark ? '1px solid #4B5563' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className={`p-4 rounded-lg shadow-md transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="font-semibold mb-2">Últimos movimientos</h2>
          <ul className="space-y-2">
            {pagosRecientes.slice(0, 5).map((pago) => (
              <motion.li
                key={pago.id}
                className={`flex items-center gap-3 border p-2 rounded-lg transition-colors ${
                  pago.tipo === 'gasto'
                    ? isDark ? 'border-red-700 bg-red-900' : 'border-red-400 bg-red-50'
                    : isDark ? 'border-green-700 bg-green-900' : 'border-green-400 bg-green-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                {pago.icono ? (
                  <img src={pago.icono} alt={pago.nombre} className="w-8 h-8 object-contain" />
                ) : (
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-600'
                  }`}>?</div>
                )}
                <div className="flex-1">
                  <div className="font-semibold transition-colors">{pago.nombre}</div>
                  <div className={`text-sm transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                     {NumberHelper.formatTwoDecimals(pago.cantidad)} € · {new Date(pago.fecha).toLocaleString()}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
