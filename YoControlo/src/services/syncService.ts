// syncService.tsx
import { obtenerTodosLosPagosLocal, eliminarPagoLocal, guardarPagoLocal } from './indexedDbService'
import { agregarPago } from './firestoreService'

export async function sincronizarPagos() {
  const pagosLocales = await obtenerTodosLosPagosLocal()

  for (const pago of pagosLocales) {
    if (pago.pendienteDeSincronizar) {
      try {
        // 🔹 Quitamos id temporal y flag antes de enviar
        const { id: idLocal, ...pagoSinId } = pago

        // 🔹 Subir a Firestore → devuelve idReal
        const idReal = await agregarPago(pagoSinId)

        // 🔹 Guardar el pago ya sincronizado en IndexedDB con idReal
        await guardarPagoLocal({
          ...pago,
          id: idReal,
          pendienteDeSincronizar: false, // ✅ marcado como sincronizado
        })

        // 🔹 Eliminar el pago temporal
        if (idLocal) {
          await eliminarPagoLocal(idLocal)
        }
      } catch (err) {
        console.error('Error al sincronizar pago:', pago, err)
      }
    }
  }
}
