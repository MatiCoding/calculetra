// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from './auth/api/auth';
import { fakeDialog } from './test/fakeDialog';

// The game is wrapped in AuthProvider, which would create the real Supabase
// client. CI has no .env, so we replace the auth module with a fake one.
vi.mock('./auth/api/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
  onAuthChange: vi.fn(() => () => {}),
  signUp: vi.fn(),
  logIn: vi.fn(),
  logOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  changeEmail: vi.fn(),
  deleteAccount: vi.fn(),
  logInWithProvider: vi.fn(),
}));

async function renderRoot(flag: string | undefined) {
  vi.stubEnv('VITE_UNDER_CONSTRUCTION', flag);
  vi.resetModules();
  const { default: Root } = await import('./Root');
  render(<Root />);
}

describe('Root', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('shows only the under construction page when the flag is on', async () => {
    await renderRoot('true');

    expect(screen.getByText('🚧 En construcción')).toBeTruthy();
    expect(screen.queryByText(/Reto nº \d+/)).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('shows the home page when the flag is not set', async () => {
    await renderRoot(undefined);

    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
    expect(screen.queryByText('🚧 En construcción')).toBeNull();
  });

  it('shows the home page when the flag is "false"', async () => {
    await renderRoot('false');

    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
    expect(screen.queryByText('🚧 En construcción')).toBeNull();
  });
});
describe('Root, deleting the account', () => {
  beforeAll(fakeDialog);
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    window.history.replaceState(null, '', '/');
  });

  // The whole app with the real AuthProvider and router, so it checks that
  // logging out after deleting does not end on /login (see RequireAuth).
  it('goes to the home page with a message, logged out', async () => {
    vi.stubEnv('VITE_UNDER_CONSTRUCTION', 'false');
    vi.resetModules();
    // After resetModules the fake auth module is created again, so take it now.
    const auth = await import('./auth/api/auth');
    let changeUser: (user: AuthUser | null) => void = () => {};
    vi.mocked(auth.getCurrentUser).mockResolvedValue({ id: '1', email: 'ana@example.com', hasPassword: true });
    vi.mocked(auth.onAuthChange).mockImplementation((callback) => {
      changeUser = callback;
      return () => {};
    });
    vi.mocked(auth.deleteAccount).mockResolvedValue(undefined);
    // Like Supabase: logging out tells onAuthChange that there is no user.
    vi.mocked(auth.logOut).mockImplementation(async () => changeUser(null));
    window.history.replaceState(null, '', '/account');
    const { default: Root } = await import('./Root');
    render(<Root />);

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar cuenta' }));
    fireEvent.change(screen.getByLabelText('Tu correo'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));

    expect((await screen.findByRole('dialog')).textContent).toContain('Tu cuenta se ha eliminado.');
    expect(window.location.pathname).toBe('/');
    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy();
  });
});