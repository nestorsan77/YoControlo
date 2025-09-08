import React from "react";

interface CantidadInputProps {
  cantidad: string;
  setCantidad: (valor: string) => void;
  isDark?: boolean;
  placeholder?: string;
}

const CantidadInput: React.FC<CantidadInputProps> = ({
  cantidad,
  setCantidad,
  isDark = false,
  placeholder = "Cantidad",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir solo números, un punto o coma decimal
    // Regex que permite: números, un punto O una coma, pero no ambos
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    
    if (!regex.test(value)) {
      return; // No actualizar si no cumple el patrón
    }

    // Si está vacío, permitirlo
    if (value === "") {
      setCantidad("");
      return;
    }

    // Reemplazar coma por punto para trabajar con formato estándar
    const normalizedValue = value.replace(",", ".");
    
    // Validar que no tenga más de un separador decimal
    const decimalSeparators = (normalizedValue.match(/\./g) || []).length;
    if (decimalSeparators > 1) {
      return; // No permitir múltiples puntos decimales
    }

    // Limitar a 2 decimales máximo
    const parts = normalizedValue.split(".");
    if (parts[1] && parts[1].length > 2) {
      return; // No permitir más de 2 decimales
    }

    // Actualizar el valor (mantenemos el formato original con coma si el usuario la usó)
    setCantidad(value + " €");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas especiales (backspace, delete, arrows, etc.)
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Enter', 'Escape'
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Permitir números
    if (e.key >= '0' && e.key <= '9') {
      return;
    }

    // Permitir punto y coma decimal (solo si no existe ya uno)
    if ((e.key === '.' || e.key === ',')) {
      const currentValue = e.currentTarget.value;
      const hasDecimalSeparator = currentValue.includes('.') || currentValue.includes(',');
      
      if (!hasDecimalSeparator) {
        return; // Permitir el primer separador decimal
      }
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
  };

  // Limpiar el valor para mostrarlo en el input (sin el " €")
  const displayValue = cantidad.replace(" €", "");

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`p-2 pr-10 border rounded transition-colors w-full ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
        }`}
      />
      <span 
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        €
      </span>
    </div>
  );
};

export default CantidadInput;