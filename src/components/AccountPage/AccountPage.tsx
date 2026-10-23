import {useAuth} from '../../auth/context/useAuth';
import styles from './AccountPage.module.css';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';
import ChangeEmailForm from '../ChangeEmailForm/ChangeEmailForm';

function AccountPage() {
    // RequireAuth only shows this page when there is a user but TypeScript does not know that,
    // so users can still be null here.
    const {user} = useAuth();

    return (
        <div className={styles.account}>
            <h2>Mi cuenta</h2>
            <p className={styles.email}>Correo: {user?.email}</p>

            <section className={styles.section}>
                <h3>Cambiar contraseña</h3>
                <NewPasswordForm askCurrentPassword />
            </section>

            <section className={styles.section}>
                <h3>Cambiar correo</h3>
                <ChangeEmailForm />
            </section>

            <section className={styles.section}>
                <h3>Eliminar cuenta</h3>
                <p className={styles.soon}>Próximamente</p>
            </section>
        </div>
    );
}

export default AccountPage;