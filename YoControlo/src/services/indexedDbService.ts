import { openDB } from 'idb'
import type { Pago } from './firestoreService'

const DB_NAME = 'yocontrolo-db'
const STORE_NAME = 'pagos'

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false,
        })
        store.createIndex('uid', 'uid')
      }
    },
  })
}

// ✅ Guardar pago offline
export async function guardarPagoLocal(pago: Pago) {
  const db = await getDB()
  await db.put(STORE_NAME, pago)
}

// ✅ Obtener pagos por usuario
export async function obtenerPagosLocal(uid: string): Promise<Pago[]> {
  const db = await getDB()
  const index = db.transaction(STORE_NAME).store.index('uid')
  return await index.getAll(uid)
}

// ✅ Eliminar un pago local (cuando ya está sincronizado)
export async function eliminarPagoLocal(id: string) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// ✅ Obtener TODOS los pagos locales (para sincronizar)
export async function obtenerTodosLosPagosLocal(): Promise<Pago[]> {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}
