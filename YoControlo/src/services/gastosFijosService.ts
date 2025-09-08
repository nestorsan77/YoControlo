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
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
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

// Actualizar la fecha del último pago
export async function actualizarUltimoPagoGastoFijo(id: string, fechaUltimoPago: string) {
  const db = await getDB()
  const gasto = await db.get(STORE_NAME, id)
  if (gasto) {
    gasto.ultimoPago = fechaUltimoPago
    await db.put(STORE_NAME, gasto)
  }
}

// 🔹 FUNCIÓN PRINCIPAL: Verificar y generar pagos pendientes automáticamente
export async function verificarYGenerarPagosPendientes(uid: string): Promise<void> {
  const db = await getDB()
  const gastos: GastoFijo[] = await db.getAll(STORE_NAME)
  const ahora = new Date()
  
  console.log(`🔍 Verificando pagos para ${gastos.length} gastos fijos...`)

  for (const gasto of gastos) {
    try {
      await procesarGastoFijo(gasto, uid, ahora)
    } catch (error) {
      console.error(`❌ Error procesando gasto ${gasto.nombre}:`, error)
    }
  }
  
  console.log('✅ Verificación de pagos completada')
}

// Procesar un gasto fijo individual
async function procesarGastoFijo(gasto: GastoFijo, uid: string, ahora: Date): Promise<void> {
  //const db = await getDB()
  
  // Determinar la fecha base (último pago o fecha de inicio)
  let fechaBase: Date
  if (gasto.ultimoPago) {
    fechaBase = new Date(gasto.ultimoPago)
  } else {
    fechaBase = new Date(gasto.fechaInicio)
  }

  console.log(`📅 Procesando ${gasto.nombre}:`)
  console.log(`   - Fecha base: ${fechaBase.toLocaleDateString()}`)
  console.log(`   - Periodicidad: ${gasto.periodicidad}`)

  // Generar todas las fechas de pago que deberían haberse ejecutado
  const fechasPendientes = calcularFechasPendientes(fechaBase, gasto.periodicidad, ahora, !gasto.ultimoPago)
  
  if (fechasPendientes.length === 0) {
    console.log(`   ✅ Sin pagos pendientes`)
    return
  }

  console.log(`   🕒 ${fechasPendientes.length} pago(s) pendiente(s)`)

  // Obtener pagos existentes para evitar duplicados
  const pagosExistentes = await obtenerPagos()
  
  let ultimaFechaPago: Date | null = null

  // Generar cada pago pendiente
  for (const fechaPago of fechasPendientes) {
    const yaExiste = await verificarPagoExistente(pagosExistentes, uid, gasto.nombre, fechaPago)
    
    if (yaExiste) {
      console.log(`   ⚠️  Pago ya existe para ${fechaPago.toLocaleDateString()}`)
      continue
    }

    // Crear el pago
    const pago: Pago = {
      id: crypto.randomUUID(),
      uid,
      nombre: gasto.nombre,
      cantidad: gasto.cantidad,
      categoria: gasto.categoria || 'Gasto Fijo',
      tipo: 'gasto',
      fecha: fechaPago.toISOString(),
      icono: gasto.icono || '',
      pendienteDeSincronizar: true,
      pendienteDeEliminar: false
    }

    await guardarPago(pago)
    ultimaFechaPago = fechaPago
    
    console.log(`   ✅ Pago creado para ${fechaPago.toLocaleDateString()} - ${gasto.cantidad}€`)
  }

  // Actualizar la fecha del último pago en el gasto fijo
  if (ultimaFechaPago) {
    await actualizarUltimoPagoGastoFijo(gasto.id, ultimaFechaPago.toISOString())
    console.log(`   📝 Actualizado último pago: ${ultimaFechaPago.toLocaleDateString()}`)
  }
}

