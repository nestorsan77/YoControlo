// src/components/Splash.tsx
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type SplashProps = {
  duration?: number // duración en ms antes de ocultar el splash
  onFinish?: () => void // callback cuando termine
}

export default function Splash({ duration = 300, onFinish }: SplashProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onFinish?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onFinish])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-600 text-white"
        >
          <div className="flex flex-col items-center">
            <img
              src="./image/dinero512x512.png"
              alt="Logo"
              className="w-24 h-24 mb-4 animate-bounce"
            />
            <h1 className="text-3xl font-bold">YoControlo</h1>
            <p className="mt-2 text-white/80 text-sm">Cargando...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
