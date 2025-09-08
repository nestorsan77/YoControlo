// src/helpers/NumberHelper.ts
export class NumberHelper {
  /**
   * Devuelve un número redondeado a máximo 2 decimales
   * No agrega ceros si no son necesarios
   */
  static formatTwoDecimals(num: number): string {
    // Redondeamos a 2 decimales
    const rounded = Math.round(num * 100) / 100
    return rounded.toString()
  }

  /**
   * Devuelve un número siempre con 2 decimales visibles
   * Ej: 12 -> 12.00, 12.5 -> 12.50
   */
  static formatTwoDecimalsFixed(num: number): string {
    return num.toFixed(2)
  }

  /**
   * Convierte un string a número, eliminando cualquier caracter que no sea dígito o punto
   */
  static parseNumber(input: string): number {
    const raw = input.replace(/[^0-9.]/g, '')
    return parseFloat(raw) || 0
  }
}