// Calcular todas las fechas de pago pendientes
function calcularFechasPendientes(
  fechaBase: Date, 
  periodicidad: 'Mensual' | 'Anual', 
  fechaLimite: Date,
  incluirFechaBase: boolean = false
): Date[] {
  const fechasPendientes: Date[] = []
  const fechaActual = new Date(fechaBase)

  // Si no incluimos la fecha base, avanzamos al siguiente período
  if (!incluirFechaBase) {
    if (periodicidad === 'Mensual') {
      fechaActual.setMonth(fechaActual.getMonth() + 1)
    } else if (periodicidad === 'Anual') {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1)
    }
  }

  // Generar todas las fechas hasta la fecha límite
  while (fechaActual <= fechaLimite) {
    fechasPendientes.push(new Date(fechaActual))
    
    // Avanzar al siguiente período
    if (periodicidad === 'Mensual') {
      fechaActual.setMonth(fechaActual.getMonth() + 1)
    } else if (periodicidad === 'Anual') {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1)
    }
  }

  return fechasPendientes
}

// Verificar si ya existe un pago para una fecha específica
async function verificarPagoExistente(
  pagosExistentes: Pago[], 
  uid: string, 
  nombre: string, 
  fechaPago: Date
): Promise<boolean> {
  const fechaPagoStr = fechaPago.toDateString()
  
  return pagosExistentes.some(pago => 
    pago.uid === uid &&
    pago.nombre === nombre &&
    new Date(pago.fecha).toDateString() === fechaPagoStr
  )
}

// 🔹 Función auxiliar para obtener el próximo pago programado
export function calcularProximoPago(gasto: GastoFijo): Date {
  const ahora = new Date()
  let fechaBase: Date

  if (gasto.ultimoPago) {
    fechaBase = new Date(gasto.ultimoPago)
  } else {
    fechaBase = new Date(gasto.fechaInicio)
  }

  const proximaFecha = new Date(fechaBase)

  // Si no hay último pago, la próxima fecha es la fecha de inicio si es futura
  if (!gasto.ultimoPago && fechaBase > ahora) {
    return fechaBase
  }

  // Calcular la siguiente fecha según periodicidad
  if (gasto.periodicidad === 'Mensual') {
    if (!gasto.ultimoPago) {
      // Si no hay último pago, comenzar desde la fecha de inicio
      while (proximaFecha <= ahora) {
        proximaFecha.setMonth(proximaFecha.getMonth() + 1)
      }
    } else {
      proximaFecha.setMonth(proximaFecha.getMonth() + 1)
    }
  } else if (gasto.periodicidad === 'Anual') {
    if (!gasto.ultimoPago) {
      while (proximaFecha <= ahora) {
        proximaFecha.setFullYear(proximaFecha.getFullYear() + 1)
      }
    } else {
      proximaFecha.setFullYear(proximaFecha.getFullYear() + 1)
    }
  }

  return proximaFecha
}

// 🔹 Función para obtener estadísticas de un gasto fijo
export function obtenerEstadisticasGasto(gasto: GastoFijo): {
  proximoPago: Date
  pagosPendientes: number
  estaAtrasado: boolean
  diasHastaProximo: number
} {
  const ahora = new Date()
  const proximoPago = calcularProximoPago(gasto)
  
  const fechaBase = gasto.ultimoPago ? new Date(gasto.ultimoPago) : new Date(gasto.fechaInicio)
  let pagosPendientes = 0
  
  // Contar pagos pendientes
  const fechaVerificacion = new Date(fechaBase)
  if (gasto.ultimoPago) {
    // Si hay último pago, comenzar desde el siguiente período
    if (gasto.periodicidad === 'Mensual') {
      fechaVerificacion.setMonth(fechaVerificacion.getMonth() + 1)
    } else {
      fechaVerificacion.setFullYear(fechaVerificacion.getFullYear() + 1)
    }
  }
  
  while (fechaVerificacion <= ahora) {
    pagosPendientes++
    if (gasto.periodicidad === 'Mensual') {
      fechaVerificacion.setMonth(fechaVerificacion.getMonth() + 1)
    } else {
      fechaVerificacion.setFullYear(fechaVerificacion.getFullYear() + 1)
    }
  }
  
  const diasHastaProximo = Math.ceil((proximoPago.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    proximoPago,
    pagosPendientes,
    estaAtrasado: pagosPendientes > 0,
    diasHastaProximo
  }
}