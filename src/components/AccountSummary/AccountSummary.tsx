import type { AuthUser } from '../../auth/api/auth'
import styles from './AccountSummary.module.css'

// The stats we will show when the games are saved for each account.
const COMING_STATS = ['Retos jugados', 'Racha', 'Mejor puntuación']

function AccountSummary({ user } : {user: AuthUser}) {
    const name = user.email.split('@')[0]

    return (
        <>
            <h3>Hola, {name}</h3>
            <p className={styles.lead}>Aquí verás tus estadísticas cuando lleguen.</p>

            <ul className={styles.stats}>
                {COMING_STATS.map((label) => (
                    <li key={label} className={styles.stat}>
                        <span className={styles.value} aria-hidden="true">-</span>
                        {label}
                    </li>
                ))}
            </ul>

            {!user.hasPassword && (
                <p className={styles.note}>
                    Entras con tu cuenta de Google o GitHub, así que no tienes contraseña en Calculetra y tu correo es el de esa cuenta.
                </p>
            )}
        </>
    )
}

export default AccountSummary