import type { User } from '@supabase/supabase-js'
import { AuthApiError, isAuthSessionMissingError } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

// The rest of the app only knows this type, never Supabase's User.
export type AuthUser = {
  id: string
  email: string
}

function toAuthUser(user: User): AuthUser {
  // Supabase allows users without email (phone login). We only use email,
  // so an empty string is enough here.
  return { id: user.id, email: user.email ?? '' }
}

export async function logIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return toAuthUser(data.user)
}

// Returns null if the aacount is created but not yet confirmed (email confirmation pending).
export async function signUp(email: string, password: string): Promise<AuthUser | null> {
    const {data, error} = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user !== null && data.user.identities?.length === 0) throw new AuthApiError('Usuario ya registrado', 422, 'user_already_exists')
    if (data.session === null) return null
    return toAuthUser(data.session.user)
}

export async function logOut(): Promise<void> {
    // "global" ends the session on every device so a copied token stops working.
    const {error} = await supabase.auth.signOut({scope: 'global'})
    if (error) throw error
}

// Asks the server if the saved session is still valid, instead of
// trusting what is stored in the browser.
export async function getCurrentUser(): Promise<AuthUser | null> {
    const {data, error} = await supabase.auth.getUser()
    if (isAuthSessionMissingError(error)) return null
    if (error) throw error
    return toAuthUser(data.user)
}

// Calls `callback` every time the user logs in or out.
// Returns a function that stops listening.
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // The session at start-up is checked by getCurrentUser, not here.
    if (event === 'INITIAL_SESSION') return
    callback(session ? toAuthUser(session.user) : null)
  })
  return () => data.subscription.unsubscribe()
}
