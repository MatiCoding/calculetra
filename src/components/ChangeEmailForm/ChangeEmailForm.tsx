import { useState, type SubmitEvent } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import { getChangeEmailErrorMessage } from '../../auth/email/emailErrors';
import { validateNewEmail } from '../../auth/email/validateNewEmail';

import styles from '../AuthForm.module.css';

// Asks Supabase to change the email of the logged-in user. The email does not
// change here: Supabase sends confirmation links and changes it when they are
// opened. The header updates by itself then, through onAuthChange.
function ChangeEmailForm() {
    const { user, changeEmail } = useAuth();

    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSent(false);
        const validationError = validateNewEmail(email, user?.email ?? '');
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            await changeEmail(email.trim());
            setSent(true);
            setEmail('');
        } catch (err) {
            setError(getChangeEmailErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="new-email">Correo nuevo</label>
            <input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
            />

            {error && <p role="alert" className={styles.error}>{error}</p>}
            {/* With "Secure email change" on, Supabase asks to confirm from
                both addresses, and the change only happens after both. */}
            {sent && (
                <p role="status">
                    Te hemos enviado un enlace para confirmar el cambio a tu correo nuevo y otro a tu correo actual.
                    El correo cambiará cuando abras los dos enlaces.
                </p>
            )}
            <button type="submit" disabled={submitting}>Cambiar correo</button>
        </form>
    );
}

export default ChangeEmailForm