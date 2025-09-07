import { openDB } from 'idb'
import type { Pago } from '../types/Pago'

const DB_NAME = 'FinanzasDB'
const STORE_NAME = 'pagos'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function obtenerPagos(): Promise<Pago[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function guardarPago(pago: Pago): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, pago)
}

export async function eliminarPago(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}
