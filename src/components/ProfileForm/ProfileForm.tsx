import { useEffect, useState, type SubmitEvent } from 'react'
import { isNicknameAvailable, NicknameTakenError, updateProfile, type Profile } from '../../profile/api/profile'
import { normalizeNickname, validateNickname } from '../../profile/nickname'
import Avatar from '../Avatar/Avatar'
import { AVATAR_COLORS, THUMB_EXPRESSIONS, cleanTileText, sameAvatar, withColor,
  type Avatar as AvatarData, type AvatarColor } from '../../profile/avatar'
import { AVATAR_PALETTE } from '../Avatar/avatarPalette'
import { THUMB_EXPRESSIONS_INFO } from '../Avatar/thumb'

import styles from './ProfileForm.module.css'
import buttons from '../buttons.module.css'

type ProfileFormProps = {
    profile: Profile
    onSaved: (profile: Profile) => void
}

const CHECK_DELAY_MS = 400  // How long to wait after the last key before asking if the nickname is free.

type Check = { nickname: string; available: boolean }   // The answer of the last availability check, and the nickname it was for.

const STYLES: { id: AvatarData['style']; name: string }[] = [
  { id: 'flat', name: 'Plana' },
  { id: 'outline', name: 'Contorno' },
]

type ColorChoicesProps = {
  label: string
  selected: AvatarColor
  onChoose: (color: AvatarColor) => void
  // A colour that cannot be chosen (the one of the character or of the background).
  unavailable?: AvatarColor
}

// A row of round buttons, one per colour of the palette.
function ColorChoices({ label, selected, onChoose, unavailable }: ColorChoicesProps) {
  return (
    <fieldset className={styles.group}>
      <legend>{label}</legend>
      <div className={styles.choices}>
        {AVATAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={styles.swatch}
            style={{ background: AVATAR_PALETTE[color].hex }}
            aria-label={AVATAR_PALETTE[color].name}
            title={AVATAR_PALETTE[color].name}
            aria-pressed={color === selected}
            disabled={color === unavailable}
            onClick={() => onChoose(color)}
          />
        ))}
      </div>
    </fieldset>
  )
}

// The line under the nickname field.
function nicknameHint(error: string | null, isCurrent: boolean, check: Check | null, nickname: string) {
  if (error) return { text: error, isError: true }
  if (isCurrent) return { text: 'Es tu nickname actual.', isError: false }
  // The answer is for an older nickname: a new check is on its way.
  if (check?.nickname !== nickname) return { text: 'Comprobando…', isError: false }
  if (!check.available) return { text: 'Ese nickname ya está cogido.', isError: true }
  return { text: '¡Disponible!', isError: false }
}

