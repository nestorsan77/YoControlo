// NuevoPago.tsx
import { useState } from 'react'
import { agregarPago } from '../services/firestoreService'
import { guardarPagoLocal } from '../services/indexedDbService'
import { auth } from '../services/firebase'
import type { Pago } from '../types/Pago'

export default function NuevoPago() {
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const uid = auth.currentUser?.uid
    if (!uid) return alert("Usuario no autenticado")

    // Siempre crear el pago con un id temporal
    const nuevoPago: Pago = {
      id: crypto.randomUUID(), // id local
      uid,
      nombre,
      cantidad,
      fecha: new Date().toISOString(),
      pendienteDeSincronizar: !navigator.onLine, // 👈 clave
    }

    try {
      if (navigator.onLine) {
        // 1️⃣ Subir a Firestore sin el id temporal ni el flag
        const { id, pendienteDeSincronizar, ...pagoSinId } = nuevoPago
        const idReal = await agregarPago(pagoSinId)

        // 2️⃣ Guardar en IndexedDB con el id real y pendienteDeSincronizar=false
        await guardarPagoLocal({
          ...nuevoPago,
          id: idReal,
          pendienteDeSincronizar: false,
        })

        alert(`Pago guardado con ID: ${idReal}`)
      } else {
        // Guardar solo en IndexedDB en modo offline
        await guardarPagoLocal(nuevoPago)
        alert("Pago guardado en modo offline (se sincronizará luego).")
      }

      setNombre('')
      setCantidad(0)
    } catch (err) {
      console.error("Error al guardar:", err)
      alert("Error al guardar el pago.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Nombre del pago"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(Number(e.target.value))}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Guardar pago
      </button>
    </form>
  )
}
