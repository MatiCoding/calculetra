import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from './validateNewPassword'

const PASSWORD = 'a'.repeat(MIN_PASSWORD_LENGTH)

describe('validateNewPassword', () => {
  it('returns null when the password is valid and repeated', () => {
    expect(validateNewPassword(PASSWORD, PASSWORD)).toBeNull()
  })

  it('rejects a password one character shorter than the minimum', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)

    expect(validateNewPassword(short, short)).toBe(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    )
  })

  it('rejects passwords that do not match', () => {
    expect(validateNewPassword(PASSWORD, PASSWORD + 'b')).toBe('Las contraseñas no coinciden.')
  })

  it('reports the length before the mismatch', () => {
    expect(validateNewPassword('a', 'b')).toBe(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    )
  })
})