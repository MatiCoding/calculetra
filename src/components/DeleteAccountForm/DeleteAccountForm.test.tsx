// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteAccountForm from './DeleteAccountForm';

const { deleteAccount, logOut } = vi.hoisted(() => ({ deleteAccount: vi.fn(), logOut: vi.fn() }));

vi.mock('../../auth/context/useAuth', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'ana@example.com' },
        loading: false,
        signUp: vi.fn(),
        logIn: vi.fn(),
        logOut,
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        changeEmail: vi.fn(),
        deleteAccount,
    }),
}));

// A fake home page that shows the notice it receives, so the tests can check
// where the form navigates and with which message.
function Home() {
    const { state } = useLocation();
    return <p>Inicio: {state?.notice}</p>;
}

function renderForm() {
    render(
        <MemoryRouter initialEntries={['/account']}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/account" element={<DeleteAccountForm />} />
            </Routes>
        </MemoryRouter>,
    );
}

function openConfirmation() {
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));
}

function fillEmail(email: string) {
    fireEvent.change(screen.getByLabelText('Tu correo'), { target: { value: email } });
}

function confirm() {
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
}

describe('DeleteAccountForm', () => {
    beforeEach(() => {
        deleteAccount.mockReset();
        logOut.mockReset();
        logOut.mockResolvedValue(undefined);
    });

    afterEach(cleanup);

    it('only shows the delete button at first', () => {
        renderForm();

        expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
        expect(screen.queryByLabelText('Tu correo')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Eliminar definitivamente' })).toBeNull();
    });

    it('does not delete anything with one click', () => {
        renderForm();

        openConfirmation();

        expect(deleteAccount).not.toHaveBeenCalled();
        expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeTruthy();
        expect(screen.getByLabelText('Tu correo')).toBeTruthy();
    });

    it('does not delete anything when the confirmation is cancelled', () => {
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(deleteAccount).not.toHaveBeenCalled();
        expect(screen.queryByLabelText('Tu correo')).toBeNull();
        expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeTruthy();
    });

    it('empties the field after cancelling', () => {
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        openConfirmation();

        expect((screen.getByLabelText('Tu correo') as HTMLInputElement).value).toBe('');
    });

    it('shows an error and does not delete when the email does not match', () => {
        renderForm();

        openConfirmation();
        fillEmail('otra@example.com');
        confirm();

        expect(screen.getByRole('alert').textContent).toBe('El correo no coincide con el de tu cuenta.');
        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('shows an error and does not delete when the email is empty', () => {
        renderForm();

        openConfirmation();
        confirm();

        expect(screen.getByRole('alert').textContent).toBe('El correo no coincide con el de tu cuenta.');
        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('deletes the account when the email matches, even with other capital letters or spaces', async () => {
        deleteAccount.mockResolvedValue(undefined);
        renderForm();

        openConfirmation();
        fillEmail('  Ana@Example.com ');
        confirm();

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledOnce());
    });

    it('logs the user out after deleting', async () => {
        deleteAccount.mockResolvedValue(undefined);
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        confirm();

        await waitFor(() => expect(logOut).toHaveBeenCalledOnce());
    });

    it('still goes to the home page when logging out fails, because the account is already deleted', async () => {
        deleteAccount.mockResolvedValue(undefined);
        logOut.mockRejectedValue(new Error('Failed to fetch'));
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        confirm();

        expect(await screen.findByText(/Inicio:/)).toBeTruthy();
    });

    it('goes to the home page with a message after deleting', async () => {
        deleteAccount.mockResolvedValue(undefined);
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        confirm();

        expect((await screen.findByText(/Inicio:/)).textContent).toBe(
            'Inicio: Tu cuenta se ha eliminado. Puedes seguir jugando sin cuenta.',
        );
    });

    it('shows an error and stays on the page when deleting fails', async () => {
        deleteAccount.mockRejectedValue(new Error('Failed to fetch'));
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        confirm();

        expect((await screen.findByRole('alert')).textContent).toBe(
            'No se ha podido eliminar la cuenta. Revisa tu conexión a internet y vuelve a probar.',
        );
        expect(screen.queryByText(/Inicio:/)).toBeNull();
        expect(logOut).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Eliminar definitivamente' }).hasAttribute('disabled')).toBe(false);
    });

    it('disables the buttons while deleting', async () => {
        deleteAccount.mockReturnValue(new Promise(() => {}));
        renderForm();

        openConfirmation();
        fillEmail('ana@example.com');
        confirm();

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Eliminar definitivamente' }).hasAttribute('disabled')).toBe(true),
        );
        expect(screen.getByRole('button', { name: 'Cancelar' }).hasAttribute('disabled')).toBe(true);
    });
});