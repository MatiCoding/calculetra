// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import RequireAuth from './RequireAuth';
import { fakeUser } from '../../test/fakeUser';

// Each test changes `auth` before rendering, so the fake useAuth returns the
// state that test needs (loading, logged in or logged out).
const { auth } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

// A fake /login page, so the tests can see whether the redirect happened.
function renderAccount() {
    render(
        <MemoryRouter initialEntries={['/account']}>
            <Routes>
                <Route path="/account" element={<RequireAuth><p>secret</p></RequireAuth>} />
                <Route path="/login" element={<p>login page</p>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('RequireAuth', () => {
    beforeEach(() => {
        auth.user = null;
        auth.loading = false;
        auth.signUp = vi.fn();
        auth.logIn = vi.fn();
        auth.logOut = vi.fn();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('sends a user who is not logged in to /login', () => {
        renderAccount();

        expect(screen.getByText('login page')).toBeTruthy();
        expect(screen.queryByText('secret')).toBeNull();
    });

    it('shows the loading screen, not the page or /login, while the session is being restored', () => {
        vi.useFakeTimers();
        auth.loading = true;

        renderAccount();
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.getByRole('status').textContent).toContain('Cargando…');
        expect(screen.queryByText('login page')).toBeNull();
        expect(screen.queryByText('secret')).toBeNull();

        vi.useRealTimers();
    });

    it('shows the page to a logged-in user', () => {
        auth.user = fakeUser();

        renderAccount();

        expect(screen.getByText('secret')).toBeTruthy();
    });
});