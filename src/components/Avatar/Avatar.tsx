import { useMemo, type CSSProperties } from 'react'
import type { Avatar as AvatarData } from '../../profile/avatar'
import { AVATAR_PALETTE } from './avatarPalette'
import { thumbDataUri } from './thumb'
import styles from './Avatar.module.css'

type AvatarProps = {
  nickname: string
  avatar: AvatarData
  size?: number // In pixels.
  decorative?: boolean  // Hidden from screen readers, for avatars inside a button that already has a name.  
}

// The text of a text tile: what the user wrote, or the first letter of the nickname.
function tileText(nickname: string, text: string): string {
  return text || [...nickname][0]?.toUpperCase() || '?'
}

function Avatar({ nickname, avatar, size = 58, decorative = false }: AvatarProps) {
  const color = AVATAR_PALETTE[avatar.color]
  // Drawing the SVG is not free: only redo it when the expression or the colour change.
  const thumb = useMemo(
    () => (avatar.kind === 'thumb' ? thumbDataUri(avatar.expression, avatar.thumbColor) : null),
    [avatar.kind, avatar.expression, avatar.thumbColor],
  )
  const text = tileText(nickname, avatar.text)

  const variables = {
    '--size': `${size}px`,
    '--color': color.hex,
    '--text': color.text,
  } as CSSProperties

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Avatar de ${nickname}`}
      aria-hidden={decorative || undefined}
      className={`${styles.avatar} ${styles[avatar.style]}`}
      style={variables}
    >
      {thumb ? (
        <img src={thumb} alt="" className={styles.thumb} />
      ) : (
        <span aria-hidden="true" className={styles.text} data-length={[...text].length}>
          {text}
        </span>
      )}
    </span>
  )
}

export default Avatar