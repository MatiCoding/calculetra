import { Link, useLocation, useNavigate } from 'react-router'
import { useState } from 'react'
import LogInForm from '../LogInForm/LogInForm'
import SignUpForm from '../SignUpForm/SignUpForm'
import styles from './AuthPage.module.css'

function AuthPage() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    // The URL decides which card is in front, so the browser's back button
    // and the RequireAuth redirect to /login just work.
    const front = pathname === '/signup' ? 'signup' : 'login'

    const [prevFront, setPrevFront] = useState(front)
    const [animate, setAnimate] = useState(false)
    if (front !== prevFront) {
        setPrevFront(front)
        setAnimate(true)
    }

    return (
        <main className={styles.page}>
            <Link to="/" className={styles.brand}>Calculetra</Link>
            <div className={[
                    styles.deck,
                    front === 'signup' && styles.showSignUp,
                    animate && styles.animate,
                ].filter(Boolean).join(' ')}>
                <section className={`${styles.card} ${styles.logInCard}`}>
                    <div inert={front !== 'login'}>
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
                    <div inert={front !== 'signup'}>
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
