import { Link } from "react-router";
import styles from './BackToGames.module.css'

function BackToGames() {
    return (
        <Link to="/" className={styles.back}>
            <span aria-hidden="true">←</span> Volver a los juegos
        </Link>
    )
}

export default BackToGames