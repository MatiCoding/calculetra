import type { OAuthProvider } from '../../auth/api/auth'
import { SOCIAL_PROVIDERS } from './socialProviders'

// The brand logo of Google or GitHub. Decoration: the text next to it says the name.
function ProviderLogo({ provider }: { provider: OAuthProvider }) {
    const logo = SOCIAL_PROVIDERS.find((social) => social.id === provider)
    if (!logo) return null

    return (
        
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill={logo.color} d={logo.path} />
        </svg>
    )
}

export default ProviderLogo