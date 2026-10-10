import { createContext } from 'react'
import type { AuthUser, logIn, signUp } from './auth'

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: typeof signUp
  logIn: typeof logIn
}

// Only AuthProvider and useAuth use this. Components call useAuth() instead.
export const AuthContext = createContext<AuthContextValue | null>(null)
