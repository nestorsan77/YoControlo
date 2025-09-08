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
import { sincronizarTodo } from './services/syncService'
import Header from './components/Header'
import { SettingsProvider } from './contexts/SettingsContext'
import GastosFijos from './pages/GastosFijos'
import Splash from './components/Splash'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [splashFinished, setSplashFinished] = useState(false)

  // 🔹 Configuración del favicon y título
  useEffect(() => {
    document.title = "YoControlo"
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (link) link.href = "./image/dinero512x512.png"
  }, [])

  // 🔐 Escuchar cambios de usuario (login persistente)
  useEffect(() => {
    return onUserChanged((u) => {
      setUser(u)
      setLoading(false)
      
      // 🟢 Cuando el usuario se autentica
      if (u) {
        if (navigator.onLine) {
          // Online: sincronizar todo (incluye generar gastos automáticos)
          sincronizarTodo()
        } else {
          // Offline: solo generar gastos automáticos localmente
          import('./services/pagosAutomaticosService').then(({ generarPagosAutomáticos }) => {
            generarPagosAutomáticos()
          })
        }
      }
    })
  }, [])

  // 📶 Detectar cuando vuelve a estar online y sincronizar
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restaurada. Sincronizando todo...')
      if (user) sincronizarTodo() // Esto incluye la generación de gastos automáticos
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  // 🔹 Mostrar splash mientras carga usuario y datos iniciales
  if (!splashFinished || loading) {
    return (
      <Splash
        //duration={2000} // 2s mínimo, pero se cierra al terminar carga si antes
        onFinish={() => setSplashFinished(true)}
      />
    )
  }

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
