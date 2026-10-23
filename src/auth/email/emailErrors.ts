import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js'

// Errors when asking for an email change.
export function getChangeEmailErrorMessage(error: unknown): string {
  if (isAuthApiError(error) && error.code === 'email_exists') {
    return 'Ya existe una cuenta con este correo.'
  } else if (isAuthApiError(error) && error.code === 'email_address_invalid') {
    return 'Introduce un email válido.'
  } else if (isAuthApiError(error) && error.code === 'over_email_send_rate_limit') {
    return 'Demasiados intentos. Espera un rato y vuelve a probar.'
  } else if (isAuthRetryableFetchError(error)) {
    return 'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.'
  } else {
    return 'Algo ha ido mal al cambiar el correo. Vuelve a probar más tarde.'
  }
}