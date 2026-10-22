import { Link } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';
import styles from './Header.module.css';

function Header() {
    const { user, loading, logOut } = useAuth();

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>
                <Link to="/">Calculetra</Link>
            </h1>

            {/* While the session is being restored we show nothing, so
                "Iniciar sesión" does not flash before the user's email. */}
            {!loading && (user ? (
                <div className={styles.authLink}>
                    <Link to="/account">{user.email}</Link>
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
