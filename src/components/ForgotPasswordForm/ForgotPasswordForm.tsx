import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';
import { getResetPasswordErrorMessage } from '../../auth/password/passwordErrors';

import styles from '../AuthForm.module.css';

function ForgotPasswordForm() {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (email.trim() === '') {
            setError('Introduce tu email.');
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (err) {
            // Most errors are hidden, so the answer is the same whether the
            // email has an account or not.
            const message = getResetPasswordErrorMessage(err);
            if (message === null) {
                setSent(true);
            } else {
                setError(message);
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (sent) {
        return (
            <>
                <h2>Revisa tu correo</h2>
                <p role="status">
                    Si existe una cuenta con {email.trim()}, te llegará un enlace para elegir una contraseña nueva.
                </p>
                <p><Link to="/login">Volver a iniciar sesión</Link></p>
            </>
        );
    }

    return (
        <>
            <h2>Recuperar contraseña</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="forgot-email">Email</label>
                <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                {error && <p role="alert" className={styles.error}>{error}</p>}
                <button type="submit" disabled={submitting}>Enviar enlace</button>
            </form>
            <p><Link to="/login">Volver a iniciar sesión</Link></p>
        </>
    );
}

export default ForgotPasswordForm