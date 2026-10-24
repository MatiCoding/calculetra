import { describe, expect, it } from 'vitest'
import { validateNewEmail } from './validateNewEmail'

const CURRENT = 'ana@example.com'

describe('validateNewEmail', () => {
  it('returns null for a valid, different email', () => {
    expect(validateNewEmail('ana.nueva@example.com', CURRENT)).toBeNull()
  })

  it.each(['', 'ana', 'ana@', 'ana@example', '@example.com', 'ana @example.com'])(
    'rejects the email "%s"',
    (email) => {
      expect(validateNewEmail(email, CURRENT)).toBe('Introduce un email válido.')
    },
  )

  it('rejects the current email', () => {
    expect(validateNewEmail(CURRENT, CURRENT)).toBe('El correo nuevo tiene que ser distinto del actual.')
  })

  it('rejects the current email with other capital letters or spaces', () => {
    expect(validateNewEmail('  Ana@Example.com ', CURRENT)).toBe(
      'El correo nuevo tiene que ser distinto del actual.',
    )
  })
})