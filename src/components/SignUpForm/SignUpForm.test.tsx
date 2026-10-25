// @vitest-environment jsdom
import { AuthApiError } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SignUpForm from './SignUpForm';
import { MIN_PASSWORD_LENGTH } from '../../auth/password/validateNewPassword';

// vi.mock is moved to the top of the file before anything else runs, so the
// fake signUp has to be created with vi.hoisted to exist by then.
const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));

// The form only needs signUp from useAuth. With a fake hook we decide what
// signUp returns in each test and never touch Supabase.
vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({ user: null, loading: false, signUp, logIn: vi.fn() }),
}));

const EMAIL = 'ana@example.com';
const PASSWORD = 'secret123';

// The form lives on /signup. The home route lets us check the redirect.
function renderForm() {
    render(
        <MemoryRouter initialEntries={['/signup']}>
            <Routes>
                <Route path="/" element={<p>Página principal</p>} />
                <Route path="/signup" element={<SignUpForm />} />
            </Routes>
        </MemoryRouter>,
    );
}

function fillForm(email: string, password: string, confirmPassword: string) {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
    fireEvent.change(screen.getByLabelText('Repite la contraseña'), { target: { value: confirmPassword } });
}

function submit() {
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

describe('SignUpForm', () => {
    beforeEach(() => {
        signUp.mockReset();
    });

    afterEach(cleanup);

    it('calls signUp with the trimmed email and the password', async () => {
        signUp.mockResolvedValue(null);
        renderForm();

        fillForm(`  ${EMAIL} `, PASSWORD, PASSWORD);
        submit();

        await waitFor(() => expect(signUp).toHaveBeenCalledWith(EMAIL, PASSWORD));
    });

    it('shows an error and does not call signUp when the passwords do not match', () => {
        renderForm();

        fillForm(EMAIL, PASSWORD, 'different1');
        submit();

        expect(screen.getByRole('alert').textContent).toBe('Las contraseñas no coinciden.');
        expect(signUp).not.toHaveBeenCalled();
    });

    it('shows the provider error to the user', async () => {
        signUp.mockRejectedValue(new AuthApiError('User already registered', 422, 'user_already_exists'));
        renderForm();

        fillForm(EMAIL, PASSWORD, PASSWORD);
        submit();

        expect((await screen.findByRole('alert')).textContent).toBe(
            'Ya existe una cuenta con este email. Inicia sesión o usa otro email.',
        );
    });

    it('asks the user to check their inbox when the email must be confirmed', async () => {
        signUp.mockResolvedValue(null);
        renderForm();

        fillForm(EMAIL, PASSWORD, PASSWORD);
        submit();

        expect((await screen.findByRole('status')).textContent).toContain(EMAIL);
        expect(screen.queryByRole('button', { name: 'Crear cuenta' })).toBeNull();
    });

    it('goes to the home page when the user is logged in right away', async () => {
        signUp.mockResolvedValue({ id: '1', email: EMAIL });
        renderForm();

        fillForm(EMAIL, PASSWORD, PASSWORD);
        submit();

        expect(await screen.findByText('Página principal')).toBeTruthy();
    });

    it('disables the button while the request is in progress', async () => {
        // A promise we resolve by hand, so the request stays "in progress".
        let finish: (value: null) => void = () => {};
        signUp.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
        renderForm();

        fillForm(EMAIL, PASSWORD, PASSWORD);
        submit();

        const button = screen.getByRole('button', { name: 'Crear cuenta' }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);

        finish(null);
        await screen.findByRole('status');
    });

    it('shows its title', () => {
        renderForm();

        expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeTruthy();
    });

    it('links to the log in page', () => {
        renderForm();

        expect(screen.getByRole('link', { name: 'Iniciar sesión' }).getAttribute('href')).toBe('/login');
    });

    it('tells the user the minimum password length', () => {
        renderForm();

        const hint = screen.getByText(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`);
        expect(screen.getByLabelText('Contraseña').getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('can show both passwords', () => {
        renderForm();

        expect(screen.getAllByRole('button', { name: 'Mostrar contraseña' })).toHaveLength(2);
    });
});
