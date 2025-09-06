import { useState } from 'react'
import { login, registrar } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>

        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          {isRegister ? 'Registrarse' : 'Entrar'}
        </button>

        <p
          className="text-sm text-center text-blue-600 cursor-pointer"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </form>
    </div>
  )
}
