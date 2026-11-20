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