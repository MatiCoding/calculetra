import { describe, expect, it } from 'vitest'
import { cleanTileText, sameAvatar, withColor, type Avatar } from './avatar'

const avatar: Avatar = {
  kind: 'thumb',
  text: '',
  expression: 'happy',
  thumbColor: 'mustard',
  color: 'blue',
  style: 'flat',
}

describe('withColor', () => {
  it('changes the background colour', () => {
    expect(withColor(avatar, 'teal')).toEqual({ ...avatar, color: 'teal' })
  })

  it('does not change the avatar it gets', () => {
    withColor(avatar, 'teal')

    expect(avatar.color).toBe('blue')
  })

  it('gives the character another colour when it would match the background', () => {
    const result = withColor(avatar, 'mustard')

    expect(result.color).toBe('mustard')
    expect(result.thumbColor).not.toBe('mustard')
  })

  it('gives the character the first other colour of the palette', () => {
    expect(withColor({ ...avatar, thumbColor: 'blue', color: 'teal' }, 'blue').thumbColor).toBe('mustard')
    expect(withColor(avatar, 'mustard').thumbColor).toBe('blue')
  })
})

describe('cleanTileText', () => {
  it('keeps letters and numbers, in capitals', () => {
    expect(cleanTileText('mr')).toBe('MR')
    expect(cleanTileText('100')).toBe('100')
    expect(cleanTileText('ñú')).toBe('ÑÚ')
  })

  it('keeps 3 characters at most', () => {
    expect(cleanTileText('mateo')).toBe('MAT')
  })

  it('removes anything that is not a letter or a number', () => {
    expect(cleanTileText('a_b-c d!')).toBe('ABC')
    expect(cleanTileText('😀')).toBe('')
  })

  it('joins a letter and its accent typed as two characters', () => {
    expect(cleanTileText('á'.normalize('NFD'))).toBe('Á')
  })

  it('can be empty', () => {
    expect(cleanTileText('')).toBe('')
  })
})

describe('sameAvatar', () => {
  it('is true for two avatars with the same fields', () => {
    expect(sameAvatar(avatar, { ...avatar })).toBe(true)
  })

  it('is false when any field is different', () => {
    expect(sameAvatar(avatar, { ...avatar, kind: 'text' })).toBe(false)
    expect(sameAvatar(avatar, { ...avatar, text: 'M' })).toBe(false)
    expect(sameAvatar(avatar, { ...avatar, expression: 'wink' })).toBe(false)
    expect(sameAvatar(avatar, { ...avatar, thumbColor: 'teal' })).toBe(false)
    expect(sameAvatar(avatar, { ...avatar, color: 'teal' })).toBe(false)
    expect(sameAvatar(avatar, { ...avatar, style: 'outline' })).toBe(false)
  })
})
