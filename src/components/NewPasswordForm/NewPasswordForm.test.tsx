// @vitest-environment jsdom
import { AuthApiError } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MIN_PASSWORD_LENGTH } from '../../auth/password/validateNewPassword';
import NewPasswordForm from './NewPasswordForm';

const { updatePassword } = vi.hoisted(() => ({ updatePassword: vi.fn() }));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'ana@example.com' },
        loading: false,
        signUp: vi.fn(),
        logIn: vi.fn(),
        logOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword,
    }),
}));

const PASSWORD = 'newSecret123';

function fillForm(password: string, confirmPassword: string) {
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: password } });
    fireEvent.change(screen.getByLabelText('Repite la nueva contraseña'), { target: { value: confirmPassword } });
}

function submit() {
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
}

describe('NewPasswordForm', () => {
    beforeEach(() => {
        updatePassword.mockReset();
    });

    afterEach(cleanup);

    it('calls updatePassword with the new password', async () => {
        updatePassword.mockResolvedValue(undefined);
        render(<NewPasswordForm />);

        fillForm(PASSWORD, PASSWORD);
        submit();

        await waitFor(() => expect(updatePassword).toHaveBeenCalledWith(PASSWORD));
    });

    it('shows a success message and empties the fields', async () => {
        updatePassword.mockResolvedValue(undefined);
        render(<NewPasswordForm />);

        fillForm(PASSWORD, PASSWORD);
        submit();

        expect((await screen.findByRole('status')).textContent).toBe('Tu contraseña se ha cambiado.');
        expect((screen.getByLabelText('Nueva contraseña') as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText('Repite la nueva contraseña') as HTMLInputElement).value).toBe('');
    });

    it('shows the rule and does not call updatePassword when the password is too short', () => {
        const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);
        render(<NewPasswordForm />);

        fillForm(short, short);
        submit();

        expect(screen.getByRole('alert').textContent).toBe(
            `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        );
        expect(updatePassword).not.toHaveBeenCalled();
    });

    it('shows an error and does not call updatePassword when the passwords do not match', () => {
        render(<NewPasswordForm />);

        fillForm(PASSWORD, PASSWORD + 'x');
        submit();

        expect(screen.getByRole('alert').textContent).toBe('Las contraseñas no coinciden.');
        expect(updatePassword).not.toHaveBeenCalled();
    });

    it('shows the message when the new password is the same as before', async () => {
        updatePassword.mockRejectedValue(new AuthApiError('New password should be different', 422, 'same_password'));
        render(<NewPasswordForm />);

        fillForm(PASSWORD, PASSWORD);
        submit();

        expect((await screen.findByRole('alert')).textContent).toBe(
            'La nueva contraseña tiene que ser distinta de la actual.',
        );
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('disables the button while saving', async () => {
        updatePassword.mockReturnValue(new Promise(() => {}));
        render(<NewPasswordForm />);

        fillForm(PASSWORD, PASSWORD);
        submit();

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Guardar contraseña' }).hasAttribute('disabled')).toBe(true),
        );
    });
});