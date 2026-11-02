import type { KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import {useAuth} from '../../auth/context/useAuth';
import styles from './AccountPage.module.css';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';
import ChangeEmailForm from '../ChangeEmailForm/ChangeEmailForm';
import DeleteAccountForm from '../DeleteAccountForm/DeleteAccountForm';
import ProfileCard from '../ProfileCard/ProfileCard';
import BackToGames from '../BackToGames/BackToGames';
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
    const {user} = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabs = tabsFor(user?.hasPassword ?? false);
    const selected: TabId = tabs.find((tab) => tab.id === searchParams.get('tab'))?.id ?? 'resumen';

    function select(tab: Tab) {
        setSearchParams(tab.id === 'resumen' ? {} : { tab: tab.id }, { replace: true });
    }

    function selectAndFocus(tab: Tab) {
        select(tab);
        document.getElementById(`tab-${tab.id}`)?.focus();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const index = tabs.findIndex((tab) => tab.id === selected);
        const last = tabs.length - 1;

        if (event.key === 'ArrowRight') {
            selectAndFocus(tabs[index === last ? 0 : index + 1]);
        } else if (event.key === 'ArrowLeft') {
            selectAndFocus(tabs[index === 0 ? last : index - 1]);
        } else if (event.key === 'Home') {
            selectAndFocus(tabs[0]);
        } else if (event.key === 'End') {
            selectAndFocus(tabs[last]);
        } else {
            return;
        }
        // The page must not scroll with the arrow, Home or End keys.
        event.preventDefault();
    }

    return (
        <div className={styles.account}>
            <BackToGames />
            <h2>Mi cuenta</h2>

            <div className={styles.layout}>
                <div className={styles.side}>
                    {user && <ProfileCard user={user} />}

                    <div role="tablist" aria-label="Opciones de la cuenta" className={styles.tabs} onKeyDown={handleKeyDown}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                id={`tab-${tab.id}`}
                                aria-selected={tab.id === selected}
                                aria-controls={`panel-${tab.id}`}
                                tabIndex={tab.id === selected ? 0 : -1}
                                onClick={() => select(tab)}
                                className={tab.id === 'eliminar' ? styles.dangerTab : undefined}
                            >
                                <AccountIcon name={tab.icon} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <section
                    role="tabpanel"
                    id={`panel-${selected}`}
                    aria-labelledby={`tab-${selected}`}
                    className={selected === 'eliminar' ? `${styles.panel} ${styles.danger}` : styles.panel}
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
        </div>
    );
}

export default AccountPage;
