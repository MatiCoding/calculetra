import { Link } from 'react-router';
import { useAuth } from '../../auth/context/useAuth';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';

// The page the reset email opens. Supabase reads the link and logs the user
// in, so a valid link means there is a user here.
function ResetPasswordPage() {
    const { user, loading } = useAuth();

    // Same as RequireAuth: wait until the session is known.
    if (loading) return null;

    if (!user) {
        return (
            <>
                <h2>Enlace no válido</h2>
                <p>El enlace no es válido o ha caducado.</p>
                <p><Link to="/forgot-password">Pide uno nuevo</Link></p>
            </>
        );
    }

    return (
        <>
            <h2>Nueva contraseña</h2>
            <NewPasswordForm />
            <p><Link to="/">Ir a jugar</Link></p>
        </>
    );
}

export default ResetPasswordPage