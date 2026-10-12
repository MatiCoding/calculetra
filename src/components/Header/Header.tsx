import { Link } from 'react-router';
import styles from './Header.module.css';

function Header() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>
                <Link to="/">Calculetra</Link>
            </h1>
            <Link to="/signup" className={styles.authLink}>Crear cuenta</Link>
        </header>
    );
}

export default Header
