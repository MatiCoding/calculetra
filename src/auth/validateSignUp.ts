export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateSignUp(email: string, password: string, confirmPassword: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Introduce un email válido.'
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.'
  }
  return null
}