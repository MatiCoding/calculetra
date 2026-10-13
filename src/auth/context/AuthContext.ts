import { createContext } from 'react'
import type { AuthUser, logIn, signUp, logOut } from '../api/auth'

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: typeof signUp
  logIn: typeof logIn
  logOut: typeof logOut
}

// Only AuthProvider and useAuth use this. Components call useAuth() instead.
export const AuthContext = createContext<AuthContextValue | null>(null)
