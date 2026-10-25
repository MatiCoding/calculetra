import { Link } from 'react-router'
import styles from './PrivacyPage.module.css'

function PrivacyPage() {
    return (
        <main className={styles.privacy}>
            <div className={styles.intro}>
                <p className={styles.badge}>Privacidad</p>
                <div className={styles.tiles} aria-hidden="true">
                    <span className={styles.letterTile}>D</span>
                    <span className={styles.letterTile}>A</span>
                    <span className={styles.letterTile}>T</span>
                    <span className={styles.letterTile}>O</span>
                    <span className={styles.letterTile}>S</span>
                </div>
                <h1 className={styles.title}>Política de privacidad</h1>
                <p className={styles.updated}>Última actualización: 25 de octubre de 2026.</p>
            </div>

            <section className={styles.section}>
                <h2>Qué datos guardamos</h2>
                <p>
                    Cuando creas una cuenta guardamos tu correo electrónico.
                    Si entras con Google o GitHub, ellos nos pasan también tu nombre
                    y tu foto de perfil.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Para qué los usamos</h2>
                <p>
                    Solo para que puedas iniciar sesión y guardar tus partidas.
                    No mostramos anuncios, no vendemos tus datos y no te rastreamos.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Quién los trata</h2>
                <p>
                    Tus datos se guardan en Supabase, que nos da la base de datos y el
                    inicio de sesión. La web está alojada en Vercel. No los compartimos
                    con nadie más.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Cómo borrar tus datos</h2>
                <p>
                    Puedes borrar tu cuenta cuando quieras desde{' '}
                    <Link to="/account">Mi cuenta</Link>, con el botón "Eliminar cuenta".
                    Se borran tu cuenta y todos sus datos.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Contacto</h2>
                <p>
                    Si tienes cualquier duda sobre tus datos, escríbeme a{' '}
                    <a href="mailto:mateorz2308@gmail.com">mateorz2308@gmail.com</a>.
                </p>
            </section>
        </main>
    )
}

export default PrivacyPage