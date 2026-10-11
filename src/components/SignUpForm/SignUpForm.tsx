import { useState, type SubmitEvent } from 'react';
import {validateSignUp} from '../../auth/signUp/validateSignUp';

function SignUpForm() {
    // Controlled inputs: React state holds each value and the input shows it.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault();
        const validationError = validateSignUp(email, password, confirmPassword);
        if (validationError) {
            setError(validationError);
        } else {
            setError(null);
        }
    }

    return (
        <>
            <h2>Crear cuenta</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="signup-email">Email</label>
                <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="signup-password">Contraseña</label>
                <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label htmlFor="signup-confirm-password">Repite la contraseña</label>
                <input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Crear cuenta</button>
            </form>
        </>
    );
}

export default SignUpForm
