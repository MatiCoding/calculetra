import { createAvatar } from "@dicebear/core";
import * as thumbs from '@dicebear/thumbs'
import type { AvatarColor, ThumbExpression} from '../../profile/avatar'
import { AVATAR_PALETTE } from "./avatarPalette";

type Eyes = NonNullable<thumbs.Options['eyes']>[number]
type Mouth = NonNullable<thumbs.Options['mouth']>[number]

// Each expression is a pair of eyes and mouth from the Thumbs style of DiceBear.
export const THUMB_EXPRESSIONS_INFO: Record<ThumbExpression, { name: string; eyes: Eyes; mouth: Mouth }> = {
  happy: { name: 'Feliz', eyes: 'variant6W12', mouth: 'variant1' },
  laugh: { name: 'Risa', eyes: 'variant3W12', mouth: 'variant2' },
  in_love: { name: 'Enamorado', eyes: 'variant1W12', mouth: 'variant2' },
  calm: { name: 'Tranquilo', eyes: 'variant2W12', mouth: 'variant3' },
  wink: { name: 'Guiño', eyes: 'variant9W12', mouth: 'variant1' },
  kiss: { name: 'Beso', eyes: 'variant2W12', mouth: 'variant5' },
  excited: { name: 'Ilusionado', eyes: 'variant4W12', mouth: 'variant2' },
  cool: { name: 'Chulito', eyes: 'variant7W12', mouth: 'variant4' },
}

// DiceBear wants colours without "#".
const noHash = (hex: string) => hex.slice(1)

// Draws the Thumbs character as an SVG data URI, ready for an img src.
// Always the same drawing for the same expression and colour: offsets and rotations are 0, and the background is transparent (the tile paints it).
export function thumbDataUri(expression: ThumbExpression, color: AvatarColor): string {
  const { eyes, mouth } = THUMB_EXPRESSIONS_INFO[expression]
  const { hex, text } = AVATAR_PALETTE[color]

  return createAvatar(thumbs, {
    backgroundColor: ['transparent'],
    shapeColor: [noHash(hex)],
    eyes: [eyes],
    mouth: [mouth],
    eyesColor: [noHash(text)],
    mouthColor: [noHash(text)],
    faceOffsetX: [0],
    faceOffsetY: [0],
    faceRotation: [0],
    shapeOffsetX: [0],
    shapeOffsetY: [0],
    shapeRotation: [0],
  }).toDataUri()
}