import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';
import { getLogInErrorMessage } from '../../auth/logIn/logInErrors';

import styles from '../AuthForm.module.css';

function LogInForm() {
    const navigate = useNavigate();
    const { logIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (email.trim() === '' || password === '') {
            setError('Introduce tu email y tu contraseña.');
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            await logIn(email.trim(), password);
            navigate('/');
        } catch (err) {
            setError(getLogInErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                <label htmlFor="login-password">Contraseña</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                {error && <p role="alert" className={styles.error}>{error}</p>}
                <button type="submit" disabled={submitting}>Iniciar sesión</button>
            </form>
            <p><Link to="/forgot-password">¿Has olvidado tu contraseña?</Link></p>
            <p>¿No tienes cuenta? <Link to="/signup">Crea una</Link></p>
        </>
    );
}

export default LogInForm
