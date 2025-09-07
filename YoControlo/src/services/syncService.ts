// syncService.tsx
import { obtenerTodosLosPagosLocal, eliminarPagoLocal, guardarPagoLocal, STORE_NAME } from './indexedDbService'
import { getDB } from './indexedDbService'
import { eliminarPagoOnline, agregarPago, obtenerPagos } from './firestoreService'
import { auth } from './firebase'
import type { Pago } from '../types/Pago'

// 🔹 Nueva función que maneja todo el proceso de sincronización
export async function sincronizarTodo() {
  const uid = auth.currentUser?.uid
  if (!uid || !navigator.onLine) return

  console.log('🔄 Iniciando sincronización completa...')
  
  try {
    // 1️⃣ PRIMERO: Procesar eliminaciones pendientes
    await sincronizarEliminacionesPendientes()
    
    // 2️⃣ SEGUNDO: Sincronizar pagos pendientes de crear
    await sincronizarPagos()
    
    // 3️⃣ TERCERO: Obtener datos actualizados de Firestore y reemplazar locales
    await actualizarDatosLocalesDesdeFirestore(uid)
    
    console.log('✅ Sincronización completa exitosa')
    
    // 4️⃣ CUARTO: DESPUÉS de sincronizar, generar gastos automáticos
    // Solo importamos aquí para evitar dependencias circulares
    const { generarPagosAutomáticos } = await import('./pagosAutomaticosService')
    await generarPagosAutomáticos()
    
  } catch (error) {
    console.error('❌ Error en sincronización completa:', error)
  }
}

export async function sincronizarPagos() {
  const pagosLocales = await obtenerTodosLosPagosLocal()
  
  for (const pago of pagosLocales) {
    if (pago.pendienteDeSincronizar && !pago.pendienteDeEliminar) {
      try {
        const { id: idLocal, ...resto } = pago
        
        // 🔹 limpiar campos undefined
        const pagoLimpio: Omit<Pago, 'id'> = {
          uid: resto.uid,
          nombre: resto.nombre,
          cantidad: resto.cantidad,
          categoria: resto.categoria ?? '', // o null si tu tipo lo permite
          tipo: resto.tipo,
          fecha: resto.fecha,
          icono: resto.icono ?? '',
          pendienteDeEliminar: false
        }
        
        const idReal = await agregarPago(pagoLimpio)
        console.log('✅ Pago sincronizado con ID:', idReal)
        
        // 🔹 eliminar el temporal
        if (idLocal) {
          await eliminarPagoLocal(idLocal)
        }
        
        // 🔹 guardar solo con id real
        await guardarPagoLocal({
          ...pago,
          id: idReal,
          pendienteDeSincronizar: false,
        })
      } catch (err) {
        console.error('Error al sincronizar pago:', pago, err)
      }
    }
  }
}

export async function sincronizarEliminacionesPendientes() {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const todosPagos = await store.getAll()
  await tx.done

  for (const pago of todosPagos) {
    if (pago.pendienteDeEliminar && pago.id) {
      try {
        console.log('🗑️ Eliminando pago pendiente:', pago.id)
        await eliminarPagoOnline(pago.id)
        await eliminarPagoLocal(pago.id)
        console.log('✅ Pago eliminado exitosamente:', pago.id)
      } catch (err) {
        console.error('❌ No se pudo eliminar pendiente:', err)
        // Si falla, mantener el flag para intentar después
      }
    }
  }
}

// 🔹 Nueva función para actualizar datos locales desde Firestore
async function actualizarDatosLocalesDesdeFirestore(uid: string) {
  try {
    // Obtener pagos actualizados de Firestore
    const pagosOnline = await obtenerPagos(uid)
    
    // Obtener pagos locales que NO están pendientes de sincronización
    const pagosLocales = await obtenerTodosLosPagosLocal()
    const pagosPendientes = pagosLocales.filter(p => 
      p.pendienteDeSincronizar || p.pendienteDeEliminar
    )
    
    // Limpiar IndexedDB completamente
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await tx.store.clear()
    await tx.done
    
    // Guardar pagos de Firestore
    for (const pago of pagosOnline) {
      await guardarPagoLocal(pago)
    }
    
    // Volver a guardar los pagos pendientes (si los hay)
    for (const pago of pagosPendientes) {
      await guardarPagoLocal(pago)
    }
    
    console.log(`✅ Datos locales actualizados: ${pagosOnline.length} de Firestore + ${pagosPendientes.length} pendientes`)
  } catch (error) {
    console.error('❌ Error actualizando datos locales:', error)
    throw error
  }
}