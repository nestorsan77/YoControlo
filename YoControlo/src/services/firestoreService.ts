// src/services/firestoreService.ts
import { db } from './firebase'
import { collection, addDoc, getDocs, getDoc } from 'firebase/firestore'
import { type Pago } from '../types/Pago'
import { query, where } from 'firebase/firestore'
import { doc, deleteDoc } from 'firebase/firestore'

const pagosRef = collection(db, 'pagos')

// ✅ Agregar un nuevo pago a Firestore
export async function agregarPago(pago: Omit<Pago, 'id'>): Promise<string> {
  const docRef = await addDoc(pagosRef, pago)
  return docRef.id
}

// ✅ Obtener todos los pagos desde Firestore
export async function obtenerPagos(uid: string): Promise<Pago[]> {
  const q = query(pagosRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Pago[]
}

export async function eliminarPagoOnline(id: string) {
  try {
    // Limpiar ID por si viene con espacios extra
    const cleanId = id.trim()
    
    if (!cleanId) {
      console.warn('ID inválido, no se puede eliminar:', id)
      return
    }

    console.log('Intentando eliminar pago online, ID:', cleanId)
    
    const pagoRef = doc(db, 'pagos', cleanId)
    console.log('Referencia docRef:', pagoRef.path)

    const docSnapshot = await getDoc(pagoRef)
    if (!docSnapshot.exists()) {
      console.warn('⚠️ Documento no existe en Firestore, nada que eliminar:', cleanId)
      return
    }

    await deleteDoc(pagoRef)
    console.log('✅ DeleteDoc llamado para:', pagoRef.path)
  } catch (error) {
    console.error('❌ Error eliminando pago online:', error)
    throw error // opcional: propagar error para manejarlo en UI
  }
}

export type { Pago }
