import { AuthApiError, AuthRetryableFetchError, AuthWeakPasswordError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getSignUpErrorMessage } from './signUpErrors'

// We build the same error classes Supabase throws, so the type guards
// (isAuthApiError, ...) recognise them like the real ones.
describe('getSignUpErrorMessage', () => {
  it('explains a weak password', () => {
    const error = new AuthWeakPasswordError('Password is too weak', 422, ['length'])

    expect(getSignUpErrorMessage(error)).toBe('La contraseña es demasiado débil. Elige una más segura.')
  })

  it.each(['user_already_exists', 'email_exists'])('explains an email already in use (%s)', (code) => {
    const error = new AuthApiError('User already registered', 422, code)

    expect(getSignUpErrorMessage(error)).toBe(
      'Ya existe una cuenta con este email. Inicia sesión o usa otro email.',
    )
  })

  it('explains too many attempts', () => {
    const error = new AuthApiError('Email rate limit exceeded', 429, 'over_email_send_rate_limit')

    expect(getSignUpErrorMessage(error)).toBe('Demasiados intentos. Espera un rato y vuelve a probar.')
  })

  it('explains a network error', () => {
    const error = new AuthRetryableFetchError('Failed to fetch', 0)

    expect(getSignUpErrorMessage(error)).toBe(
      'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.',
    )
  })

  it('uses the generic message for other Supabase errors', () => {
    const error = new AuthApiError('Something else', 500, 'unexpected_failure')

    expect(getSignUpErrorMessage(error)).toBe('Algo ha ido mal al crear la cuenta. Vuelve a probar más tarde.')
  })

  it('uses the generic message for a normal Error', () => {
    expect(getSignUpErrorMessage(new Error('boom'))).toBe(
      'Algo ha ido mal al crear la cuenta. Vuelve a probar más tarde.',
    )
  })

  it('uses the generic message when something that is not an error is thrown', () => {
    expect(getSignUpErrorMessage('boom')).toBe('Algo ha ido mal al crear la cuenta. Vuelve a probar más tarde.')
  })
})
