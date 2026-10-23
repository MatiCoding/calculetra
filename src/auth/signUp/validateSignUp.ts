import { EMAIL_PATTERN } from '../email/validateNewEmail'
import { validateNewPassword } from '../password/validateNewPassword'

export function validateSignUp(email: string, password: string, confirmPassword: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Introduce un email válido.'
  }
  return validateNewPassword(password, confirmPassword)
}