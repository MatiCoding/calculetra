import { useState } from 'react';
import {useAuth} from '../../auth/context/useAuth';
import styles from './AccountPage.module.css';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';
import ChangeEmailForm from '../ChangeEmailForm/ChangeEmailForm';
import DeleteAccountForm from '../DeleteAccountForm/DeleteAccountForm';
import ProfileCard from '../ProfileCard/ProfileCard';
import AccountIcon, { type AccountIconName } from '../AccountIcon/AccountIcon';

type TabId = 'resumen' | 'contrasena' | 'correo' | 'eliminar';

type Tab = {
    id: TabId;
    label: string;
    icon: AccountIconName;
};

const SUMMARY: Tab = { id: 'resumen', label: 'Resumen', icon: 'summary' };
const PASSWORD: Tab = { id: 'contrasena', label: 'Contraseña', icon: 'password' };
const EMAIL: Tab = { id: 'correo', label: 'Correo', icon: 'email' };
const DELETE: Tab = { id: 'eliminar', label: 'Eliminar cuenta', icon: 'delete' };

// Users who log in with Google or GitHub have no password and cannot change
// their email here, so they do not get those tabs.
function tabsFor(hasPassword: boolean): Tab[] {
    return hasPassword ? [SUMMARY, PASSWORD, EMAIL, DELETE] : [SUMMARY, DELETE];
}

function AccountPage() {
    // RequireAuth only shows this page when there is a user but TypeScript does not know that,
    // so users can still be null here.
    const {user} = useAuth();
    const [selected, setSelected] = useState<TabId>('resumen');

    const tabs = tabsFor(user?.hasPassword ?? false);

    return (
        <div className={styles.account}>
            <h2>Mi cuenta</h2>
            {user && <ProfileCard user={user} />}

            <div role="tablist" aria-label="Opciones de la cuenta" className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={tab.id === selected}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setSelected(tab.id)}
                    >
                        <AccountIcon name={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <section
                role="tabpanel"
                id={`panel-${selected}`}
                aria-labelledby={`tab-${selected}`}
                className={styles.section}
            >
                {selected === 'resumen' && (
                    <>
                        <h3>Resumen</h3>
                        {!user?.hasPassword && (
                            <p className={styles.note}>
                                Entras con tu cuenta de Google o GitHub, así que no tienes contraseña en Calculetra y tu correo es el de esa cuenta.
                            </p>
                        )}
                    </>
                )}
                {selected === 'contrasena' && (
                    <>
                        <h3>Cambiar contraseña</h3>
                        <NewPasswordForm askCurrentPassword />
                    </>
                )}
                {selected === 'correo' && (
                    <>
                        <h3>Cambiar correo</h3>
                        <ChangeEmailForm />
                    </>
                )}
                {selected === 'eliminar' && (
                    <>
                        <h3>Eliminar cuenta</h3>
                        <DeleteAccountForm />
                    </>
                )}
            </section>
        </div>
    );
}

export default AccountPage;
