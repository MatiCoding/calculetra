// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccountPage from './AccountPage';

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'ana@example.com' },
        loading: false,
        signUp: vi.fn(),
        logIn: vi.fn(),
        logOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        changeEmail: vi.fn(),
        deleteAccount: vi.fn(),
    }),
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
});