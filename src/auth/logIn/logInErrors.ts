import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

export function getLogInErrorMessage(error: unknown): string {
    if(isAuthApiError(error) && error.code === "invalid_credentials") {
        return "Correo electrónico o contraseña incorrectos. Vuelve a intentarlo.";
    } else if (isAuthApiError(error) && error.code === "email_not_confirmed") {
        return "La cuenta existe pero no ha confirmado el email. Revisa tu correo y confirma la cuenta antes de iniciar sesión.";
    } else if (isAuthRetryableFetchError(error)){
        return "Se ha producido un error de red. Revisa tu conexión a internet y vuelve a intentarlo.";
    } else {
        return "Error desconocido. Por favor, inténtalo de nuevo más tarde.";
    }
}