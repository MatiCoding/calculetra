// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
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
    }),
}));

describe('AccountPage', () => {
    afterEach(cleanup);

    it("shows the user's email", () => {
        render(<AccountPage />);

        expect(screen.getByText(/ana@example\.com/)).toBeTruthy();
    });

    it('shows the three sections', () => {
        render(<AccountPage />);

        expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Cambiar correo' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Eliminar cuenta' })).toBeTruthy();
    });

    it('shows the change password form', () => {
        render(<AccountPage />);

        expect(screen.getByLabelText('Contraseña actual')).toBeTruthy();
        expect(screen.getByLabelText('Nueva contraseña')).toBeTruthy();
        expect(screen.getByLabelText('Repite la nueva contraseña')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeTruthy();
    });
});