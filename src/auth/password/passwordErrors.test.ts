import { AuthApiError, AuthRetryableFetchError, AuthWeakPasswordError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getNewPasswordErrorMessage, getResetPasswordErrorMessage } from './passwordErrors'

const NETWORK_MESSAGE = 'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.'

describe('getResetPasswordErrorMessage', () => {
  it('explains a network error', () => {
    expect(getResetPasswordErrorMessage(new AuthRetryableFetchError('Failed to fetch', 0))).toBe(NETWORK_MESSAGE)
  })

  it.each([
    ['too many emails', new AuthApiError('Email rate limit exceeded', 429, 'over_email_send_rate_limit')],
    ['too many requests', new AuthApiError('Too many requests', 429, 'over_request_rate_limit')],
    ['another Supabase error', new AuthApiError('Something else', 500, 'unexpected_failure')],
    ['a normal Error', new Error('boom')],
  ])('hides %s', (_name, error) => {
    expect(getResetPasswordErrorMessage(error)).toBeNull()
  })
})

describe('getNewPasswordErrorMessage', () => {
  it('explains a weak password', () => {
    const error = new AuthWeakPasswordError('Password is too weak', 422, ['length'])

    expect(getNewPasswordErrorMessage(error)).toBe('La contraseña es demasiado débil. Elige una más segura.')
  })

  it('explains that the password is the same as before', () => {
    const error = new AuthApiError('New password should be different', 422, 'same_password')

    expect(getNewPasswordErrorMessage(error)).toBe('La nueva contraseña tiene que ser distinta de la actual.')
  })

  it('explains a network error', () => {
    expect(getNewPasswordErrorMessage(new AuthRetryableFetchError('Failed to fetch', 0))).toBe(NETWORK_MESSAGE)
  })

  it.each([
    ['another Supabase error', new AuthApiError('Something else', 500, 'unexpected_failure')],
    ['a normal Error', new Error('boom')],
    ['something that is not an error', 'boom'],
  ])('uses the generic message for %s', (_name, error) => {
    expect(getNewPasswordErrorMessage(error)).toBe(
      'Algo ha ido mal al guardar la contraseña. Vuelve a probar más tarde.',
    )
  })
})