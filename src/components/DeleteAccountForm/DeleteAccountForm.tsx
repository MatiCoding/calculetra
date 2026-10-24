import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';

import formStyles from '../AuthForm.module.css';
import styles from './DeleteAccountForm.module.css';

// Supabase saves emails in lower case, so "Ana@Example.com" is the same email.
function normalize(email: string): string {
    return email.trim().toLowerCase();
}

// Deletes the logged-in user's account. It asks to type the email first, so
// the account cannot be deleted with one click by accident.
function DeleteAccountForm() {
    const { user, deleteAccount, logOut } = useAuth();
    const navigate = useNavigate();

    const [confirming, setConfirming] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function cancel() {
        setConfirming(false);
        setEmail('');
        setError(null);
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (normalize(email) !== normalize(user?.email ?? '')) {
            setError('El correo no coincide con el de tu cuenta.');
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            await deleteAccount();
        } catch {
            // Nothing was deleted, so the user can try again.
            setError('No se ha podido eliminar la cuenta. Revisa tu conexión a internet y vuelve a probar.');
            setSubmitting(false);
            return;
        }

        // Leave this page before logging out: once the user is null,
        // RequireAuth would send us to /login. replace, so going back does not
        // open the account page again.
        navigate('/', { replace: true, state: { notice: 'Tu cuenta se ha eliminado. Puedes seguir jugando sin cuenta.' } });
        // The account is already deleted, so a failed log out is not shown:
        // the session left in the browser no longer works.
        logOut().catch(() => {});
    }

    if (!confirming) {
        return (
            <>
                <p>Se borrará tu cuenta para siempre y no podrás volver a entrar con ella.</p>
                <button type="button" className={styles.danger} onClick={() => setConfirming(true)}>
                    Eliminar cuenta
                </button>
            </>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={formStyles.form}>
            <p className={styles.warning}>
                Esta acción no se puede deshacer. Escribe tu correo (<strong>{user?.email}</strong>) para confirmar.
            </p>
            <label htmlFor="delete-email">Tu correo</label>
            <input
                id="delete-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
            />

            {error && <p role="alert" className={formStyles.error}>{error}</p>}

            <div className={styles.actions}>
                <button type="button" onClick={cancel} disabled={submitting}>Cancelar</button>
                <button type="submit" className={styles.danger} disabled={submitting}>
                    Eliminar definitivamente
                </button>
            </div>
        </form>
    );
}

export default DeleteAccountForm;