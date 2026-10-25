// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../../auth/context/AuthContext';
import SocialButtons from './SocialButtons';

// Same trick as in Header.test.tsx: the fake useAuth returns `auth`.
const { auth } = vi.hoisted(() => ({
    auth: {} as AuthContextValue,
}));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => auth,
}));

describe('SocialButtons', () => {
    beforeEach(() => {
        auth.logInWithProvider = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(cleanup);

    it.each([
        ['Google', 'google'],
        ['Facebook', 'facebook'],
        ['GitHub', 'github'],
        ['LinkedIn', 'linkedin_oidc'],
    ])('logs in with %s when its button is clicked', (name, id) => {
        render(<SocialButtons dividerText="o entra con tu email" />);

        fireEvent.click(screen.getByRole('button', { name: `Continuar con ${name}` }));

        expect(auth.logInWithProvider).toHaveBeenCalledWith(id);
    });

    it('shows the divider text', () => {
        render(<SocialButtons dividerText="o regístrate con tu email" />);

        expect(screen.getByText('o regístrate con tu email')).toBeTruthy();
    });
        it('disables every button while it goes to the provider', () => {
        // A promise that never ends, like the real one: the browser leaves the page.
        auth.logInWithProvider = vi.fn(() => new Promise<void>(() => {}));
        render(<SocialButtons dividerText="o entra con tu email" />);

        fireEvent.click(screen.getByRole('button', { name: 'Continuar con GitHub' }));

        for (const button of screen.getAllByRole('button')) {
            expect((button as HTMLButtonElement).disabled).toBe(true);
        }
    });

    it('shows an error and enables the buttons again if it can not go to the provider', async () => {
        auth.logInWithProvider = vi.fn().mockRejectedValue(new Error('Network error'));
        render(<SocialButtons dividerText="o entra con tu email" />);

        fireEvent.click(screen.getByRole('button', { name: 'Continuar con GitHub' }));

        expect((await screen.findByRole('alert')).textContent).toBe(
            'No se ha podido abrir el inicio de sesión. Revisa tu conexión y vuelve a intentarlo.',
        );
        const button = screen.getByRole('button', { name: 'Continuar con GitHub' }) as HTMLButtonElement;
        expect(button.disabled).toBe(false);
    });
});