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
});