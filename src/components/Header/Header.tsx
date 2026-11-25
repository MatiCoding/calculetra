import { Link } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';
import { useMyProfile } from '../../profile/context/useMyProfile';
import Avatar from '../Avatar/Avatar';
import styles from './Header.module.css';

function Header() {
    const { user, loading, logOut } = useAuth();
    const { profile, failed } = useMyProfile();

    const waiting = loading || (user !== null && profile === null && !failed);

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>
                <Link to="/">Calculetra</Link>
            </h1>

            {/* While the session is being restored we show nothing, so
                "Iniciar sesión" does not flash before the user's email. */}
            {!waiting && (user ? (
                <div className={styles.authLink}>
                    {profile ? (
                        // The link already has a name, so the avatar is decorative.
                        <Link to="/account" className={styles.account} aria-label={`Tu cuenta, ${profile.nickname}`}>
                            <Avatar nickname={profile.nickname} avatar={profile.avatar} size={32} decorative />
                            <span className={styles.nickname}>{profile.nickname}</span>
                        </Link>
                    ) : (
                        // The profile could not be loaded: the email still takes the user to their account.
                        <Link to="/account">{user.email}</Link>
                    )}
                    {/* No navigate or setUser here: onAuthChange tells the
                        AuthProvider and the header updates by itself. */}
                    <button type="button" onClick={() => logOut()}>Cerrar sesión</button>
                </div>
            ) : (
                <Link to="/login" className={styles.authLink}>Iniciar sesión</Link>
            ))}
        </header>
    );
}

export default Header
