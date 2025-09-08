// src/components/PagoAnimacion.tsx
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import cartera from "../assets/cartera.png"

type Props = {
  tipo: "ingreso" | "gasto"
  cantidad: number
  onFinish?: () => void
}

export default function PagoAnimacion({ tipo, cantidad, onFinish }: Props) {
  const [show, setShow] = useState(true)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // ⚡ Hacemos que la animación sea más rápida
    const interval = setInterval(() => {
      setStep((prev) => prev + 1)
    }, 400) // antes 700ms → ahora 400ms

    if (step > 3) {
      clearInterval(interval)
      const timer = setTimeout(() => {
        setShow(false)
        if (onFinish) onFinish()
      }, 800) // antes 1500ms → ahora más corto
      return () => clearTimeout(timer)
    }

    return () => clearInterval(interval)
  }, [step, onFinish])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex flex-col items-center">
            {/* Banco */}
            <motion.img
              src={cartera}
              alt="banco"
              className="w-28 h-28 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Texto de cantidad (+ / -) */}
            {step >= 1 && (
              <motion.div
                key="cantidad"
                className={`absolute -top-12 text-2xl font-bold whitespace-nowrap ${
                  tipo === "ingreso" ? "text-green-400" : "text-red-400"
                }`}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
              >
                {tipo === "ingreso"
                  ? `+${cantidad.toFixed(2)} €`
                  : `-${cantidad.toFixed(2)} €`}
              </motion.div>
            )}

            {/* Loader de puntos */}
            <div className="flex gap-2 mt-20">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    tipo === "ingreso" ? "bg-green-400" : "bg-red-400"
                  }`}
                  animate={{ opacity: step % 3 === i ? 1 : 0.3 }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>

            {/* Texto de completado */}
            {step > 3 && (
              <motion.div
                className="mt-3 text-white font-bold text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                ✅ Completado
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
