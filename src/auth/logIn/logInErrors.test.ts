import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getLogInErrorMessage } from './logInErrors'

const GENERIC = 'Error desconocido. Por favor, inténtalo de nuevo más tarde.'

describe('getLogInErrorMessage', () => {
  it('explains wrong email or password', () => {
    const error = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials')

    expect(getLogInErrorMessage(error)).toBe(
      'Correo electrónico o contraseña incorrectos. Vuelve a intentarlo.',
    )
  })

  it('explains an unconfirmed email', () => {
    const error = new AuthApiError('Email not confirmed', 400, 'email_not_confirmed')

    expect(getLogInErrorMessage(error)).toBe(
      'La cuenta existe pero no ha confirmado el email. Revisa tu correo y confirma la cuenta antes de iniciar sesión.',
    )
  })

  it('explains a network error', () => {
    const error = new AuthRetryableFetchError('Failed to fetch', 0)

    expect(getLogInErrorMessage(error)).toBe(
      'Se ha producido un error de red. Revisa tu conexión a internet y vuelve a intentarlo.',
    )
  })

  it('uses the generic message for other Supabase errors', () => {
    const error = new AuthApiError('Something else', 500, 'unexpected_failure')

    expect(getLogInErrorMessage(error)).toBe(GENERIC)
  })

  it('uses the generic message for a normal Error', () => {
    expect(getLogInErrorMessage(new Error('boom'))).toBe(GENERIC)
  })

  it('uses the generic message when something that is not an error is thrown', () => {
    expect(getLogInErrorMessage('boom')).toBe(GENERIC)
  })
})