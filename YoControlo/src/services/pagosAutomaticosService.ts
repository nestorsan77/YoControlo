// src/services/pagosAutoService.ts
import { obtenerGastosFijos, actualizarUltimoPagoGastoFijo } from './gastosFijosService'
import type { Pago } from '../types/Pago'
import { obtenerPagosLocal, guardarPagoLocal } from './indexedDbService'
import { auth } from './firebase'

function calcularSiguienteFecha(fechaBase: Date, periodicidad: 'Mensual' | 'Anual'): Date {
  const siguiente = new Date(fechaBase)
  if (periodicidad === 'Mensual') {
    siguiente.setMonth(siguiente.getMonth() + 1)
  } else {
    siguiente.setFullYear(siguiente.getFullYear() + 1)
  }
  return siguiente
}

function generarFechasPendientes(fechaInicio: Date, ultimoPago: Date | null, periodicidad: 'Mensual' | 'Anual'): Date[] {
  const fechas: Date[] = []
  const ahora = new Date()
  
  // Si no hay último pago, empezamos desde la fecha de inicio
  let fechaActual = ultimoPago ? calcularSiguienteFecha(ultimoPago, periodicidad) : new Date(fechaInicio)
  
  // Generar todas las fechas hasta la actual
  while (fechaActual <= ahora) {
    fechas.push(new Date(fechaActual))
    fechaActual = calcularSiguienteFecha(fechaActual, periodicidad)
  }
  
  return fechas
}

async function yaExistePagoEnFecha(uid: string, nombreGasto: string, fecha: Date): Promise<boolean> {
  const pagosExistentes = await obtenerPagosLocal(uid)
  
  return pagosExistentes.some(pago => {
    if (pago.nombre !== nombreGasto || pago.tipo !== 'gasto') return false
    
    const fechaPago = new Date(pago.fecha)
    
    // Para gastos mensuales, verificar mismo mes y año
    if (fechaPago.getMonth() === fecha.getMonth() && fechaPago.getFullYear() === fecha.getFullYear()) {
      return true
    }
    
    return false
  })
}



export async function generarPagosAutomáticos() {
  const uid = auth.currentUser?.uid
  if (!uid) {
    console.log('❌ No hay usuario autenticado')
    return
  }

  try {
    console.log('🔄 Generando pagos automáticos...')
    const gastosFijos = await obtenerGastosFijos()
    
    if (gastosFijos.length === 0) {
      console.log('ℹ️ No hay gastos fijos configurados')
      return
    }

    let pagosGenerados = 0

    for (const gasto of gastosFijos) {
      try {
        const fechaInicio = new Date(gasto.fechaInicio)
        const ultimoPago = gasto.ultimoPago ? new Date(gasto.ultimoPago) : null
        
        // Obtener todas las fechas pendientes para este gasto
        const fechasPendientes = generarFechasPendientes(fechaInicio, ultimoPago, gasto.periodicidad)
        
        console.log(`📋 Gasto "${gasto.nombre}": ${fechasPendientes.length} pagos pendientes`)

        for (const fechaPago of fechasPendientes) {
          // Verificar si ya existe un pago para esta fecha
          if (await yaExistePagoEnFecha(uid, gasto.nombre, fechaPago)) {
            console.log(`⚠️ Ya existe pago para ${gasto.nombre} en ${fechaPago.toLocaleDateString()}`)
            continue
          }

          // Crear el nuevo pago
          const nuevoPago: Pago = {
            id: crypto.randomUUID(),
            nombre: gasto.nombre,
            cantidad: gasto.cantidad,
            categoria: gasto.categoria || '',
            tipo: 'gasto',
            fecha: fechaPago.toISOString(),
            icono: gasto.icono,
            pendienteDeSincronizar: true,
            uid: uid,
            pendienteDeEliminar: false
          }

          await guardarPagoLocal(nuevoPago)
          pagosGenerados++
          
          console.log(`✅ Pago generado: ${gasto.nombre} - ${fechaPago.toLocaleDateString()} - ${gasto.cantidad}€`)
        }

        // Actualizar la fecha del último pago generado
        if (fechasPendientes.length > 0) {
          const ultimaFechaGenerada = fechasPendientes[fechasPendientes.length - 1]
          await actualizarUltimoPagoGastoFijo(gasto.id, ultimaFechaGenerada.toISOString())
        }

      } catch (error) {
        console.error(`❌ Error procesando gasto fijo ${gasto.nombre}:`, error)
      }
    }

    if (pagosGenerados > 0) {
      console.log(`✅ Se generaron ${pagosGenerados} pagos automáticos`)
    } else {
      console.log('ℹ️ No se generaron pagos nuevos')
    }

  } catch (error) {
    console.error('❌ Error en generarPagosAutomáticos:', error)
  }
}