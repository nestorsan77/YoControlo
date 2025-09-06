// Pagos.tsx
import { useEffect, useState } from 'react'
import { obtenerPagos } from '../services/firestoreService'
import { obtenerPagosLocal, guardarPagoLocal } from '../services/indexedDbService'
import type { Pago } from '../types/Pago'
import { auth } from '../services/firebase'

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([])

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const cargarPagos = async () => {
      // 1️⃣ Siempre mostrar lo que haya en local
      const pagosLocales = await obtenerPagosLocal(uid)
      setPagos(pagosLocales)

      // 2️⃣ Si hay internet → actualizamos con Firestore
      if (navigator.onLine) {
        const pagosOnline = await obtenerPagos(uid)

        // guardar en IndexedDB para que queden offline
        for (const pago of pagosOnline) {
          await guardarPagoLocal(pago)
        }
        setPagos(pagosOnline)
      }
    }

    cargarPagos()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tus pagos</h2>
      <ul className="space-y-2">
        {pagos.map((pago) => (
          <li key={pago.id} className="border p-2 rounded">
            <div className="font-semibold">{pago.nombre}</div>
            <div className="text-sm text-gray-600">
              {pago.cantidad} € - {new Date(pago.fecha).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
