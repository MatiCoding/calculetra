import { describe, expect, it } from 'vitest'
import {
  MAX_NICKNAME_LENGTH,
  MIN_NICKNAME_LENGTH,
  normalizeNickname,
  validateNickname,
} from './nickname'

describe('normalizeNickname', () => {
  it('removes the spaces around the nickname', () => {
    expect(normalizeNickname('  mateo ')).toBe('mateo')
  })

  it('joins a letter and its accent typed as two characters', () => {
    const decomposed = 'Begoña'.normalize('NFD') // "ñ" as "n" + a combining tilde

    expect(normalizeNickname(decomposed)).toBe('Begoña')
    expect(normalizeNickname(decomposed)).toHaveLength(6)
  })
})

describe('validateNickname', () => {
  it.each(['mateo', 'Mateo_23', 'player_4821', '___', 'Íñigo', 'pingüino', 'ÁÉÍÓÚÜÑ'])(
    'accepts "%s"',
    (nickname) => {
      expect(validateNickname(nickname)).toBeNull()
    },
  )

  it('accepts a nickname with exactly the minimum length', () => {
    expect(validateNickname('a'.repeat(MIN_NICKNAME_LENGTH))).toBeNull()
  })

  it('accepts a nickname with exactly the maximum length', () => {
    expect(validateNickname('a'.repeat(MAX_NICKNAME_LENGTH))).toBeNull()
  })

  it.each(['', 'a', 'ab'])('rejects the short nickname "%s"', (nickname) => {
    expect(validateNickname(nickname)).toBe(`Mínimo ${MIN_NICKNAME_LENGTH} caracteres.`)
  })

  it('rejects a nickname one character longer than the maximum', () => {
    expect(validateNickname('a'.repeat(MAX_NICKNAME_LENGTH + 1))).toBe(
      `Máximo ${MAX_NICKNAME_LENGTH} caracteres.`,
    )
  })

  it('does not count the spaces around the nickname', () => {
    expect(validateNickname('  ab  ')).toBe(`Mínimo ${MIN_NICKNAME_LENGTH} caracteres.`)
    expect(validateNickname('  abc  ')).toBeNull()
  })

  it('counts a letter typed as letter + accent as one character', () => {
    const twenty = 'a'.repeat(MAX_NICKNAME_LENGTH - 1) + 'á'.normalize('NFD')

    expect(validateNickname(twenty)).toBeNull()
  })

  it.each(['mateo garcía', 'mateo-23', 'mateo.23', 'mateo!', 'ma@teo', 'çaça', 'mateo😀'])(
    'rejects "%s" because of its characters',
    (nickname) => {
      expect(validateNickname(nickname)).toBe('Solo letras, números y _.')
    },
  )

  it('reports the length before the characters', () => {
    expect(validateNickname('a!')).toBe(`Mínimo ${MIN_NICKNAME_LENGTH} caracteres.`)
  })
})
