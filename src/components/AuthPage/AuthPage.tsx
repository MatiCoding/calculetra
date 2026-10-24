import { Link, useLocation, useNavigate } from 'react-router'
import LogInForm from '../LogInForm/LogInForm'
import SignUpForm from '../SignUpForm/SignUpForm'
import styles from './AuthPage.module.css'

function AuthPage() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    // The URL decides which card is in front, so the browser's back button
    // and the RequireAuth redirect to /login just work.
    const front = pathname === '/signup' ? 'signup' : 'login'

    return (
        <main className={styles.page}>
            <Link to="/" className={styles.brand}>Calculetra</Link>
            <div className={`${styles.deck} ${front === 'signup' ? styles.showSignUp : ''}`}>
                <section className={`${styles.card} ${styles.logInCard}`}>
                    <div inert={front !== 'login'} className={styles.face}>
                        <LogInForm />
                    </div>
                    <button 
                        type="button" 
                        inert={front === 'login'} 
                        aria-label="Ir a iniciar sesión" 
                        onClick={() => navigate('/login')}
                        className={styles.spine}
                    >
                        <span>Iniciar sesión</span>
                    </button>
                </section>

                <section className={`${styles.card} ${styles.signUpCard}`}>
                    <div inert={front !== 'signup'} className={styles.face}>
                        <SignUpForm />
                    </div>
                    <button 
                        type="button" 
                        inert={front === 'signup'} 
                        aria-label="Ir a crear cuenta" 
                        onClick={() => navigate('/signup')}
                        className={styles.spine}
                    >
                        <span>Crear cuenta</span>
                    </button>
                </section>
            </div>
        </main>
    )
}

export default AuthPage
