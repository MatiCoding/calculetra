import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH, validateSignUp } from './validateSignUp'

const EMAIL = 'ana@example.com'
const PASSWORD = 'a'.repeat(MIN_PASSWORD_LENGTH)

describe('validateSignUp', () => {
  it('returns null when everything is valid', () => {
    expect(validateSignUp(EMAIL, PASSWORD, PASSWORD)).toBeNull()
  })

  it.each(['', 'ana', 'ana@', 'ana@example', '@example.com', 'ana @example.com'])(
    'rejects the email "%s"',
    (email) => {
      expect(validateSignUp(email, PASSWORD, PASSWORD)).toBe('Introduce un email válido.')
    },
  )

  it('accepts an email with spaces around it', () => {
    expect(validateSignUp('  ana@example.com ', PASSWORD, PASSWORD)).toBeNull()
  })

  it('rejects a password one character shorter than the minimum', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)

    expect(validateSignUp(EMAIL, short, short)).toBe(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    )
  })

  it('accepts a password with exactly the minimum length', () => {
    expect(validateSignUp(EMAIL, PASSWORD, PASSWORD)).toBeNull()
  })

  it('rejects passwords that do not match', () => {
    expect(validateSignUp(EMAIL, PASSWORD, PASSWORD + 'b')).toBe('Las contraseñas no coinciden.')
  })

  it('reports the email first when several fields are wrong', () => {
    expect(validateSignUp('ana', 'a', 'b')).toBe('Introduce un email válido.')
  })

  it('reports the length before the mismatch', () => {
    expect(validateSignUp(EMAIL, 'a', 'b')).toBe(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    )
  })
})
