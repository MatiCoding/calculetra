import { createContext } from 'react'
import type { AuthUser, logIn, signUp, logOut, resetPassword, updatePassword } from '../api/auth'

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: typeof signUp
  logIn: typeof logIn
  logOut: typeof logOut
  resetPassword: typeof resetPassword
  updatePassword: typeof updatePassword
}

// Only AuthProvider and useAuth use this. Components call useAuth() instead.
export const AuthContext = createContext<AuthContextValue | null>(null)
