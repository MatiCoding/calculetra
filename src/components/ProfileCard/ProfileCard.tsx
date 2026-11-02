import type { AuthUser } from '../../auth/api/auth';
import { loginMethodText, memberSinceText, initial } from "./profileText";
import styles from './ProfileCard.module.css'

function ProfileCard({ user }: { user: AuthUser }) {
    const loginText = loginMethodText(user.providers)

    return (
        <section className={styles.card} aria-label="Tu perfil">
            <span className={styles.tile} aria-hidden="true">{initial(user.email)}</span>
            <p className={styles.email}>{user.email}</p>
            {loginText && <p className={styles.chip}>{loginText}</p>}
            <p className={styles.since}>{memberSinceText(user.createdAt)}</p>
        </section>
    )
}

export default ProfileCard