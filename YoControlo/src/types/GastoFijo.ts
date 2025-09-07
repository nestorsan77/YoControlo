export type GastoFijo = {
  id: string
  nombre: string
  cantidad: number
  categoria?: string
  icono?: string
  periodicidad: 'Mensual' | 'Anual'
  fechaInicio: string              // Fecha en que se creó o comenzó el gasto
  ultimoPago?: string              // Fecha del último pago generado
}
