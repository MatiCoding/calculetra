// @vitest-environment jsdom
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeEmailForm from './ChangeEmailForm';

const { changeEmail } = vi.hoisted(() => ({ changeEmail: vi.fn() }));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'ana@example.com' },
        loading: false,
        signUp: vi.fn(),
        logIn: vi.fn(),
        logOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        changeEmail,
    }),
}));

const NEW_EMAIL = 'ana.nueva@example.com';

function fillEmail(email: string) {
    fireEvent.change(screen.getByLabelText('Correo nuevo'), { target: { value: email } });
}

function submit() {
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar correo' }));
}

describe('ChangeEmailForm', () => {
    beforeEach(() => {
        changeEmail.mockReset();
    });

    afterEach(cleanup);

    it('calls changeEmail with the new email, without spaces around it', async () => {
        changeEmail.mockResolvedValue(undefined);
        render(<ChangeEmailForm />);

        fillEmail(`  ${NEW_EMAIL} `);
        submit();

        await waitFor(() => expect(changeEmail).toHaveBeenCalledWith(NEW_EMAIL));
    });

    it('explains that the change has to be confirmed from the email links and empties the field', async () => {
        changeEmail.mockResolvedValue(undefined);
        render(<ChangeEmailForm />);

        fillEmail(NEW_EMAIL);
        submit();

        expect((await screen.findByRole('status')).textContent).toContain(
            'Te hemos enviado un enlace para confirmar el cambio',
        );
        expect((screen.getByLabelText('Correo nuevo') as HTMLInputElement).value).toBe('');
    });

    it('shows an error and does not call changeEmail when the email is not valid', () => {
        render(<ChangeEmailForm />);

        // "ana@" would be stopped by the browser (type="email"), so this one only fails our own check.
        fillEmail('ana@example');
        submit();

        expect(screen.getByRole('alert').textContent).toBe('Introduce un email válido.');
        expect(changeEmail).not.toHaveBeenCalled();
    });

    it('shows an error and does not call changeEmail when the email is the current one', () => {
        render(<ChangeEmailForm />);

        fillEmail('Ana@Example.com');
        submit();

        expect(screen.getByRole('alert').textContent).toBe('El correo nuevo tiene que ser distinto del actual.');
        expect(changeEmail).not.toHaveBeenCalled();
    });

    it('shows the message when the email is already in use', async () => {
        changeEmail.mockRejectedValue(new AuthApiError('Email address already registered', 422, 'email_exists'));
        render(<ChangeEmailForm />);

        fillEmail(NEW_EMAIL);
        submit();

        expect((await screen.findByRole('alert')).textContent).toBe('Ya existe una cuenta con este correo.');
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows the message when there is no connection', async () => {
        changeEmail.mockRejectedValue(new AuthRetryableFetchError('Failed to fetch', 0));
        render(<ChangeEmailForm />);

        fillEmail(NEW_EMAIL);
        submit();

        expect((await screen.findByRole('alert')).textContent).toBe(
            'No se ha podido conectar. Revisa tu conexión a internet y vuelve a probar.',
        );
    });

    it('disables the button while sending', async () => {
        changeEmail.mockReturnValue(new Promise(() => {}));
        render(<ChangeEmailForm />);

        fillEmail(NEW_EMAIL);
        submit();

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Cambiar correo' }).hasAttribute('disabled')).toBe(true),
        );
    });
});