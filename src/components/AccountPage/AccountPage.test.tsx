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

    describe('with the keyboard', () => {
        function selectedTab() {
            return screen.getByRole('tab', { selected: true }).textContent;
        }

        it('only lets Tab reach the selected tab', () => {
            renderPage();

            expect(screen.getByRole('tab', { name: 'Resumen' }).tabIndex).toBe(0);
            expect(screen.getByRole('tab', { name: 'Contraseña' }).tabIndex).toBe(-1);
        });

        it('selects and focuses the next tab with the right arrow', () => {
            renderPage();

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Resumen' }), { key: 'ArrowRight' });

            expect(selectedTab()).toBe('Contraseña');
            expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Contraseña' }));
            expect(screen.getByRole('tab', { name: 'Contraseña' }).tabIndex).toBe(0);
        });

        it('goes back to the first tab after the last one', () => {
            renderPage();

            fireEvent.click(screen.getByRole('tab', { name: 'Eliminar cuenta' }));
            fireEvent.keyDown(screen.getByRole('tab', { name: 'Eliminar cuenta' }), { key: 'ArrowRight' });

            expect(selectedTab()).toBe('Resumen');
        });

        it('selects the previous tab with the left arrow, going round at the start', () => {
            renderPage();

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Resumen' }), { key: 'ArrowLeft' });

            expect(selectedTab()).toBe('Eliminar cuenta');
        });

        it('selects the first tab with Home and the last one with End', () => {
            renderPage();

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Resumen' }), { key: 'End' });
            expect(selectedTab()).toBe('Eliminar cuenta');

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Eliminar cuenta' }), { key: 'Home' });
            expect(selectedTab()).toBe('Resumen');
        });

        it('only moves between the tabs the user has', () => {
            auth.user = fakeUser({ hasPassword: false, providers: ['github'] });
            renderPage();

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Resumen' }), { key: 'ArrowRight' });

            expect(selectedTab()).toBe('Eliminar cuenta');
        });

        it('does nothing with other keys', () => {
            renderPage();

            fireEvent.keyDown(screen.getByRole('tab', { name: 'Resumen' }), { key: 'a' });

            expect(selectedTab()).toBe('Resumen');
        });
    });
});