function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [nickname, setNickname] = useState(profile.nickname)
  const [avatar, setAvatar] = useState(profile.avatar)  
  const [check, setCheck] = useState<Check | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const clean = normalizeNickname(nickname)
  const validationError = validateNickname(nickname)
  const isCurrent = clean === profile.nickname
  const needsCheck = validationError === null && !isCurrent

  // While typing, ask if the nickname is free, but only after a short pause:
  // one question per pause, not one per key.
  useEffect(() => {
    if (!needsCheck) return
    let ignore = false
    const timer = setTimeout(() => {
      isNicknameAvailable(profile.id, clean).then(
        (available) => {
          if (!ignore) setCheck({ nickname: clean, available })
        },
        // If the check fails, nothing is shown: saving still tells.
        () => {},
      )
    }, CHECK_DELAY_MS)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [needsCheck, clean, profile.id])

  const hint = nicknameHint(validationError, isCurrent, check, clean)
  const taken = check?.nickname === clean && !check.available
  const changed = !isCurrent || !sameAvatar(avatar, profile.avatar)
  const canSave = validationError === null && !taken && changed && !saving

  // Every change of the avatar goes through here, so "Perfil guardado" goes away.
  function changeAvatar(change: (avatar: AvatarData) => AvatarData) {
    setAvatar(change)
    setSaved(false)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)

    try {
      const result = await updateProfile(profile.id, nickname, avatar)
      setNickname(result.nickname)
      setAvatar(result.avatar)
      setSaved(true)
      onSaved(result)
    } catch (err) {
      if (err instanceof NicknameTakenError) {
        // Someone took it after the check: show it like the check would.
        setCheck({ nickname: clean, available: false })
      } else {
        setError('No se ha podido guardar el perfil. Inténtalo de nuevo.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.preview}>
        <Avatar nickname={clean || profile.nickname} avatar={avatar} size={110} />
        <span className={styles.caption}>{clean}</span>
      </div>

      <div className={styles.options}>
        <div className={styles.field}>
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setSaved(false)
            }}
            autoComplete="nickname"
            spellCheck={false}
            aria-invalid={hint.isError}
            aria-describedby="nickname-hint nickname-rules"
          />
          <p id="nickname-hint" aria-live="polite" className={hint.isError ? styles.error : styles.hint}>
            {hint.text}
          </p>
          <p id="nickname-rules" className={styles.hint}>
            De 3 a 20 caracteres: letras, números y _.
          </p>
        </div>
        <fieldset className={styles.group}>
          <legend>Contenido</legend>
          <div className={styles.segmented}>
            <button
              type="button"
              aria-pressed={avatar.kind === 'thumb'}
              onClick={() => changeAvatar((a) => ({ ...a, kind: 'thumb' }))}
            >
              Avatar
            </button>
            <button
              type="button"
              aria-pressed={avatar.kind === 'text'}
              onClick={() => changeAvatar((a) => ({ ...a, kind: 'text' }))}
            >
              Texto
            </button>
          </div>
        </fieldset>

        {avatar.kind === 'thumb' ? (
          <>
            <fieldset className={styles.group}>
              <legend>Expresión</legend>
              <div className={styles.choices}>
                {THUMB_EXPRESSIONS.map((expression) => (
                  <button
                    key={expression}
                    type="button"
                    className={styles.expression}
                    aria-pressed={expression === avatar.expression}
                    onClick={() => changeAvatar((a) => ({ ...a, expression }))}
                  >
                    <Avatar nickname={clean} avatar={{ ...avatar, expression }} size={48} decorative />
                    {THUMB_EXPRESSIONS_INFO[expression].name}
                  </button>
                ))}
              </div>
            </fieldset>

            <ColorChoices
              label="Color del avatar"
              selected={avatar.thumbColor}
              unavailable={avatar.color}
              onChoose={(thumbColor) => changeAvatar((a) => ({ ...a, thumbColor }))}
            />
          </>
        ) : (
          <div className={styles.field}>
            <label htmlFor="tile-text">Texto</label>
            <input
              id="tile-text"
              className={styles.short}
              value={avatar.text}
              placeholder={[...clean][0]?.toUpperCase()}
              onChange={(e) => {
                const text = cleanTileText(e.target.value)
                changeAvatar((a) => ({ ...a, text }))
              }}
              autoComplete="off"
              aria-describedby="tile-text-hint"
            />
            <p id="tile-text-hint" className={styles.hint}>
              De 1 a 3 letras o números. Si lo dejas vacío, se usa la inicial de tu nickname.
            </p>
          </div>
        )}

        <ColorChoices
          label={avatar.kind === 'thumb' ? 'Color de fondo' : 'Color'}
          selected={avatar.color}
          unavailable={avatar.kind === 'thumb' ? avatar.thumbColor : undefined}
          onChoose={(color) => changeAvatar((a) => withColor(a, color))}
        />

        <fieldset className={styles.group}>
          <legend>Estilo</legend>
          <div className={styles.choices}>
            {STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                className={styles.style}
                aria-pressed={style.id === avatar.style}
                onClick={() => changeAvatar((a) => ({ ...a, style: style.id }))}
              >
                <Avatar nickname={clean} avatar={{ ...avatar, style: style.id }} size={36} decorative />
                {style.name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.actions}>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {saved && <p role="status" className={styles.saved}>Perfil guardado</p>}
        <button type="submit" disabled={!canSave} className={buttons.primary}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default ProfileForm