import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

// It only shows up if loading takes longer than this, so fast loads don't flash.
const DELAY_MS = 300;

// Shown while the session is being restored.
function LoadingScreen() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), DELAY_MS);

        // If loading ends first, the component goes away: cancel the timer
        // so it doesn't call setVisible on a component that no longer exists.
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className={styles.screen} role="status">
            <div className={styles.tiles} aria-hidden="true">
                <span>3</span>
                <span>7</span>
                <span>1</span>
            </div>
            <p>Cargando…</p>
        </div>
    );
}

export default LoadingScreen;