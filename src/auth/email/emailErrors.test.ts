import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getChangeEmailErrorMessage } from './emailErrors'

describe('getChangeEmailErrorMessage', () => {
  it('explains that the email is already in use', () => {
    const error = new AuthApiError('A user with this email address has already been registered', 422, 'email_exists')

    expect(getChangeEmailErrorMessage(error)).toBe('Ya existe una cuenta con este correo.')
  })

  it('explains that the email is not valid', () => {
    const error = new AuthApiError('Unable to validate email address: invalid format', 400, 'email_address_invalid')

    expect(getChangeEmailErrorMessage(error)).toBe('Introduce un email válido.')
  })

  it('explains that too many emails were sent', () => {
    const error = new AuthApiError('Email rate limit exceeded', 429, 'over_email_send_rate_limit')

    expect(getChangeEmailErrorMessage(error)).toBe('Demasiados intentos. Espera un rato y vuelve a probar.')
  })

  it('explains a network error', () => {
    expect(getChangeEmailErrorMessage(new AuthRetryableFetchError('Failed to fetch', 0))).toBe(
      'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.',
    )
  })

  it.each([
    ['another Supabase error', new AuthApiError('Something else', 500, 'unexpected_failure')],
    ['a normal Error', new Error('boom')],
  ])('shows a general message for %s', (_name, error) => {
    expect(getChangeEmailErrorMessage(error)).toBe('Algo ha ido mal al cambiar el correo. Vuelve a probar más tarde.')
  })
})