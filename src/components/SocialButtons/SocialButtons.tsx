import { SOCIAL_PROVIDERS } from './socialProviders'
import styles from './SocialButtons.module.css'

type SocialButtonsProps = {
    // The text of the line under the buttons, e.g. "o entra con tu email".
    dividerText: string
}

// Google, Facebook, GitHub and LinkedIn buttons. Only the UI for now:
// they are disabled until #53 makes them work.
function SocialButtons({ dividerText }: SocialButtonsProps) {
    return (
        <>
            <div className={styles.grid}>
                {SOCIAL_PROVIDERS.map((provider) => (
                    <button
                        key={provider.name}
                        type="button"
                        className={styles.button}
                        disabled
                        title="Próximamente"
                        aria-label={`${provider.name}, próximamente`}
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
