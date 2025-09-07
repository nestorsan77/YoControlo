// src/services/pagosAutoService.ts
import { obtenerGastosFijos, guardarGastoFijo } from './gastosFijosService'
import { agregarPago } from './firestoreService'
import type { GastoFijo } from '../types/GastoFijo'
import type { Pago } from '../types/Pago'

type GastoFijoExtendido = GastoFijo & { uid: string; fechaProgramada?: string }

export async function generarPagosAutomáticos() {
  const gastos = (await obtenerGastosFijos()) as GastoFijoExtendido[]
  const ahora = new Date()

  for (const gasto of gastos) {
    if (!gasto.uid) continue // 👈 aseguramos que solo se procesen los que tienen uid

    const base = gasto.ultimoPago
      ? new Date(gasto.ultimoPago)
      : gasto.fechaProgramada
        ? new Date(gasto.fechaProgramada)
        : new Date(gasto.fechaInicio)

    const fecha = new Date(base)

    while (fecha <= ahora) {
      const nuevoPago: Omit<Pago, 'id'> = {
        uid: gasto.uid,
        nombre: gasto.nombre,
        cantidad: gasto.cantidad,
        fecha: fecha.toISOString(),
        categoria: gasto.categoria,
        icono: gasto.icono,
        tipo: 'gasto',
        pendienteDeSincronizar: !navigator.onLine,
      }

      await agregarPago(nuevoPago)

      if (gasto.periodicidad === 'Mensual') fecha.setMonth(fecha.getMonth() + 1)
      if (gasto.periodicidad === 'Anual') fecha.setFullYear(fecha.getFullYear() + 1)
    }

    gasto.ultimoPago = fecha.toISOString()
    await guardarGastoFijo(gasto)
  }
}
