// types/Pago.ts
export interface Pago {
  id?: string
  uid: string
  nombre: string
  cantidad: number
  fecha: string
  categoria?: string
  icono?: string
  tipo: "gasto" | "ingreso" 
  pendienteDeSincronizar?: boolean
}
