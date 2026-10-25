import {useAuth} from '../../auth/context/useAuth';
import styles from './AccountPage.module.css';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';
import ChangeEmailForm from '../ChangeEmailForm/ChangeEmailForm';
import DeleteAccountForm from '../DeleteAccountForm/DeleteAccountForm';

function AccountPage() {
    // RequireAuth only shows this page when there is a user but TypeScript does not know that,
    // so users can still be null here.
    const {user} = useAuth();

    return (
        <div className={styles.account}>
            <h2>Mi cuenta</h2>
            <p className={styles.email}>Correo: {user?.email}</p>

            {user?.hasPassword ? (
                <>
                    <section className={styles.section}>
                        <h3>Cambiar contraseña</h3>
                        <NewPasswordForm askCurrentPassword />
                    </section>

                    <section className={styles.section}>
                        <h3>Cambiar correo</h3>
                        <ChangeEmailForm />
                    </section>
                </>
            ) : (
                <p className={styles.note}>
                    Entras con tu cuenta de Google o GitHub, así que no tienes contraseña en Calculetra y tu correo es el de esa cuenta.
                </p>
            )}            

            <section className={styles.section}>
                <h3>Eliminar cuenta</h3>
                <DeleteAccountForm />
            </section>
        </div>
    );
}

export default AccountPage;