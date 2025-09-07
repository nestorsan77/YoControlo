import { useEffect, useState } from 'react'
import { onUserChanged } from './services/authService'
import type { User } from 'firebase/auth'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Pagos from './pages/Pagos'
import NuevoPago from './pages/NuevoPago'
import MobileNav from './components/MobileNav'
import Settings from './pages/Settings'
import { sincronizarPagos } from './services/syncService'
import Header from './components/Header'
import { SettingsProvider } from './contexts/SettingsContext'
import GastosFijos from './pages/GastosFijos'
import { generarPagosAutomáticos } from './services/pagosAutomaticosService'


export default function App() {
   useEffect(() => {
  document.title = "YoControlo"
  const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
  if (link) link.href = "./image/dinero512x512.png"
}, [])

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

      useEffect(() => {
    if (!user) return

    generarPagosAutomáticos()

    const interval = setInterval(() => {
      generarPagosAutomáticos()
    }, 1 * 60 * 1000) // cada 1 min

    return () => clearInterval(interval)
  }, [user])

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
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  if (loading) return <p>Cargando...</p>

  return (
    <SettingsProvider>
      <BrowserRouter>
        <Header />
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
              <Route path="/settings" element={<Settings />} />
              <Route path="/gastos-fijos" element={<GastosFijos />} />
            </Routes>
            <MobileNav />
          </>
        )}
      </BrowserRouter>
    </SettingsProvider>
  )
}