import type { User } from '@supabase/supabase-js'
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

export async function signUp(email: string, password: string): Promise<AuthUser | null> {
    const {data, error} = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user === null) return null
    return toAuthUser(data.user)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const {data, error} = await supabase.auth.getSession()
    if (error) throw error
    if (data.session === null) return null
    return toAuthUser(data.session.user)
}

// Calls `callback` every time the user logs in or out.
// Returns a function that stops listening.
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? toAuthUser(session.user) : null)
  })
  return () => data.subscription.unsubscribe()
}
