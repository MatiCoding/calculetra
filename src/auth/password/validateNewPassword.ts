export const MIN_PASSWORD_LENGTH = 8

// The password rules, shared by sign up, password reset and change password.
export function validateNewPassword(password: string, confirmPassword: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.'
    }
    return null
}
