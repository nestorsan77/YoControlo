import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged, 
  type User
} from "firebase/auth"

// ✅ Registrar usuario
export async function registrar(email: string, password: string) {
  const res = await createUserWithEmailAndPassword(auth, email, password)
  return res.user
}

// ✅ Iniciar sesión
export async function login(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password)
  return res.user
}

// ✅ Cerrar sesión
export async function logout() {
  await signOut(auth)
}

// ✅ Escuchar cambios de autenticación
export function onUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
