// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import type { ProfileContextValue } from '../../profile/context/ProfileContext';
import { fakeUser } from '../../test/fakeUser';
import { fakeProfile } from '../../test/fakeProfile';
import Header from './Header';

// Each test changes `auth` and `my` before rendering, so the fake hooks return
// the state that test needs (loading, logged in or out, with or without a profile).
const { auth, my } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
    my: {} as ProfileContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

vi.mock('../../profile/context/useMyProfile', () => ({
    useMyProfile: () => my,
}));

function header() {
    return <MemoryRouter><Header /></MemoryRouter>;
}

function renderHeader() {
    return render(header());
}

describe('Header', () => {
    beforeEach(() => {
        auth.user = null;
        auth.loading = false;
        auth.signUp = vi.fn();
        auth.logIn = vi.fn();
        auth.logOut = vi.fn().mockResolvedValue(undefined);
        my.profile = null;
        my.failed = false;
        my.setProfile = vi.fn();
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

    describe('when someone is logged in', () => {
        beforeEach(() => {
            auth.user = fakeUser();
            my.profile = fakeProfile({ nickname: 'mateo' });
        });

        it('shows the nickname and the avatar instead of the email', () => {
            renderHeader();

            expect(screen.getByText('mateo')).toBeTruthy();
            expect(document.querySelector('header img')).toBeTruthy();
            expect(screen.queryByText('ana@example.com')).toBeNull();
        });

        it('links the avatar and the nickname to the account page', () => {
            renderHeader();

            const link = screen.getByRole('link', { name: 'Tu cuenta, mateo' });
            expect(link.getAttribute('href')).toBe('/account');
            expect(link.textContent).toBe('mateo');
            expect(link.querySelector('img')).toBeTruthy();
        });

        it('hides the avatar from screen readers, because the link already has a name', () => {
            renderHeader();

            expect(screen.queryByRole('img', { name: 'Avatar de mateo' })).toBeNull();
        });

        it('shows "Cerrar sesión" and not "Iniciar sesión"', () => {
            renderHeader();

            expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
            expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull();
        });

        it('calls logOut when "Cerrar sesión" is clicked', () => {
            renderHeader();

            fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

            expect(auth.logOut).toHaveBeenCalledOnce();
        });

        it('shows nothing on the right while the profile is loading', () => {
            my.profile = null;
            renderHeader();

            expect(screen.queryByText('ana@example.com')).toBeNull();
            expect(screen.queryByRole('link', { name: /Tu cuenta/ })).toBeNull();
            expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull();
            expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull();
        });

        it('shows the email linking to the account page if the profile cannot be loaded', () => {
            my.profile = null;
            my.failed = true;
            renderHeader();

            expect(screen.getByRole('link', { name: 'ana@example.com' }).getAttribute('href')).toBe('/account');
            expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
        });

        it('shows the new nickname and avatar after the profile is saved', () => {
            const { rerender } = renderHeader();

            my.profile = fakeProfile({ nickname: 'mateo_nuevo' }, { kind: 'text', text: 'MR' });
            rerender(header());

            expect(screen.getByRole('link', { name: 'Tu cuenta, mateo_nuevo' })).toBeTruthy();
            expect(screen.getByText('MR')).toBeTruthy();
            expect(screen.queryByText('mateo')).toBeNull();
        });
    });
});
