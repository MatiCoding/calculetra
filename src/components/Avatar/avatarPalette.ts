import type { AvatarColor } from '../../profile/avatar'

// Colours of the avatar. `text` is the colour of letters (and of the face of the Thumbs character) on that background, chosen so they can be read.
export const AVATAR_PALETTE: Record<AvatarColor, { name: string; hex: string; dark: string; text: string }> = {
  mustard: { name: 'Mostaza', hex: '#e8a317', dark: '#b57d0c', text: '#1f2430' },
  blue: { name: 'Azul', hex: '#1e5aa8', dark: '#154483', text: '#ffffff' },
  brick: { name: 'Teja', hex: '#c4512f', dark: '#8f3a21', text: '#ffffff' },
  green: { name: 'Verde', hex: '#2f8a5b', dark: '#1f6140', text: '#ffffff' },
  teal: { name: 'Turquesa', hex: '#1c8c8c', dark: '#136363', text: '#ffffff' },
  plum: { name: 'Ciruela', hex: '#7a3e8e', dark: '#552a64', text: '#ffffff' },
  coral: { name: 'Coral', hex: '#e0706a', dark: '#b04a45', text: '#1f2430' },
  ink: { name: 'Tinta', hex: '#2b3140', dark: '#12151c', text: '#ffffff' },
}