// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import AccountPage from './AccountPage';
import { fakeUser } from '../../test/fakeUser';

// Each test can change `auth.user` before rendering.
const { auth } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

// DeleteAccountForm uses useNavigate, which needs a router.
function renderPage() {
    render(
        <MemoryRouter>
            <AccountPage />
        </MemoryRouter>,
    );
}

function tabNames() {
    return screen.getAllByRole('tab').map((tab) => tab.textContent);
}

describe('AccountPage', () => {
    beforeEach(() => {
        auth.user = fakeUser();
        auth.loading = false;
        auth.updatePassword = vi.fn();
        auth.changeEmail = vi.fn();
        auth.deleteAccount = vi.fn();
        auth.logOut = vi.fn();
    });

    afterEach(cleanup);

    it('shows the profile card', () => {
        renderPage();

        expect(screen.getByRole('region', { name: 'Tu perfil' })).toBeTruthy();
    });

    it('shows four tabs to a user with a password', () => {
        renderPage();

        expect(screen.getByRole('tablist', { name: 'Opciones de la cuenta' })).toBeTruthy();
        expect(tabNames()).toEqual(['Resumen', 'Contraseña', 'Correo', 'Eliminar cuenta']);
    });

    it('selects Resumen at first', () => {
        renderPage();

        expect(screen.getByRole('tab', { name: 'Resumen' }).getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('tab', { name: 'Contraseña' }).getAttribute('aria-selected')).toBe('false');
        expect(screen.getByRole('tabpanel', { name: 'Resumen' })).toBeTruthy();
    });

    it('only shows the panel of the selected tab', () => {
        renderPage();

        expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
        expect(screen.queryByLabelText('Contraseña actual')).toBeNull();
        expect(screen.queryByLabelText('Correo nuevo')).toBeNull();
    });

    it('links each tab to its panel', () => {
        renderPage();

        const tab = screen.getByRole('tab', { name: 'Resumen' });
        const panel = screen.getByRole('tabpanel');
        expect(tab.getAttribute('aria-controls')).toBe(panel.id);
        expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    });

    it('shows the change password form on the Contraseña tab', () => {
        renderPage();

        fireEvent.click(screen.getByRole('tab', { name: 'Contraseña' }));

        expect(screen.getByRole('tab', { name: 'Contraseña' }).getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('tabpanel', { name: 'Contraseña' })).toBeTruthy();
        expect(screen.getByLabelText('Contraseña actual')).toBeTruthy();
        expect(screen.getByLabelText('Nueva contraseña')).toBeTruthy();
        expect(screen.getByLabelText('Repite la nueva contraseña')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeTruthy();
    });

    it('shows the change email form on the Correo tab', () => {
        renderPage();

        fireEvent.click(screen.getByRole('tab', { name: 'Correo' }));

        expect(screen.getByLabelText('Correo nuevo')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cambiar correo' })).toBeTruthy();
    });

    it('shows the delete account button on the Eliminar cuenta tab', () => {
        renderPage();

        fireEvent.click(screen.getByRole('tab', { name: 'Eliminar cuenta' }));

        expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
    });

    describe('for a user who only logs in with a provider', () => {
        beforeEach(() => {
            auth.user = fakeUser({ email: 'ana@gmail.com', hasPassword: false, providers: ['google'] });
        });

        it('only shows the Resumen and Eliminar cuenta tabs', () => {
            renderPage();

            expect(tabNames()).toEqual(['Resumen', 'Eliminar cuenta']);
        });

        it('explains why on the Resumen tab', () => {
            renderPage();

            expect(screen.getByText(/no tienes contraseña en Calculetra/)).toBeTruthy();
        });

        it('still lets them delete the account', () => {
            renderPage();

            fireEvent.click(screen.getByRole('tab', { name: 'Eliminar cuenta' }));

            expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
        });
    });

    describe('for a user with a password', () => {
        it('does not show the note about providers', () => {
            renderPage();

            expect(screen.queryByText(/no tienes contraseña en Calculetra/)).toBeNull();
        });
    });
});
