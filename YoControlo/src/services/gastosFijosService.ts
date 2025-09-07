import { openDB } from 'idb'
import type { GastoFijo } from '../types/GastoFijo'
import type { Pago } from '../types/Pago'
import { guardarPago, obtenerPagos } from './PagoService'

const DB_NAME = 'yocontrolo-gastos-fijos'
const STORE_NAME = 'gastos-fijos'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id'
        })
      }
    }
  })
}

// Obtener todos los gastos fijos
export async function obtenerGastosFijos(): Promise<GastoFijo[]> {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}

// Guardar o actualizar un gasto fijo
export async function guardarGastoFijo(gasto: GastoFijo) {
  const db = await getDB()
  await db.put(STORE_NAME, gasto)
}

// Eliminar un gasto fijo
export async function eliminarGastoFijo(id: string) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function actualizarUltimoPagoGastoFijo(id: string, fechaUltimoPago: string) {
  const db = await getDB()
  const gasto = await db.get(STORE_NAME, id)
  if (gasto) {
    gasto.ultimoPago = fechaUltimoPago
    await db.put(STORE_NAME, gasto)
  }
}

// 🔹 Generar pagos pendientes según periodicidad y evitar duplicados
export async function generarPagosPendientes(uid: string): Promise<void> {
  const db = await getDB()
  const gastos: GastoFijo[] = await db.getAll(STORE_NAME)
  const hoy = new Date()
  const pagosExistentes = await obtenerPagos()

  for (const gasto of gastos) {
    const fechaUltimoPago = gasto.ultimoPago ? new Date(gasto.ultimoPago) : new Date(gasto.fechaInicio)
    const fechaProximoPago = new Date(fechaUltimoPago)
    let pagosAGenerar = 0

    if (gasto.periodicidad === 'Mensual') {
      while (fechaProximoPago <= hoy) {
        pagosAGenerar++
        fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1)
      }
    } else if (gasto.periodicidad === 'Anual') {
      while (fechaProximoPago <= hoy) {
        pagosAGenerar++
        fechaProximoPago.setFullYear(fechaProximoPago.getFullYear() + 1)
      }
    }

    for (let i = 0; i < pagosAGenerar; i++) {
      const fechaPago = new Date(fechaUltimoPago)
      if (gasto.periodicidad === 'Mensual') fechaPago.setMonth(fechaPago.getMonth() + i + 1)
      if (gasto.periodicidad === 'Anual') fechaPago.setFullYear(fechaPago.getFullYear() + i + 1)

      // Evitamos duplicados
      const existe = pagosExistentes.some(p => 
        p.uid === uid &&
        p.nombre === gasto.nombre &&
        new Date(p.fecha).toDateString() === fechaPago.toDateString()
      )
      if (existe) continue

      const pago: Pago = {
        id: crypto.randomUUID(),
        uid,
        nombre: gasto.nombre,
        cantidad: gasto.cantidad,
        categoria: gasto.categoria,
        tipo: 'gasto',
        fecha: fechaPago.toISOString(),
        icono: gasto.icono || '',
        pendienteDeSincronizar: true,
        pendienteDeEliminar: false
      }

      await guardarPago(pago)
    }

    // ❌ No actualizamos gasto.ultimoPago aquí
    // gasto.ultimoPago = fechaProximoPago.toISOString()
    // await db.put(STORE_NAME, gasto)
  }
}

