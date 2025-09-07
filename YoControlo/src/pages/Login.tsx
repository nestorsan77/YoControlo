// src/pages/Login.tsx
import { useState } from 'react'
import { login, registrar } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../contexts/SettingsContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()
  const { settings } = useSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isRegister) {
        await registrar(email, password)
      } else {
        await login(email, password)
      }
      navigate('/') // Redirigir al home tras login
    } catch (err) {
      alert("Error: " + (err as Error).message)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
      settings.darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <form 
        onSubmit={handleSubmit} 
        className={`p-6 rounded shadow-md w-full max-w-sm space-y-4 transition-colors duration-200 ${
          settings.darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <h1 className="text-xl font-bold text-center">
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>

        <input
          type="email"
          placeholder="Correo"
          className={`w-full border p-2 rounded transition-colors duration-200 ${
            settings.darkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className={`w-full border p-2 rounded transition-colors duration-200 ${
            settings.darkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200">
          {isRegister ? 'Registrarse' : 'Entrar'}
        </button>

        <p
          className="text-sm text-center text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </form>
    </div>
  )
}