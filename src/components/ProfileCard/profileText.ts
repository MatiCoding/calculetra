import type {LoginMethod} from '../../auth/api/auth'

const LOGIN_METHOD_NAMES: Record <LoginMethod, string> = {
    email: 'correo y contraseña',
    google: 'Google',
    github: 'GitHub',
}

export function loginMethodText(providers: LoginMethod[]): string | null {
    if (providers.length === 0) return null;
    const names = providers.map((provider) => LOGIN_METHOD_NAMES[provider])
    const list = new Intl.ListFormat('es', { type: 'disjunction'}).format(names)
    return `Entras con ${list}`
}

export function memberSinceText(createdAt: string): string {
    const date = new Date(createdAt)
    const monthAndYear = date.toLocaleDateString('es-ES', {month: 'long', year: 'numeric'})
    return `Miembro desde ${monthAndYear}`
}

export function initial(email: string) : string {
    return email.charAt(0).toUpperCase() || '?'
}