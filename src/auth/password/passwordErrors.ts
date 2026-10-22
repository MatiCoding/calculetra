import { isAuthApiError, isAuthRetryableFetchError, isAuthWeakPasswordError } from '@supabase/supabase-js'

// Errors when asking for the reset email. Returns null when the form should
// show the usual "check your email" message anyway: any other message (even
// "too many attempts") could tell someone that the email has an account.
export function getResetPasswordErrorMessage(error: unknown): string | null {
  if (isAuthRetryableFetchError(error)) {
    return 'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.'
  }
  return null
}

// Errors when saving a new password.
export function getNewPasswordErrorMessage(error: unknown): string {
  if (isAuthWeakPasswordError(error)) {
    return 'La contraseña es demasiado débil. Elige una más segura.'
  } else if (isAuthApiError(error) && error.code === 'same_password') {
    return 'La nueva contraseña tiene que ser distinta de la actual.'
  } else if (isAuthApiError(error) && error.code === 'current_password_invalid') {
    return 'La contraseña actual no es correcta.'
  } else if (isAuthRetryableFetchError(error)) {
    return 'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.'
  } else {
    return 'Algo ha ido mal al guardar la contraseña. Vuelve a probar más tarde.'
  }
}