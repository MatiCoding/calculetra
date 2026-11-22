export const AVATAR_COLORS = ['mustard', 'blue', 'brick', 'green', 'teal', 'plum', 'coral', 'ink'] as const
export const THUMB_EXPRESSIONS = ['happy', 'laugh', 'in_love', 'calm', 'wink', 'kiss', 'excited', 'cool'] as const

export type AvatarColor = (typeof AVATAR_COLORS)[number]
export type ThumbExpression = (typeof THUMB_EXPRESSIONS)[number]

export type Avatar = {
    kind: 'thumb' | 'text'
    text: string
    expression: ThumbExpression
    thumbColor: AvatarColor
    color: AvatarColor  // Background of the tile.
    style: 'flat' | 'outline'
}

// Changes the background color. The character can never have the color of its background (it would be invisible),
// so if they would match, the caracter takes the first other color.
export function withColor(avatar: Avatar, color: AvatarColor): Avatar {
  const thumbColor = avatar.thumbColor === color ? AVATAR_COLORS.find((other) => other !== color)! : avatar.thumbColor
  return { ...avatar, color, thumbColor }
}

const TILE_TEXT_CHARACTER = /^[A-Z0-9ÁÉÍÓÚÜÑ]$/

// Keeeps only what a text tile can show: up to 3 letters or numbers, in capitals.
export function cleanTileText(input: string): string {
  return [...input.normalize('NFC').toUpperCase()]
    .filter((character) => TILE_TEXT_CHARACTER.test(character))
    .slice(0, 3)
    .join('')
}

// True if both avatars look the same (every field is equal).
export function sameAvatar(a: Avatar, b: Avatar): boolean {
  return (Object.keys(a) as (keyof Avatar)[]).every((key) => a[key] === b[key])
}