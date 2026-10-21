// @vitest-environment jsdom
import { AuthApiError } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogInForm from './LogInForm';

// Same trick as in SignUpForm.test.tsx: the fake logIn must exist before
// vi.mock runs, so it is created with vi.hoisted.
const { logIn } = vi.hoisted(() => ({ logIn: vi.fn() }));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({ user: null, loading: false, signUp: vi.fn(), logIn, logOut: vi.fn() }),
}));

const EMAIL = 'ana@example.com';
const PASSWORD = 'secret123';

// The form lives on /login. The home route lets us check the redirect.
function renderForm() {
    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/" element={<p>Página principal</p>} />
                <Route path="/login" element={<LogInForm />} />
            </Routes>
        </MemoryRouter>,
    );
}

function fillForm(email: string, password: string) {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
}

function submit() {
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LogInForm', () => {
    beforeEach(() => {
        logIn.mockReset();
    });

    afterEach(cleanup);

    it('calls logIn with the trimmed email and the password', async () => {
        logIn.mockResolvedValue({ id: '1', email: EMAIL });
        renderForm();

        fillForm(`  ${EMAIL} `, PASSWORD);
        submit();

        await waitFor(() => expect(logIn).toHaveBeenCalledWith(EMAIL, PASSWORD));
    });

    it('goes to the home page after logging in', async () => {
        logIn.mockResolvedValue({ id: '1', email: EMAIL });
        renderForm();

        fillForm(EMAIL, PASSWORD);
        submit();

        expect(await screen.findByText('Página principal')).toBeTruthy();
    });

    it.each([
        ['the email', '   ', PASSWORD],
        ['the password', EMAIL, ''],
    ])('shows an error and does not call logIn when %s is empty', (_field, email, password) => {
        renderForm();

        fillForm(email, password);
        submit();

        expect(screen.getByRole('alert').textContent).toBe('Introduce tu email y tu contraseña.');
        expect(logIn).not.toHaveBeenCalled();
    });

    it('shows the message for wrong credentials', async () => {
        logIn.mockRejectedValue(new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'));
        renderForm();

        fillForm(EMAIL, 'wrong-password');
        submit();

        expect((await screen.findByRole('alert')).textContent).toBe(
            'Correo electrónico o contraseña incorrectos. Vuelve a intentarlo.',
        );
        // A failed login stays on the form.
        expect(screen.queryByText('Página principal')).toBeNull();
    });

    it('disables the button while logging in', async () => {
        // A promise that never resolves keeps the form in "submitting".
        logIn.mockReturnValue(new Promise(() => {}));
        renderForm();

        fillForm(EMAIL, PASSWORD);
        submit();

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Iniciar sesión' }).hasAttribute('disabled')).toBe(true),
        );
    });

    it('links to the sign up page', () => {
        renderForm();

        expect(screen.getByRole('link', { name: 'Crea una' }).getAttribute('href')).toBe('/signup');
    });
    
    it('links to the password reset page', () => {
        renderForm();

        expect(screen.getByRole('link', { name: '¿Has olvidado tu contraseña?' }).getAttribute('href')).toBe(
            '/forgot-password',
        );
    });
});
