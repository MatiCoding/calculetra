import { useState } from 'react'
import formStyles from '../AuthForm.module.css'
import { SOCIAL_PROVIDERS } from './socialProviders'
import styles from './SocialButtons.module.css'
import {useAuth} from '../../auth/context/useAuth';
import type { OAuthProvider } from '../../auth/api/auth';

type SocialButtonsProps = {
    // The text of the line under the buttons, e.g. "o entra con tu email".
    dividerText: string
}

// Google, Facebook, GitHub and LinkedIn buttons.
function SocialButtons({ dividerText }: SocialButtonsProps) {
    
    const { logInWithProvider } = useAuth();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null)

    async function handleClick(provider: OAuthProvider) {
        setError(null)
        setPending(true)

        try {
            // If it works the browser leaves the page, so there is nothing to undo here.
            await logInWithProvider(provider)
        } catch {
            setError("No se ha podido abrir el inicio de sesión. Revisa tu conexión y vuelve a intentarlo.")
            setPending(false)
        }
    }

    return (
        <>
            <div className={styles.grid}>
                {SOCIAL_PROVIDERS.map((provider) => (
                    <button
                        key={provider.name}
                        type="button"
                        className={styles.button}
                        aria-label={`Continuar con ${provider.name}`}
                        onClick={() => handleClick(provider.id)}
                        disabled={pending}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill={provider.color} d={provider.path} />
                        </svg>
                        {provider.name}
                    </button>
                ))}
            </div>
            {error && <p role="alert" className={formStyles.error}>{error}</p>}
            <p className={styles.divider}>{dividerText}</p>
        </>
    )
}

export default SocialButtons
