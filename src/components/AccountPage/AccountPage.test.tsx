// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import AccountPage from './AccountPage';

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

describe('AccountPage', () => {
    beforeEach(() => {
        auth.user = { id: '1', email: 'ana@example.com', hasPassword: true };
        auth.loading = false;
        auth.updatePassword = vi.fn();
        auth.changeEmail = vi.fn();
        auth.deleteAccount = vi.fn();
        auth.logOut = vi.fn();
    });

    afterEach(cleanup);

    it("shows the user's email", () => {
        renderPage();

        expect(screen.getByText(/ana@example\.com/)).toBeTruthy();
    });

    it('shows the three sections', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Cambiar correo' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Eliminar cuenta' })).toBeTruthy();
    });

    it('shows the change password form', () => {
        renderPage();

        expect(screen.getByLabelText('Contraseña actual')).toBeTruthy();
        expect(screen.getByLabelText('Nueva contraseña')).toBeTruthy();
        expect(screen.getByLabelText('Repite la nueva contraseña')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeTruthy();
    });

    it('shows the change email form', () => {
        renderPage();

        expect(screen.getByLabelText('Correo nuevo')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cambiar correo' })).toBeTruthy();
    });

    it('shows the delete account button', () => {
        renderPage();

        expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
    });

    describe('for a user who only logs in with a provider', () => {
        beforeEach(() => {
            auth.user = { id: '1', email: 'ana@gmail.com', hasPassword: false };
        });

        it('hides changing the password and the email', () => {
            renderPage();

            expect(screen.queryByRole('heading', { name: 'Cambiar contraseña' })).toBeNull();
            expect(screen.queryByRole('heading', { name: 'Cambiar correo' })).toBeNull();
        });

        it('explains why', () => {
            renderPage();

            expect(screen.getByText(/no tienes contraseña en Calculetra/)).toBeTruthy();
        });

        it('still lets them delete the account', () => {
            renderPage();

            expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
        });
    });
});