// @vitest-environment jsdom
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm';

const { resetPassword } = vi.hoisted(() => ({ resetPassword: vi.fn() }));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({
        user: null,
        loading: false,
        signUp: vi.fn(),
        logIn: vi.fn(),
        logOut: vi.fn(),
        resetPassword,
        updatePassword: vi.fn(),
    }),
}));

const EMAIL = 'ana@example.com';
const SENT_MESSAGE = `Si existe una cuenta con ${EMAIL}, te llegará un enlace para elegir una contraseña nueva.`;

function renderForm() {
    render(<MemoryRouter><ForgotPasswordForm /></MemoryRouter>);
}

function sendEmail(email: string) {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));
}

describe('ForgotPasswordForm', () => {
    beforeEach(() => {
        resetPassword.mockReset();
    });

    afterEach(cleanup);

    it('calls resetPassword with the trimmed email', async () => {
        resetPassword.mockResolvedValue(undefined);
        renderForm();

        sendEmail(`  ${EMAIL} `);

        await waitFor(() => expect(resetPassword).toHaveBeenCalledWith(EMAIL));
    });

    it('shows the "check your email" message after sending', async () => {
        resetPassword.mockResolvedValue(undefined);
        renderForm();

        sendEmail(EMAIL);

        expect((await screen.findByRole('status')).textContent).toBe(SENT_MESSAGE);
    });

    it('shows the same message when Supabase answers with an error', async () => {
        // A "too many attempts" message could tell someone the account exists.
        resetPassword.mockRejectedValue(
            new AuthApiError('Email rate limit exceeded', 429, 'over_email_send_rate_limit'),
        );
        renderForm();

        sendEmail(EMAIL);

        expect((await screen.findByRole('status')).textContent).toBe(SENT_MESSAGE);
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('shows an error when there is no connection', async () => {
        resetPassword.mockRejectedValue(new AuthRetryableFetchError('Failed to fetch', 0));
        renderForm();

        sendEmail(EMAIL);

        expect((await screen.findByRole('alert')).textContent).toBe(
            'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.',
        );
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows an error and does not call resetPassword when the email is empty', () => {
        renderForm();

        sendEmail('   ');

        expect(screen.getByRole('alert').textContent).toBe('Introduce tu email.');
        expect(resetPassword).not.toHaveBeenCalled();
    });

    it('disables the button while sending', async () => {
        resetPassword.mockReturnValue(new Promise(() => {}));
        renderForm();

        sendEmail(EMAIL);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Enviar enlace' }).hasAttribute('disabled')).toBe(true),
        );
    });
});