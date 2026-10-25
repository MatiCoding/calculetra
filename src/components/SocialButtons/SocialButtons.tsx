import { SOCIAL_PROVIDERS } from './socialProviders'
import styles from './SocialButtons.module.css'
import {useAuth} from '../../auth/context/useAuth';

type SocialButtonsProps = {
    // The text of the line under the buttons, e.g. "o entra con tu email".
    dividerText: string
}

// Google, Facebook, GitHub and LinkedIn buttons.
function SocialButtons({ dividerText }: SocialButtonsProps) {
    
    const { logInWithProvider } = useAuth();

    return (
        <>
            <div className={styles.grid}>
                {SOCIAL_PROVIDERS.map((provider) => (
                    <button
                        key={provider.name}
                        type="button"
                        className={styles.button}
                        aria-label={`Continuar con ${provider.name}`}
                        onClick={() => {logInWithProvider(provider.id)}}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill={provider.color} d={provider.path} />
                        </svg>
                        {provider.name}
                    </button>
                ))}
            </div>
            <p className={styles.divider}>{dividerText}</p>
        </>
    )
}

export default SocialButtons
