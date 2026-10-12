import {Link, useLocation, useNavigate} from 'react-router'
import styles from './NotFound.module.css'

function NotFound() {
    const {pathname, key} = useLocation()
    const navigate = useNavigate()

    return (
        <main className={styles.notFound}>
            <div className={styles.content}>
                <title>Página no encontrada - Calculetra</title>
                <meta name="robots" content="noindex" />

                <p className={styles.badge}>Error 404</p>
                <div className={styles.tiles} aria-hidden="true">
                    <span className={styles.letterTile}>4</span>
                    <span className={styles.numberTile}>0</span>
                    <span className={`${styles.letterTile} ${styles.tilted}`}>4</span>  
                </div>

                <h2>Esta página no existe</h2>
                <p className={styles.equation}>
                    <span>100 × 4 + 4 = 404</span>
                    <span>cuenta exacta, pero sin página</span>
                </p>

                <p className={styles.text}>
                    La ruta <code>{pathname}</code> no lleva a ningún sitio. Puede que el enlace esté mal escrito o que la página se haya movido.
                </p>

                <div className={styles.actions}>
                    <Link to="/" className={styles.primary}>Ir al reto de hoy</Link>
                    {key !== 'default' && (
                        <button type="button" className={styles.secondary} onClick={() => navigate(-1)}>Volver atrás</button>
                    )}
                </div>
            </div>
        </main>
    )
}

export default NotFound