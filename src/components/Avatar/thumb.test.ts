import { describe, expect, it } from 'vitest'
import { AVATAR_COLORS, THUMB_EXPRESSIONS } from '../../profile/avatar'
import { AVATAR_PALETTE } from './avatarPalette'
import { THUMB_EXPRESSIONS_INFO, thumbDataUri } from './thumb'

// The SVG inside a data URI, as text.
function svgOf(dataUri: string): string {
  return decodeURIComponent(dataUri.replace('data:image/svg+xml;utf8,', ''))
}

describe('thumbDataUri', () => {
  it('returns an SVG data URI', () => {
    expect(thumbDataUri('happy', 'mustard')).toMatch(/^data:image\/svg\+xml/)
    expect(svgOf(thumbDataUri('happy', 'mustard'))).toContain('<svg')
  })

  it('always draws the same character for the same expression and colour', () => {
    expect(thumbDataUri('wink', 'teal')).toBe(thumbDataUri('wink', 'teal'))
  })

  it('paints the character with the chosen colour', () => {
    expect(svgOf(thumbDataUri('happy', 'teal')).toLowerCase()).toContain(AVATAR_PALETTE.teal.hex)
  })

  it('draws a different character for each expression', () => {
    const drawings = THUMB_EXPRESSIONS.map((expression) => thumbDataUri(expression, 'blue'))

    expect(new Set(drawings).size).toBe(THUMB_EXPRESSIONS.length)
  })

  it('draws a different character for each colour', () => {
    const drawings = AVATAR_COLORS.map((color) => thumbDataUri('happy', color))

    expect(new Set(drawings).size).toBe(AVATAR_COLORS.length)
  })
})

describe('THUMB_EXPRESSIONS_INFO', () => {
  it('has a Spanish name for every expression', () => {
    for (const expression of THUMB_EXPRESSIONS) {
      expect(THUMB_EXPRESSIONS_INFO[expression].name).not.toBe('')
    }
  })
})

describe('AVATAR_PALETTE', () => {
  it('has a name and colours for every avatar colour', () => {
    for (const color of AVATAR_COLORS) {
      expect(AVATAR_PALETTE[color].name).not.toBe('')
      expect(AVATAR_PALETTE[color].hex).toMatch(/^#[0-9a-f]{6}$/)
      expect(AVATAR_PALETTE[color].dark).toMatch(/^#[0-9a-f]{6}$/)
      expect(AVATAR_PALETTE[color].text).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})
