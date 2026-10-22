import { useState, type SubmitEvent } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import { getNewPasswordErrorMessage } from '../../auth/password/passwordErrors';
import { validateNewPassword } from '../../auth/password/validateNewPassword';

import styles from '../AuthForm.module.css';

type NewPasswordFormProps = {
    askCurrentPassword?: boolean;
};

// Saves a new password for the logged-in user. Used by the reset page and by
// the account page, so it has no title of its own.
function NewPasswordForm({ askCurrentPassword = false }: NewPasswordFormProps) {
    const { updatePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaved(false);
        if (askCurrentPassword && currentPassword === '') {
            setError('Escribe tu contraseña actual.');
            return;
        }
        const validationError = validateNewPassword(password, confirmPassword);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            if (askCurrentPassword) {
                await updatePassword(password, currentPassword);
            } else {
                await updatePassword(password);
            }
            setSaved(true);
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(getNewPasswordErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {askCurrentPassword && (
                <>
                    <label htmlFor="current-password">Contraseña actual</label>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </>
            )}

            <label htmlFor="new-password">Nueva contraseña</label>
            <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
            />

            <label htmlFor="new-password-confirm">Repite la nueva contraseña</label>
            <input
                id="new-password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
            />

            {error && <p role="alert" className={styles.error}>{error}</p>}
            {saved && <p role="status">Tu contraseña se ha cambiado.</p>}
            <button type="submit" disabled={submitting}>Guardar contraseña</button>
        </form>
    );
}

export default NewPasswordForm
