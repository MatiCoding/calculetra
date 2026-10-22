// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import Header from './Header';

// Each test changes `auth` before rendering, so the fake useAuth returns the
// state that test needs (loading, logged in or logged out).
const { auth } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

function renderHeader() {
    render(<MemoryRouter><Header /></MemoryRouter>);
}

describe('Header', () => {
    beforeEach(() => {
        auth.user = null;
        auth.loading = false;
        auth.signUp = vi.fn();
        auth.logIn = vi.fn();
        auth.logOut = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(cleanup);

    it('links the title to the home page', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'Calculetra' }).getAttribute('href')).toBe('/');
    });

    it('shows nothing on the right while the session is loading', () => {
        auth.loading = true;
        renderHeader();

        expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull();
    });

    it('links "Iniciar sesión" to the log in page when nobody is logged in', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'Iniciar sesión' }).getAttribute('href')).toBe('/login');
        expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull();
    });

    it('shows the email and "Cerrar sesión" when someone is logged in', () => {
        auth.user = { id: '1', email: 'ana@example.com' };
        renderHeader();

        expect(screen.getByText('ana@example.com')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull();
    });

    it('calls logOut when "Cerrar sesión" is clicked', () => {
        auth.user = { id: '1', email: 'ana@example.com' };
        renderHeader();

        fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

        expect(auth.logOut).toHaveBeenCalledOnce();
    });

    it('links the email to the account page', () => {
        auth.user = { id: '1', email: 'ana@example.com' };
        renderHeader();

        expect(screen.getByRole('link', { name: 'ana@example.com' }).getAttribute('href')).toBe('/account');
    });
});
