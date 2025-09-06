// src/services/firestoreService.ts
import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { type Pago } from '../types/Pago'
import { query, where } from 'firebase/firestore'

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

export type { Pago }
