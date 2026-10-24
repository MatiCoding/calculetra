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

  it('shows the game on /', () => {
    renderAt('/');

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });

  it('shows the sign up page on /signup', () => {
    renderAt('/signup');

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

    it('goes to the log in page from the header link', () => {
    renderAt('/');

    fireEvent.click(screen.getByRole('link', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('goes to the sign up page from the log in page', () => {
    renderAt('/login');

    fireEvent.click(screen.getByRole('link', { name: 'Crea una' }));

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
  });

  it('goes back to the game from the title link', () => {
    renderAt('/signup');

    fireEvent.click(screen.getByRole('link', { name: 'Calculetra' }));

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
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
    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });

  it.each(['/', '/signup', '/login'])('does not show the 404 page on %s', (path) => {
    renderAt(path);

    expect(screen.queryByRole('heading', { name: 'Esta página no existe' })).toBeNull();
  });

    it.each(['/login', '/signup'])('does not show the site header on %s', (path) => {
    renderAt(path);

    expect(screen.queryByRole('banner')).toBeNull();
  });

  it.each(['/', '/forgot-password', '/esto-no-existe'])('shows the site header on %s', (path) => {
    renderAt(path);

    expect(screen.getByRole('banner')).toBeTruthy();
  });
});