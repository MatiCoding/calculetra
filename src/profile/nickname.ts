export const MIN_NICKNAME_LENGTH = 3
export const MAX_NICKNAME_LENGTH = 20

// Same rule as the check on profiles.nickname in supabase/migrations/2026111910000_profiles.sql.
const NICKNAME_CHARACTERS = /^[A-Za-z0-9_ÁÉÍÓÚÜÑáéíóúüñ]+$/

export function normalizeNickname(nickname: string): string {
    return nickname.trim().normalize('NFC')
}

// Returns the error to show, or null when the nickname is valid. It does not know if the nickname is taken: only the database knows.
export function validateNickname(nickname: string): string | null {
  const clean = normalizeNickname(nickname)

  if (clean.length < MIN_NICKNAME_LENGTH) {
    return `Mínimo ${MIN_NICKNAME_LENGTH} caracteres.`
  }
  if (clean.length > MAX_NICKNAME_LENGTH) {
    return `Máximo ${MAX_NICKNAME_LENGTH} caracteres.`
  }
  if (!NICKNAME_CHARACTERS.test(clean)) {
    return 'Solo letras, números y _.'
  }
  return null
}