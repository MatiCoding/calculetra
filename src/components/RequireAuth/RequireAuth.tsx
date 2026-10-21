import {Navigate} from "react-router";
import { useAuth } from "../../auth/context/useAuth";
import type { ReactNode } from "react";

type RequireAuthProps = {
    children: ReactNode;
}

// Wraps a page that only logged-in users can see.
function RequireAuth({children} : RequireAuthProps) {
    const { user, loading } = useAuth();

    // While the session is being restored, user is alsa null.
    // If we checked user first, reloading a protected page would always send you to /login.
    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

export default RequireAuth;