export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Supabase saves emails in lower case, so "Ana@Example.com" is the same
// account as "ana@example.com".
function normalize(email: string): string {
  return email.trim().toLowerCase()
}

// Supabase does nothing (and gives no error) when the new email is the same
// as the current one, so this has to be checked here.
export function validateNewEmail(newEmail: string, currentEmail: string): string | null {
  if (!EMAIL_PATTERN.test(newEmail.trim())) {
    return 'Introduce un email válido.'
  }
  if (normalize(newEmail) === normalize(currentEmail)) {
    return 'El correo nuevo tiene que ser distinto del actual.'
  }
  return null
}