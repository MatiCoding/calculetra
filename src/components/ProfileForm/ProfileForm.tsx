import { useEffect, useState, type SubmitEvent } from 'react'
import { isNicknameAvailable, NicknameTakenError, updateProfile, type Profile } from '../../profile/api/profile'
import { normalizeNickname, validateNickname } from '../../profile/nickname'
import Avatar from '../Avatar/Avatar'
import styles from './ProfileForm.module.css'
import buttons from '../buttons.module.css'

type ProfileFormProps = {
    profile: Profile
    onSaved: (profile: Profile) => void
}

const CHECK_DELAY_MS = 400  // How long to wait after the last key before asking if the nickname is free.

type Check = { nickname: string; available: boolean }   // The answer of the last availability check, and the nickname it was for.

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
  const canSave = validationError === null && !taken && !isCurrent && !saving

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)

    try {
      const result = await updateProfile(profile.id, nickname, profile.avatar)
      setNickname(result.nickname)
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
        <Avatar nickname={clean || profile.nickname} avatar={profile.avatar} size={110} />
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