import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, logIn, onAuthChange, signUp, type AuthUser } from './auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore the session saved from a previous visit.
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    // Keep `user` up to date on every login and logout.
    // onAuthChange returns the function that stops listening, which React
    // calls when AuthProvider is removed.
    return onAuthChange(setUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn }}>
      {children}
    </AuthContext.Provider>
  )
}
