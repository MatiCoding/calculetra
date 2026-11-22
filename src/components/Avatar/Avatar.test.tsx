// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Avatar as AvatarData } from '../../profile/avatar'
import { AVATAR_PALETTE } from './avatarPalette'
import { thumbDataUri } from './thumb'
import Avatar from './Avatar'

const thumbAvatar: AvatarData = {
  kind: 'thumb',
  text: '',
  expression: 'happy',
  thumbColor: 'mustard',
  color: 'blue',
  style: 'flat',
}

const textAvatar: AvatarData = { ...thumbAvatar, kind: 'text', text: 'MR' }

describe('Avatar', () => {
  afterEach(cleanup)

  it('is an image called "Avatar de" and the nickname', () => {
    render(<Avatar nickname="mateo" avatar={thumbAvatar} />)

    expect(screen.getByRole('img', { name: 'Avatar de mateo' })).toBeTruthy()
  })

  it('draws the Thumbs character with its expression and colour', () => {
    const { container } = render(<Avatar nickname="mateo" avatar={thumbAvatar} />)

    const drawing = container.querySelector('img')
    expect(drawing?.getAttribute('src')).toBe(thumbDataUri('happy', 'mustard'))
  })

  it('hides the drawing itself from screen readers (the tile already has a name)', () => {
    const { container } = render(<Avatar nickname="mateo" avatar={thumbAvatar} />)

    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('shows the text of a text tile', () => {
    render(<Avatar nickname="mateo" avatar={textAvatar} />)

    expect(screen.getByText('MR')).toBeTruthy()
  })

  it('does not draw the character on a text tile', () => {
    const { container } = render(<Avatar nickname="mateo" avatar={textAvatar} />)

    expect(container.querySelector('img')).toBeNull()
  })

  it('shows the first letter of the nickname, in capitals, when the text is empty', () => {
    render(<Avatar nickname="player_4821" avatar={{ ...textAvatar, text: '' }} />)

    expect(screen.getByText('P')).toBeTruthy()
  })

  it('shows the first letter of a nickname that starts with an accent', () => {
    render(<Avatar nickname="ñandú" avatar={{ ...textAvatar, text: '' }} />)

    expect(screen.getByText('Ñ')).toBeTruthy()
  })

  it('hides the text from screen readers (the tile already has a name)', () => {
    render(<Avatar nickname="mateo" avatar={textAvatar} />)

    expect(screen.getByText('MR').getAttribute('aria-hidden')).toBe('true')
  })

  it('tells the CSS how long the text is, so long texts can be smaller', () => {
    render(<Avatar nickname="mateo" avatar={{ ...textAvatar, text: '100' }} />)

    expect(screen.getByText('100').getAttribute('data-length')).toBe('3')
  })

  it('uses the size it is given', () => {
    render(<Avatar nickname="mateo" avatar={thumbAvatar} size={120} />)

    const tile = screen.getByRole('img', { name: 'Avatar de mateo' })
    expect(tile.style.getPropertyValue('--size')).toBe('120px')
  })

  it('is 58 px by default', () => {
    render(<Avatar nickname="mateo" avatar={thumbAvatar} />)

    const tile = screen.getByRole('img', { name: 'Avatar de mateo' })
    expect(tile.style.getPropertyValue('--size')).toBe('58px')
  })

  it('paints the tile with the chosen colour', () => {
    render(<Avatar nickname="mateo" avatar={{ ...thumbAvatar, color: 'plum' }} />)

    const tile = screen.getByRole('img', { name: 'Avatar de mateo' })
    expect(tile.style.getPropertyValue('--color')).toBe(AVATAR_PALETTE.plum.hex)
    expect(tile.style.getPropertyValue('--text')).toBe(AVATAR_PALETTE.plum.text)
  })

  it.each(['flat', 'outline'] as const)('uses the "%s" style', (style) => {
    render(<Avatar nickname="mateo" avatar={{ ...thumbAvatar, style }} />)

    const tile = screen.getByRole('img', { name: 'Avatar de mateo' })
    expect(tile.className).toContain(style)
  })

  it('can be hidden from screen readers, for a button that already has a name', () => {
    const { container } = render(<Avatar nickname="mateo" avatar={thumbAvatar} decorative />)

    expect(screen.queryByRole('img')).toBeNull()
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
})
