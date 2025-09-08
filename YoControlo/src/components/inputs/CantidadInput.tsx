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
  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={cantidad.replace(" €", "")} // solo mostramos el número editable
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          setCantidad(raw ? raw + " €" : "");
        }}
        className={`p-2 pr-10 border rounded transition-colors w-full ${
          isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
        }`}
      />
      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
        €
      </span>
    </div>
  );
};

export default CantidadInput;
