import { Link, useLocation, useNavigate } from 'react-router'
import LogInForm from '../LogInForm/LogInForm'
import SignUpForm from '../SignUpForm/SignUpForm'

function AuthPage() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    // The URL decides which card is in front, so the browser's back button
    // and the RequireAuth redirect to /login just work.
    const front = pathname === '/signup' ? 'signup' : 'login'

    return (
        <main>
            <Link to="/">Calculetra</Link>
            <div>
                <section>
                    <div inert={front !== 'login'}>
                        <LogInForm />
                    </div>
                    <button type="button" inert={front === 'login'} aria-label="Ir a iniciar sesión" onClick={() => navigate('/login')}>
                        <span>Iniciar sesión</span>
                    </button>
                </section>

                <section>
                    <div inert={front !== 'signup'}>
                        <SignUpForm />
                    </div>
                    <button type="button" inert={front === 'signup'} aria-label="Ir a crear cuenta" onClick={() => navigate('/signup')}>
                        <span>Crear cuenta</span>
                    </button>
                </section>
            </div>
        </main>
    )
}

export default AuthPage
