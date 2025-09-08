// src/components/Toast.tsx
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ToastProps = {
  message: string
  type?: "success" | "error" | "info"
  show: boolean
  onClose: () => void
  duration?: number
  isDark?: boolean
}

export default function Toast({
  message,
  type = "info",
  show,
  onClose,
  duration = 2500,
  isDark,
}: ToastProps) {
  const colors = {
    success: isDark ? "bg-green-800 text-green-200" : "bg-green-100 text-green-700",
    error: isDark ? "bg-red-800 text-red-200" : "bg-red-100 text-red-700",
    info: isDark ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-700",
  }

  // Cierre automático
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [show, duration, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-16 left-1/2 max-w-xs w-[90%] -translate-x-1/2 px-5 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 z-[9999] cursor-pointer select-none ${colors[type]}`}
          onClick={onClose}
        >
          <span className="flex-1 text-sm font-medium">{message}</span>
          <button className="ml-3 text-opacity-70 hover:text-opacity-100 font-bold">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
