// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AuthPage from './AuthPage';

// The forms use useAuth, but these tests only check which card is in
// front, so a fake hook is enough and no AuthProvider is needed.
vi.mock('../../auth/context/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signUp: vi.fn(), logIn: vi.fn(), logOut: vi.fn() }),
}));

// Shows the current path, so the tests can check that the URL changed.
function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
      <CurrentPath />
    </MemoryRouter>,
  );
}

// A card is in front when its form is not inside an inert element.
function isInFront(heading: string) {
  return screen.getByRole('heading', { name: heading }).closest('[inert]') === null;
}

describe('AuthPage', () => {
  afterEach(cleanup);

  it('puts log in in front on /login', () => {
    renderAt('/login');

    expect(isInFront('Iniciar sesión')).toBe(true);
    expect(isInFront('Crear cuenta')).toBe(false);
  });

  it('puts sign up in front on /signup', () => {
    renderAt('/signup');

    expect(isInFront('Crear cuenta')).toBe(true);
    expect(isInFront('Iniciar sesión')).toBe(false);
  });

  it('switches to sign up from the spine and updates the URL', () => {
    renderAt('/login');

    fireEvent.click(screen.getByRole('button', { name: 'Ir a crear cuenta' }));

    expect(isInFront('Crear cuenta')).toBe(true);
    expect(isInFront('Iniciar sesión')).toBe(false);
    expect(screen.getByTestId('path').textContent).toBe('/signup');
  });

  it('switches back to log in from the spine and updates the URL', () => {
    renderAt('/signup');

    fireEvent.click(screen.getByRole('button', { name: 'Ir a iniciar sesión' }));

    expect(isInFront('Iniciar sesión')).toBe(true);
    expect(screen.getByTestId('path').textContent).toBe('/login');
  });

  it('makes only the back card spine usable', () => {
    renderAt('/login');

    expect(screen.getByRole('button', { name: 'Ir a crear cuenta' }).hasAttribute('inert')).toBe(false);
    expect(screen.getByRole('button', { name: 'Ir a iniciar sesión' }).hasAttribute('inert')).toBe(true);
  });

  it('links back to the game from the title', () => {
    renderAt('/login');

    expect(screen.getByRole('link', { name: 'Calculetra' }).getAttribute('href')).toBe('/');
  });
});
