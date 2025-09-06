// types/Pago.ts
export interface Pago {
  id?: string
  uid: string
  nombre: string
  cantidad: number
  fecha: string
  categoria?: string

  pendienteDeSincronizar?: boolean // 👈 Nuevo campo opcional
}
