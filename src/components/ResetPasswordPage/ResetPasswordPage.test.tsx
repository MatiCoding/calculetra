// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import ResetPasswordPage from './ResetPasswordPage';

// Same trick as in RequireAuth.test.tsx: each test changes `auth` first.
const { auth } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

function renderPage() {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
}

describe('ResetPasswordPage', () => {
    beforeEach(() => {
        auth.user = null;
        auth.loading = false;
        auth.signUp = vi.fn();
        auth.logIn = vi.fn();
        auth.logOut = vi.fn();
        auth.resetPassword = vi.fn();
        auth.updatePassword = vi.fn();
    });

    afterEach(cleanup);

    it('shows the form when the link has logged the user in', () => {
        auth.user = { id: '1', email: 'ana@example.com' };

        renderPage();

        expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeTruthy();
        expect(screen.getByLabelText('Nueva contraseña')).toBeTruthy();
    });

    it('asks for a new link when there is no user', () => {
        renderPage();

        expect(screen.getByText('El enlace no es válido o ha caducado.')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Pide uno nuevo' }).getAttribute('href')).toBe('/forgot-password');
        expect(screen.queryByLabelText('Nueva contraseña')).toBeNull();
    });

    it('shows nothing while the session is being restored', () => {
        auth.loading = true;

        renderPage();

        expect(screen.queryByRole('heading')).toBeNull();
    });
});