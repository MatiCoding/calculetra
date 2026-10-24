import { useLocation, useNavigate } from 'react-router';
import styles from './Notice.module.css';

// Shows a message that another page left when it navigated here, for example
// navigate('/', { state: { notice: 'Tu cuenta se ha eliminado.' } }).
function Notice() {
    const { pathname, state } = useLocation();
    const navigate = useNavigate();

    // state can be anything (or null), so check that notice is really a string.
    const notice: unknown = state?.notice;
    if (typeof notice !== 'string') return null;

    return (
        <div role="status" className={styles.notice}>
            <p>{notice}</p>
            {/* The browser keeps state on reload, so the message only goes
                away when it is removed from the history entry. */}
            <button type="button" onClick={() => navigate(pathname, { replace: true, state: null })}>
                Cerrar
            </button>
        </div>
    );
}

export default Notice;