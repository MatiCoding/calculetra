import {isAuthWeakPasswordError, isAuthApiError, isAuthRetryableFetchError} from '@supabase/supabase-js'

export function getSignUpErrorMessage(error: unknown): string {
  if (isAuthWeakPasswordError(error)) {
    return 'La contraseña es demasiado débil. Elige una más segura.'
  } else if (isAuthApiError(error) && (error.code === 'user_already_exists' || error.code === 'email_exists')) {
    return 'Ya existe una cuenta con este email. Inicia sesión o usa otro email.'
  } else if (isAuthApiError(error) && error.code === 'over_email_send_rate_limit') {
    return 'Demasiados intentos. Espera un rato y vuelve a probar.'
  } else if (isAuthRetryableFetchError(error)) {
    return 'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.'
  } else {
    return 'Algo ha ido mal al crear la cuenta. Vuelve a probar más tarde.'
  }
}