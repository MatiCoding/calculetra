// What the provider left in the URL when it sent the user back to us.
export type OAuthReturn =
  | { kind: 'none' }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string }

const ERROR_MESSAGE =
  'No se ha podido iniciar sesión con tu cuenta externa. Inténtalo de nuevo o entra con tu email.'

// Reads the error that the provider (through Supabase) puts in the URL when
// the login does not work. It can come after # or after ?, so we look at both.
export function readOAuthReturn(search: string, hash: string): OAuthReturn {
  const hashParams = new URLSearchParams(hash.slice(1))
  const searchParams = new URLSearchParams(search)
  const error = hashParams.get('error') ?? searchParams.get('error')

  if (error === null) return { kind: 'none' }
  // The user closed or cancelled the provider's window: not an error for us.
  if (error === 'access_denied') return { kind: 'cancelled' }
  return { kind: 'error', message: ERROR_MESSAGE }
}