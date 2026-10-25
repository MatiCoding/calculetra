import { describe, expect, it } from 'vitest'
import { readOAuthReturn } from './oauthReturn'

describe('readOAuthReturn', () => {
  it('returns none when the URL has no error', () => {
    expect(readOAuthReturn('', '')).toEqual({ kind: 'none' })
  })

  it('returns none when the URL only has other params', () => {
    expect(readOAuthReturn('?page=2', '#top')).toEqual({ kind: 'none' })
  })

  it('returns cancelled when the user denied access (error in the hash)', () => {
    expect(
      readOAuthReturn('', '#error=access_denied&error_description=The+user+denied+access'),
    ).toEqual({ kind: 'cancelled' })
  })

  it('returns cancelled when the error comes in the query', () => {
    expect(readOAuthReturn('?error=access_denied', '')).toEqual({ kind: 'cancelled' })
  })

  it('returns an error with a message for any other provider error', () => {
    expect(
      readOAuthReturn('', '#error=server_error&error_description=Unable+to+exchange+external+code'),
    ).toEqual({
      kind: 'error',
      message: 'No se ha podido iniciar sesión con tu cuenta externa. Inténtalo de nuevo o entra con tu email.',
    })
  })
})