// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fakeDialog } from './test/fakeDialog';
import App from './App';

// SignUpForm uses useAuth, but these tests only check navigation,
// so a fake hook is enough and no AuthProvider is needed.
vi.mock('./auth/context/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signUp: vi.fn(), logIn: vi.fn(), logOut: vi.fn() }),
}))

// MemoryRouter keeps the URL in memory, so each test chooses the page it
// starts on. The last entry in initialEntries is the current page.
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  beforeAll(fakeDialog);
  afterEach(cleanup);

  it('shows the home page on /, not the game', () => {
    renderAt('/');

    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

  it('shows the Cifras game on /cifras', () => {
    renderAt('/cifras');

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });

  it('opens the Cifras game from its card on the home page', () => {
    renderAt('/');

    fireEvent.click(screen.getByRole('button', { name: /Cifras/ }));

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });

  it('does not show the button to switch game any more', () => {
    renderAt('/cifras');

    expect(screen.queryByRole('button', { name: /Cambiar a/ })).toBeNull();
  });

  it('shows the sign up page on /signup', () => {
    renderAt('/signup');

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

    it('goes to the log in page from the header link', () => {
    renderAt('/');

    fireEvent.click(screen.getByRole('link', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('heading', { name: 'Hola de nuevo' })).toBeTruthy();
  });

  it('goes to the sign up page from the log in page', () => {
    renderAt('/login');

    fireEvent.click(screen.getByRole('link', { name: 'Crear cuenta' }));

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeTruthy();
  });

  it('goes back to the home page from the title link', () => {
    renderAt('/cifras');

    fireEvent.click(screen.getByRole('link', { name: 'Calculetra' }));

    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

    it('shows the 404 page on an unknown route', () => {
    renderAt('/esto-no-existe');

    expect(screen.getByRole('heading', { name: 'Esta página no existe' })).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

  it('shows the notice left by another page on /', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { notice: 'Tu cuenta se ha eliminado.' } }]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog', { name: 'Tu cuenta se ha eliminado.' })).toBeTruthy();
    expect(screen.getByText(/Reto nº \d+/)).toBeTruthy();
  });

  it.each(['/', '/cifras', '/signup', '/login'])('does not show the 404 page on %s', (path) => {
    renderAt(path);

    expect(screen.queryByRole('heading', { name: 'Esta página no existe' })).toBeNull();
  });

  it.each(['/login', '/signup', '/esto-no-existe'])('does not show the site header on %s', (path) => {
    renderAt(path);

    expect(screen.queryByRole('banner')).toBeNull();
  });

  it.each(['/', '/cifras', '/forgot-password'])('shows the site header on %s', (path) => {
    renderAt(path);

    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('shows the privacy policy on /privacy without logging in', () => {
    renderAt('/privacy');
 
    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeTruthy();
  });
 
  it('goes to the privacy policy from the footer link', () => {
    renderAt('/');
 
    fireEvent.click(screen.getByRole('link', { name: 'Privacidad' }));
 
    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeTruthy();
  });
});