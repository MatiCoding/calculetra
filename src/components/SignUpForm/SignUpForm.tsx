import { useState, type SubmitEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import {validateSignUp} from '../../auth/signUp/validateSignUp';
import {useAuth} from '../../auth/context/useAuth';
import {getSignUpErrorMessage} from '../../auth/signUp/signUpErrors';

import styles from '../AuthForm.module.css';
import PasswordInput from '../PasswordInput/PasswordInput';

import  {MIN_PASSWORD_LENGTH} from '../../auth/password/validateNewPassword.ts';

function SignUpForm() {
    const navigate = useNavigate();
    const [checkInbox, setCheckInbox] = useState(false)

    // Controlled inputs: React state holds each value and the input shows it.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signUp } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault();
        const validationError = validateSignUp(email, password, confirmPassword);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmitting(true);

        try { 
            const user = await signUp(email.trim(), password) 
            if (user === null){
                setCheckInbox(true);
            } else {
                navigate('/')
            }
        } catch (err) { 
            setError(getSignUpErrorMessage(err)) 
        } finally { 
            setSubmitting(false) }
    }

    if (checkInbox){
        return (
            <>
                <h2>Revisa tu correo</h2>
                <p role="status">Te hemos enviado un enlace a {email} para confirmar tu cuenta.</p>
            </>
        )
    }

    return (
        <>
            <h2>Crea tu cuenta</h2>
            <p>Regístrate con tu cuenta de siempre o con un email</p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="signup-email">Email</label>
                <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                <label htmlFor="signup-password">Contraseña</label>
                <PasswordInput
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                />
                <p id="signup-password-hint" className={styles.hint}>Mínimo {MIN_PASSWORD_LENGTH} caracteres</p>

                <label htmlFor="signup-confirm-password">Repite la contraseña</label>
                <PasswordInput
                    id="signup-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                />
                {error && <p role="alert" className={styles.error}>{error}</p>}
                <button type="submit" disabled={submitting}>Crear cuenta</button>
            </form>
            <p>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
        </>
    );
}

export default SignUpForm
