import { useEffect, useState } from 'react'
import { onUserChanged } from './services/authService'
import type { User } from 'firebase/auth'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Pagos from './pages/Pagos'
import NuevoPago from './pages/NuevoPago'
import MobileNav from './components/MobileNav'
import { sincronizarPagos } from './services/syncService'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔐 Escuchar cambios de usuario (login persistente)
  useEffect(() => {
    return onUserChanged((u) => {
      setUser(u)
      setLoading(false)

      // 🟢 Sincronizar si inicia sesión y está online
      if (u && navigator.onLine) {
        sincronizarPagos()
      }
    })
  }, [])

  // 📶 Detectar cuando vuelve a estar online y sincronizar
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restaurada. Sincronizando...')
      if (user) sincronizarPagos()

      // ⬇️ Puedes activar esto si quieres notificar
      // alert('Estás online. Se están sincronizando tus datos.')
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  if (loading) return <p>Cargando...</p>

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/nuevo-pago" element={<NuevoPago />} />
          </Routes>
          <MobileNav />
        </>
      )}
    </BrowserRouter>
  )
}
